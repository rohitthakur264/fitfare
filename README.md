# Cloud Analytics & Event Ingestion Metrics 🚀
A modern, real-time analytics dashboard pipeline scaling end-to-end dynamically entirely out of AWS serverless architecture.

## 🏗 System Architecture
**User -> ALB -> EC2 Frontend -> API Gateway -> Lambda -> DynamoDB/S3**

This completely detached fullstack system supports:
1. Frontend: React + Vite Dashboard hosted on AWS EC2 & NGINX.
2. Backend: Active APIGW WebSocket listeners polling pure metrics cleanly with `mysecrettoken123` stateless JWT Auth checks.
3. Data Logging: Lambda processing natively writes logs continuously into DynamoDB & S3 Data Lakes.
4. Resiliency: Safe `SQS` Dead Letter Queues (DLQ) paired to Lambda logic triggering asynchronous warnings via `CloudWatch`.
5. Automation: Clean, structured Github Actions CI/CD workflows driving seamless redeploys.

## 📁 Repository Structure
```text
cloud-analytics/
├── frontend/                     # React App
├── lambda/                       # Primary Event Ingestion Handlers
├── processor/                    # DynamoDB Pipeline Processors
├── .github/workflows/            # CI/CD Deployment Actions
└── screenshots/                  # Architecture captures
```

**public link **:-[](https://share.google/5lUYVadtqOxi7BCq6)
