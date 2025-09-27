const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../../generated/prisma");
const { createClient } = require("@clickhouse/client");
const path = require("path");

const { authMiddleware } = require("../../middlewares/auth");

const prisma = new PrismaClient();

const client = createClient({
  host: process.env.CLICKHOUSE_HOST,
  username: "avnadmin",
  password: process.env.CLICKHOUSE_PASSWORD,
  database: "default",
});

router.use(authMiddleware);

router.get("/", authMiddleware, async (req, res) => {
  const deployments = await prisma.deployment.findMany({
    where: {
      project: {
        userId: req.user.userId,
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({ status: "success", data: { deployments } });
});

//#TODO: Deployment status to be sent along with logs
router.get("/logs", async (req, res) => {
  const { deploymentId, since } = req.query;
  console.log("fetch logs API:".deploymentId, since);
  if (!deploymentId) {
    return res
      .status(400)
      .json({ status: "error", message: "deploymentId is required" });
  }

  const query = `SELECT log, event_id, timestamp FROM log_events WHERE deployment_id = {deployment_id:String} AND timestamp >= parseDateTimeBestEffort({since:String}) ORDER BY timestamp ASC`;

  const data = await client.query({
    query: query,
    query_params: {
      deployment_id: deploymentId,
      since: since,
    },
    format: "JSON",
  });

  const rows = await data.json();

  console.log("clickhouse rows: ", rows);

  res.json(rows);
});

router.get("/project/:projectId", async (req, res) => {
  const deployments = await prisma.deployment.findMany({
    where: {
      projectId: req.params.projectId,
    },
    include: {
      project: true,
    },
  });
  res.status(200).json(deployments);
});

router.get("/status/:deploymentId", async (req, res) => {
  const response = await prisma.deployment.findFirst({
    where: {
      id: req.params.deploymentId,
    },
    select: {
      status: true
    },
  });

  res.json(response);
});

router.get("/:deploymentId", authMiddleware, async (req, res) => {
  try {
    const response = await prisma.deployment.findFirst({
      where: {
        id: req.params.deploymentId,
      },
      include: {
        project: true
      }
    });
    res.json(response);
  } catch (err) {
    console.log("Error fetching deployment: ", err);
  }
});

router.delete("/:deploymentId", authMiddleware, async (req, res) => {
  try {
    console.log("deleting: ", req.params.deploymentId);
    await prisma.deployment.delete({
      where: {
        id: req.params.deploymentId,
      },
    });

    const query = `ALTER TABLE log_events DELETE WHERE deployment_id = {deploymentId:String}`;
    await client.query({
      query: query,
      query_params: {
        deploymentId: req.params.deploymentId,
      },
    });
    res.status(200).json("Deleted deployment");
  } catch (err) {
    console.log("Error deleting deployment: ", err);
  }
});

module.exports = router;
