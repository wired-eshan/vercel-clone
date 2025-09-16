const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const { z } = require('zod');
const { PrismaClient } = require('../../generated/prisma');
const { createClient } = require("@clickhouse/client");

const dotenv = require('dotenv');
dotenv.config();

router.use(authMiddleware);

const prisma = new PrismaClient();

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ECS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ECS_SECRET_ACCESS_KEY,        
    }
});

const ecsConfig = {
    cluster: process.env.AWS_ECS_CLUSTER,
    task: process.env.AWS_ECS_TASK
};

const client = createClient({
  host: process.env.CLICKHOUSE_HOST,
  username: "avnadmin",
  password: process.env.CLICKHOUSE_PASSWORD,
  database: "default",
});

router.post('/create', authMiddleware, async (req, res) => {
    const schema = z.object({
        gitUrl : z.string()
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const { gitUrl } = validation.data;
    const name = gitUrl.split('/')[4];

    const existingProject = await prisma.project.findFirst({
        where: { gitUrl }
    });

    if (existingProject) {
        return res.json({status: 'success', data: {project: existingProject}});
    }

    const project = await prisma.project.create({
        data: {
            name,
            gitUrl,
            subDomain : generateSlug(),
            userId: req.user.userId,
        }
    });
    return res.json({status: 'success', data: {project}});
});

router.post('/upload', authMiddleware, async (req, res) => {
    const { projectId } = req.body;

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    //return error if project already has a deployment status QUEUEUED or BUILDING
    const existingDeployment = await prisma.deployment.findFirst({
        where: {
            projectId: project.id,
            OR: [
                { status: 'QUEUED' },
                { status: 'BUILDING' }
            ]
        }
    });
    if (existingDeployment) {
        return res.status(400).json({ error: 'Project is already queued for build' });
    }

    const deployment = await prisma.deployment.create({
        data: {
            project : { connect: { id: project.id } },
            status: 'QUEUED',
        }
    });

    const command = new RunTaskCommand({
        cluster: ecsConfig.cluster,
        taskDefinition: ecsConfig.task,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ['subnet-056b58ac45618cfad', 'subnet-0a816b169578d08d8', 'subnet-03b3f6ebdb35a5b2b'],
                securityGroups: ['sg-07e2ef174cb3b31e5'],
                assignPublicIp: 'ENABLED'
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: project.gitUrl },
                        { name: 'PROJECT_ID', value: projectId },
                        { name: 'DEPLOYMENT_ID', value: deployment.id },
                    ]
                }
            ]
        }
    });

    await ecsClient.send(command)
    .then(() => {
        res.json({
            status: 'queued for build',
            data: {
                deploymentId: deployment.id
            },
        })
    })
    .catch((error) => {
        console.error('Error running ECS task:', error);
        res.status(500).json({ error: 'Failed to start build process' });
    });
});

router.get('/', authMiddleware, async (req, res) => {
    const projects = await prisma.project.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'success', data: { projects } });
});

router.get('/:projectId/deployments', authMiddleware, async (req, res) => {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const deployments = await prisma.deployment.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'success', data: { deployments } });
});

router.delete('/:projectId', authMiddleware, async (req, res) => {
    const { projectId } = req.params;

    const deployments = await prisma.deployment.findMany({
        where: {
            projectId: projectId
        },
        select: {
            id: true
        }
    });
    const deploymentIds = deployments.map(deployment => deployment.id);
    // Delete associated log events from ClickHouse
    if (deploymentIds.length > 0) {
        const deleteQuery = `ALTER TABLE log_events DELETE WHERE deployment_id IN ({deployment_ids:Array(String)})`;
        await client.query({
            query: deleteQuery,
            query_params: {
                deployment_ids: deploymentIds
            }
        });
    }

    await prisma.deployment.deleteMany({
        where: { projectId: projectId }
    });

    await prisma.project.delete({
        where: { id: projectId }
    });

    res.json({ status: 'success', message: 'Project deleted successfully' });
});

module.exports = router;