const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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
  await producer.send({topic: `container-logs`, messages: [{key: 'log', value: JSON.stringify({PROJECT_ID, DEPLOYMENT_ID, log})}]})
}

async function init() {
  //#TODO: Verify using head bucket command if S3 bucket exists
  await producer.connect();

  console.log("Executing script.js...");
  await publishLog("Build started...");

  const outputPath = path.join(__dirname, "output");

  await prisma.deployment.update({
    where: {
      id: DEPLOYMENT_ID,
    },
    data: {
      status: "BUILDING",
    },
  });

  const t = exec(`cd ${outputPath} && npm install && npm run build`);
  t.stdout.on("data", async (data) => {
    console.log(`stdout: ${data}`);
    await publishLog(data.toString());
  });

  t.stdout.on("error", async (data) => {
    console.error(`stderr: ${data}`);
    await publishLog(data.toString());
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
          });

          //#TODO: verify if folder is created in S3
      }
    } catch (error) {
        console.error('Error reading dist folder:', error);
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
        await prisma.deployment.update({
            where: {
              id: DEPLOYMENT_ID,
            },
            data: {
              status: "SUCCESSFUL",
            },
          });
        await publishLog(`Done uploading build files to S3.`);
    }

    process.exit(0);
  });
}

init();
