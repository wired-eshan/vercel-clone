# vercel-clone
Vercel like application to build and deploy react app using only Github repository URL. Plain React and Vite React projects are supported.

## Architecture
<img width="1196" height="581" alt="Screenshot 2025-10-12 at 8 30 39 PM" src="https://github.com/user-attachments/assets/5237ae17-574f-4ebd-a134-1ae60a6ff688" />

## Setup
### API Server
Add ca.pem certificate file to /prisma directory for postgresql connection.
Add kafka.pem certificate file to /api-server directory for kafka connection.

Set following environment variables:
- Postgresql DB URL
DATABASE_URL

- Kafka configurations
KAFKA_BROKER_1
KAFKA_SASL_PASSWORD

- Clickhouse configurations
CLICKHOUSE_HOST
CLICKHOUSE_PASSWORD

- AWS ECS configurations
AWS_ECS_ACCESS_KEY_ID
AWS_ECS_SECRET_ACCESS_KEY
AWS_ECS_CLUSTER
AWS_ECS_TASK

- AWS S3 configurations
S3_BUCKET
AWS_S3_ACCESSKEYID
AWS_S3_ACCESSKEY

### Reverse proxy
Add ca.pem certificate file to /prisma directory for postgresql connection.
Add kafka.pem certificate file to /s3-reverse-proxy directory for kafka connection.

Set following environment variables:
- Postgresql DB URL
DATABASE_URL

- Kafka configurations
KAFKA_BROKER_1
KAFKA_SASL_PASSWORD

### Build server
Add ca.pem certificate file to /prisma directory for postgresql connection.
Add kafka.pem certificate file to /build-server directory for kafka connection.

Set AWS S3 and kafka configurations in script.js

### Clickhouse DB setup
#### Query to create table for build and deployment logs
CREATE TABLE log_events (
  event_id UUID,
  timestamp DateTime64(6),
  deployment_id Nullable(String),
  log String,
  metadata Nullable(String)
)
ENGINE=MergeTree PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp);

#### Query to create table for analytics
CREATE TABLE analytics (
    event_id UUID,
    timestamp DateTime64(3),
    lat Nullable(String),
    lon Nullable(String),
    country Nullable(String),
    city Nullable(String),
    projectId String,
    metadata Nullable(String)
)
ENGINE = MergeTree
PARTITION BY projectId
ORDER BY (projectId, timestamp);

