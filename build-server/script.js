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
      {
        key: "log",
        value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log, timestamp }),
      },
    ],
  });
}

async function validateBuildScript(projectPath) {
  const packagePath = path.join(projectPath, "package.json");
  if (!fs.existsSync(packagePath)) {
    await publishLog(`package.json not found at ${projectPath}`);
    throw new Error(`package.json not found at ${projectPath}`);
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
  const buildScript = pkg.scripts?.build;
  
  if (!buildScript) {
    await publishLog("No build script found");
    throw new Error(`No build script found`);
  }

  // Strict allowlist - exact matches only
  const allowedScripts = [
    "vite build",
    "next build",
    "react-scripts build",
    "tsc && vite build",
    "tsc && next build",
    "tsc -b && vite build",
    "tsc -b && next build",
  ];

  // Check for exact match first
  if (allowedScripts.includes(buildScript.trim())) {
    console.log("Build script validated successfully:", buildScript);
    return true;
  }

  // Comprehensive unsafe patterns
  const unsafePatterns = [
    /\brm\b/i,
    /\brmdir\b/i,
    /\bsudo\b/i,
    /\bchmod\b/i,
    /\bchown\b/i,
    /\bwget\b/i,
    /\bcurl\b/i,
    /\bscp\b/i,
    /\bssh\b/i,
    /\bexec\b/i,
    /\beval\b/i,
    /`/,                    // Backticks
    /\$\(/,                 // Command substitution
    />/,                    // Redirect
    /</,                    // Input redirect
    /\|/,                   // Pipe
    /;/,                    // Command separator
    /\|\|/,                 // OR operator
    /&&/,                   // AND operator (if not in allowlist)
    /&(?!&)/,               // Background execution
    /\bnode\s+-e\b/i,       // Node eval
    /\bpython\s+-c\b/i,     // Python exec
    /\bnpm\s+run\b/i,       // Can run arbitrary scripts
    /\byarn\s+run\b/i,      // Can run arbitrary scripts
    /\bexport\b/i,          // Environment manipulation
    /\bNODE_OPTIONS\b/i,    // Node options injection
    /\n/,                   // Newlines
  ];

  for (const pattern of unsafePatterns) {
    if (pattern.test(buildScript)) {
      await publishLog(`Malicious pattern detected: ${pattern}`);
      throw new Error(`Malicious pattern detected in: "${buildScript}"`);
    }
  }

  // If we reach here, script doesn't match allowlist
  console.warn(`Build script not in allowlist: "${buildScript}"`);
  await publishLog(`Build script not in allowlist: "${buildScript}"`);
  throw new Error("Build script not valid");
}

async function getBuildFolder(projectPath) {
  const packagePath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packagePath)) {
    await publishLog(`package.json not found at ${projectPath}`);
    throw new Error(`package.json not found at ${projectPath}`);
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (deps['next']) return '.next';
  if (deps['vite']) return 'dist';
  if (deps['react-scripts']) return 'build';

  // fallback: infer from build script
  const buildScript = pkg.scripts?.build || '';
  if (buildScript.includes('vite')) return 'dist';
  if (buildScript.includes('next')) return '.next';
  if (buildScript.includes('react-scripts')) return 'build';

  throw new Error('Unable to detect build folder.');
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

  //validate build script
  //get the build files folder
  let buildFolder = "";
  try {
    const isBuildScriptValid = await validateBuildScript(outputPath);
    if(!isBuildScriptValid) {
      throw new Error("Build script not valid");
    }
    buildFolder = await getBuildFolder(outputPath);
  } catch (error) {
    console.log(error);
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
      const distPath = path.join(__dirname, "output", buildFolder);

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
      await publishLog(`App deployed successfully.`);
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
      await publishLog(`Deployment failed.`);
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
