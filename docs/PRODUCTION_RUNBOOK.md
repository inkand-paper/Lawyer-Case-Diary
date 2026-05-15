# 📜 Lawyer Case Diary - Production Runbook (RC1)

This document provides the operational procedures for deploying, monitoring, and maintaining the Lawyer Case Diary SaaS in a production environment.

---

## 🚀 1. Initial Deployment Flow

### Step A: Infrastructure Setup
1.  **Database**: Provision a PostgreSQL instance (Supabase, RDS, or Railway).
2.  **Environment**: Configure the following variables in your hosting provider (Vercel/Fly.io):
    ```bash
    DATABASE_URL="postgresql://..."
    JWT_SECRET="<openssl rand -base64 32>"
    # Ensure this is different from JWT_SECRET for security
    REFRESH_TOKEN_SECRET="<openssl rand -base64 32>" 
    NODE_ENV="production"
    ```

### Step B: Database Migration
Run the production migration to apply schema changes and indexes:
```bash
npx prisma migrate deploy
```

### Step C: Build & Launch
```bash
npm run build
vercel --prod
```

---

## 📈 2. Monitoring & Observability

### Health Checks
Monitor the system integrity via the health endpoint:
*   **Endpoint**: `GET /api/health`
*   **Success**: `200 OK`
*   **Threshold**: If p95 latency > 500ms, investigate database connection pooling.

### Log Analysis
Logs are output in **Structured JSON**. Use your log aggregator (Datadog/LogDNA) to alert on:
*   `level: "ERROR"`
*   `message: "Too Many Requests"` (Indicates a potential attack or legitimate high traffic)
*   `message: "Sensitive Case Record Accessed"` (Audit trail monitoring)

---

## 🛡️ 3. Security Operations

### Token Rotation Failure
If users are repeatedly asked to log in, verify the `RefreshToken` table in the database. 
*   **Action**: Ensure the database is not at its storage limit.

### Rate Limit Adjustments
If legitimate law firms are being blocked (Shared office IP):
1.  Open `src/middleware.ts`.
2.  Increase `limit` from `100` to `500` (or as required).
3.  Deploy update.

---

## 🔄 4. Disaster Recovery (DR)

### Database Failure
*   **RPO (Recovery Point Objective)**: 5 minutes (based on standard provider backups).
*   **RTO (Recovery Time Objective)**: 15 minutes.
*   **Action**: 
    1. Restore database from latest point-in-time recovery.
    2. Update `DATABASE_URL` if the endpoint changed.
    3. Verify connectivity via `/api/health`.

---

## ⚖️ 5. Compliance Tasks

### Data Portability (GDPR)
When a lawyer requests their data:
1.  Provide the `/api/me/export` JSON file.
2.  Verify the JSON contains all `cases`, `clients`, and `hearings` associated with their `userId`.

### Right to Erasure
When a lawyer requests account deletion:
1.  Trigger the `/api/me/forget` logic.
2.  Verify in Prisma Studio that all related records (including `RefreshToken` and `IdempotencyRecord`) are purged.

---

**Current Status**: PRODUCTION READY ✅
**Version**: 1.0.0-RC1
**Owner**: Solicitor IT / Engineering Team
