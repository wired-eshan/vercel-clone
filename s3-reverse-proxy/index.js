const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { PrismaClient } = require("./generated/prisma");
const { analyticsMiddleware } = require("./middlewares/analytics");
const { Kafka, Partitioners } = require("kafkajs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8000;

const prisma = new PrismaClient();

const kafka = new Kafka({
  clientId: `analytics`,
  brokers: [process.env.KAFKA_BROKER_1],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
  },
  sasl: {
    username: 'avnadmin',
    password: process.env.KAFKA_SASL_PASSWORD,
    mechanism: 'plain',
  }
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

(async () => {
  try {
    await producer.connect();
    console.log("Kafka producer connected successfully");
  } catch (error) {
    console.error("Failed to connect Kafka producer:", error);
  }
})();

app.use(analyticsMiddleware);

async function publishAnalytics(analyticsData) {
  console.log("Publishing analytics: ", analyticsData);
  const { lat, lon, country, city, projectId } = analyticsData;
  const timestamp = new Date();

  try {
    await producer.send({
      topic: `analytics`,
      messages: [
        {
          key: "analytic",
          value: JSON.stringify({ lat, lon, country, city, projectId, timestamp }),
        },
      ],
    });
    console.log("Message published successfully");
  } catch (error) {
    console.error("Failed to publish message:", error);
  }
}

app.use("/", async (req, res, next) => {
  console.log(`Received request for: ${req.url}`);

  const targetUrl = `https://vercel-like-project.s3.ap-south-1.amazonaws.com`;

  const host = req.hostname.split(".")[0];
  const project = await prisma.project.findFirst({
    where: {
      subDomain: host,
    },
    select: {
      id: true,
    },
  });
  const subdomain = project.id;

  console.log("creating proxy middleware");
  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      if (path === "/") {
        return `/__outputs/${subdomain}/index.html`;
      }
      return `/__outputs/${subdomain}${path}`;
    },
  });
  console.log(`Proxying request to: ${targetUrl}${req.url}`);

  if (req.analytics) {
    const { lat, lon, country, city } = req.analytics;
    await prisma.analytic.create({
      data: {
        lat: lat.toString(),
        lon: lon.toString(),
        country: country,
        city: city,
        project: { connect: { id: project.id } },
      }
    });

    await publishAnalytics({
        lat: lat.toString(),
        lon: lon.toString(),
        country: country,
        city: city,
        project: project.id,
    });
  }

  return proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
