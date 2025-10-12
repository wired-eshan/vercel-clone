# vercel-clone
Vercel like application to build and deploy react app using only Github repository URL. Vite, react, and nextJS projects are supported.

## Architecture
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/97f8c973-39f0-474c-9f01-25e4cc01ae28" />

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
