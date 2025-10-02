const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createClient } = require('@clickhouse/client');
const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');
const { v4 : uuidv4 } = require('uuid');
const { PrismaClient } = require('./generated/prisma');
const { formatTimestamp } = require('./utils/common/formatTimestamp')

const auth = require('./routes/api/auth');
const project = require('./routes/api/project');
const deployment = require('./routes/api/deployment');
const user = require('./routes/api/user');

const app = express();
const PORT = 9000;

const kafka = new Kafka({
  clientId: `api-server`,
  brokers: [process.env.KAFKA_BROKER_1],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')],
  },
  sasl: {
    username: 'avnadmin',
    password: process.env.KAFKA_SASL_PASSWORD,
    mechanism: 'plain',
  }
});

const client = createClient({
    host: process.env.CLICKHOUSE_HOST,
    username: 'avnadmin',
    password: process.env.CLICKHOUSE_PASSWORD,
    database: 'default'
});

const consumer = kafka.consumer({ groupId: 'api-server-logs-consumer' });

const prisma = new PrismaClient();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser()); // Middleware to parse cookies
app.use('/v1/auth', auth);
app.use('/v1/projects', project);
app.use('/v1/deployments', deployment);
app.use('/v1/users', user);

app.use(express.json());

async function initKafkaConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topics: ['container-logs'], fromBeginning:true} );

    await consumer.run({
        autoCommit: true,
        eachBatch: async function ({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset}) {
            const messages = batch.messages;
            console.log(`Received ${messages.length} messages from Kafka`);
            for (const message of messages) {
                const stringMessage = message.value.toString(); 
                const { PROJECT_ID, DEPLOYMENT_ID, log, timestamp } = JSON.parse(stringMessage);
                const formattedTimestamp = formatTimestamp(timestamp);

                try {
                    const {query_id} = await client.insert({
                        table: 'log_events',
                        values: [{ event_id: uuidv4(), deployment_id: DEPLOYMENT_ID, log: log, timestamp: formattedTimestamp }],
                        format: 'JSONEachRow'
                    });
                    console.log(`Inserted log event with query_id: ${query_id}`);

                    //when 'Done uploading build files to S3.' log is inserted, update deployment status to 'SUCCESSFUL'
                    if (log.includes('Done uploading build files to S3.')) {
                        await prisma.deployment.update({
                            where: { id: DEPLOYMENT_ID },
                            data: { status: 'SUCCESSFUL' }
                        });
                    }
                    //when 'Build failed' log is inserted, update deployment status to 'FAILED'
                    if (log.includes('Build failed')) {
                        await prisma.deployment.update({
                            where: { id: DEPLOYMENT_ID },
                            data: { status: 'FAILED' }
                        });
                    }

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
