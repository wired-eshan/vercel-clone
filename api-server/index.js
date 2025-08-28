const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createClient } = require('@clickhouse/client');
const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');
const { v4 : uuidv4 } = require('uuid');

const auth = require('./routes/api/auth');
const project = require('./routes/api/project');

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

//const consumer = kafka.consumer({ groupId: 'api-server-logs-consumer' });

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser()); // Middleware to parse cookies
app.use('/v1/auth', auth);
app.use('/v1/project', project);

app.use(express.json());

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

//initKafkaConsumer();

app.listen(PORT, () => {
    console.log(`API server is running on port ${PORT}`);
});
