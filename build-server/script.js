const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const { Kafka } = require("kafkajs");
const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'access',
        secretAccessKey: 'secret',
    }
});

const PROJECT_ID = process.env.PROJECT_ID;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;

const kafka = new Kafka({
  clientId: `docker-build-server-${DEPLOYMENT_ID}`,
  brokers: ['kafka-2f'],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
  },
  sasl: {
    username: 'avnadmin',
    password: 'pass',
    mechanism: 'plain',
  }
});

const producer = kafka.producer();

async function publishLog(log) {
  console.log("Publishing log:", log);
  const timestamp = new Date();
  await producer.send({
    topic: `container-logs`,
    messages: [
      { key: "log", value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log, timestamp}) },
    ],
  });
}

async function init() {
  await producer.connect();

  try {
    const command = new HeadBucketCommand({ Bucket: "vercel-like-project" });
    const response = await s3Client.send(command);
    console.log("Bucket exists and is accessible: ", response);
    await publishLog(`Prepared to build and upload files to S3.`);
  } catch (error) {
    await publishLog(`Error accessing S3 bucket: ${error}`);
    await publishLog(`Build failed.`);
    await prisma.deployment.update({
      where: {
        id: DEPLOYMENT_ID,
      },
      data: {
        status: "FAILED",
      },
    });
    process.exit(0);
  }

  await prisma.deployment.update({
    where: {
      id: DEPLOYMENT_ID,
    },
    data: {
      status: "BUILDING",
    },
  });

  console.log("Executing script.js...");
  await publishLog("Build started...");

  const outputPath = path.join(__dirname, "output");

  const t = exec(`cd ${outputPath} && npm install && npm run build`);
  t.stdout.on("data", async (data) => {
    console.log(`stdout: ${data}`);
    await publishLog(data.toString());
  });

  t.stdout.on("error", async (data) => {
    console.error(`stderr: ${data}`);
    await publishLog(data.toString());
    await publishLog(`Build failed.`);
  });

  t.on("close", async function () {
    console.log("Build completed.");
    await publishLog("Build completed.");

    try {
      const distPath = path.join(__dirname, "output", "dist");

      const distFolderContents = fs.readdirSync(distPath, { recursive: true });

      for (const file of distFolderContents) {
        const filePath = path.join(distPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          continue;
        }

        console.log(`Uploading ${filePath} to S3...`);
        await publishLog(`Uploading ${filePath} to S3...`);

        const command = new PutObjectCommand({
          Bucket: "vercel-like-project",
          Key: `__outputs/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mime.lookup(filePath),
        });

        await s3Client
          .send(command)
          .then(async () => {
            console.log(`Uploaded ${filePath} to S3`);
            await publishLog(`Uploaded ${filePath} to S3`);
          })
          .catch(async (error) => {
            console.error(`Error uploading ${filePath}:`, error);
            await publishLog(`Error uploading ${filePath}: ${error.message}`);
            //#TODO: stop upload and update status as failed if any file fails to upload
            await prisma.deployment.update({
              where: {
                id: DEPLOYMENT_ID,
              },
              data: {
                status: "FAILED",
              },
            });
            process.exit(0);
          });
      }
      //#TODO: verify if folder is created in S3
      await publishLog(`Done uploading build files to S3.`);
      await prisma.deployment.update({
        where: {
          id: DEPLOYMENT_ID,
        },
        data: {
          status: "SUCCESSFUL",
        },
      });
    } catch (error) {
      console.error("Error reading dist folder:", error);
      await publishLog(`Build failed.`);
      await publishLog(`Error reading dist folder: ${error.message}`);
      await prisma.deployment.update({
        where: {
          id: DEPLOYMENT_ID,
        },
        data: {
          status: "FAILED",
        },
      });
    } finally {
      await producer.disconnect();
    }

    process.exit(0);
  });
}

init();
