const express = require('express');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const { Server } = require('socket.io');
const { z } = require('zod');
const { PrismaClient } = require('./generated/prisma');
const { createClient } = require('@clickhouse/client');
const { Kafka } = require('kafkajs');
const { v4 : uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 9000;
const prisma = new PrismaClient();

const io = new Server({ cors: '*'});

const kafka = new Kafka({
  clientId: `api-server`,
  brokers: ['kafka-2ffa'],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')],
  },
  sasl: {
    username: 'avnadmin',
    password: 'pass',
    mechanism: 'plain',
  }
});

const client = createClient({
    host: 'https://clickhouse-1966e9ab-eshan-demo.b.aivencloud.com:1',
    username: 'avnadmin',
    password: 'pass',
    database: 'default'
});

const consumer = kafka.consumer({ groupId: 'api-server-logs-consumer' });

io.on('connection', (socket) => {
    socket.on('subscribe', channel => {
        socket.join(channel);
        socket.emit('message', `Subscribed to ${channel}`);
    })
});

io.listen(9001, () => {
    console.log('Socket.io server is running on port 9001');
});

app.use(express.json());

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'acess',
        secretAccessKey: 'secret',        
    }
});

const ecsConfig = {
    cluster: 'arn:aws:ecs:ap-south-1',
    task: 'arn:aws:ecs:ap-south-1'
}

app.post('/project', async (req, res) => {
    const schema = z.object({
        gitUrl : z.string(),
        name: z.string()
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const { gitUrl, name } = validation.data;

    const project = await prisma.project.create({
        data: {
            name,
            gitUrl,
            subDomain : generateSlug(),
        }
    });
    return res.json({status: 'success', data: {project}});
});

app.post('/upload', async (req, res) => {
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

async function initKafkaConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['container-logs'], fromBeginning:true} );

    await consumer.run({
        autoCommit: false,
        eachBatch: async function ({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset}) {
            const messages = batch.messages;
            console.log(`Received ${messages.length} messages from Kafka`);
            for (const message of messages) {
                const stringMessage = message.value.toString(); 
                const { PROJECT_ID, DEPLOYMENT_ID, log } = JSON.parse(stringMessage);

                try {
                    const {query_id} = await client.insert({
                        table: 'log_events',
                        values: [{ event_id: uuidv4(), deployment_id: DEPLOYMENT_ID, log: log }],
                        format: 'JSONEachRow'
                    });
                    console.log(`Inserted log event with query_id: ${query_id}`);
                    await commitOffsetsIfNecessary(message.offset);
                    resolveOffset(message.offset);
                    await heartbeat();
                } catch (error) {
                    console.error('Error inserting log event:', error);
                }
                
            }
        }
    })
}

initKafkaConsumer();

app.listen(PORT, () => {
    console.log(`API server is running on port ${PORT}`);
});
