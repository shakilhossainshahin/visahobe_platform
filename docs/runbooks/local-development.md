# VisaHobe — Local Development Runbook

**Document:** Local Engineering Environment Setup & Operational Standards  
**Target Audience:** Software Engineers, QA Engineers, DevOps  
**Last Updated:** 13 November 2026  

---

## 1. Prerequisites

Before running the VisaHobe monorepo locally, ensure your workstation has the following runtimes installed:

| Tool | Recommended Version | Installation Command (Windows) |
|---|---|---|
| **Node.js LTS** | v20.x or v22.x | `winget install OpenJS.NodeJS.LTS` |
| **pnpm** | v9.x | `corepack enable pnpm` or `winget install pnpm` |
| **Docker Desktop / WSL2** | Latest | `winget install Docker.DockerDesktop` |
| **Git** | v2.40+ | `winget install Git.Git` |

---

## 2. Quickstart Guide

### 2.1 Clone and Setup Environment
```bash
# 1. Clone repository
git clone <repository-url>
cd visahobe_platform

# 2. Copy development environment configuration
cp .env.example .env

# 3. Start local development infrastructure (PostgreSQL 16)
docker compose -f docker-compose.dev.yml up -d

# 4. Install workspace dependencies
pnpm install

# 5. Run database migrations & seed test roles/permissions
pnpm db:migrate
pnpm db:seed

# 6. Start local development servers
pnpm dev
```

---

## 3. Standard Service Health Probes

All HTTP applications and services in VisaHobe must expose two standardized health probe endpoints:

### 3.1 `/healthz` (Liveness Probe)
- **Purpose:** Verifies that the HTTP server process is running and able to handle incoming event loops.
- **Contract:**
  - Method: `GET /healthz`
  - Expected Response: `HTTP 200 OK`
  - Body:
    ```json
    {
      "status": "healthy",
      "uptime": 142.5,
      "timestamp": "2026-11-13T07:00:00.000Z"
    }
    ```
  - Failure Condition: If process is deadlocked or unhandled promise rejection occurs, container orchestrator restarts the pod/container.

### 3.2 `/readyz` (Readiness Probe)
- **Purpose:** Verifies that all required external dependencies (PostgreSQL database pool, Redis/pg-boss queue, storage connection) are connected, migrations are current, and the service is ready to accept production traffic.
- **Contract:**
  - Method: `GET /readyz`
  - Expected Response: `HTTP 200 OK` (when all checks pass) or `HTTP 503 Service Unavailable` (if any dependency fails).
  - Body:
    ```json
    {
      "status": "ready",
      "checks": {
        "database": "connected",
        "migrations": "current",
        "storage": "connected"
      },
      "timestamp": "2026-11-13T07:00:00.000Z"
    }
    ```

---

## 4. Request Correlation ID Standard

To trace asynchronous workflow executions, agent runs, and background tasks across distributed boundaries:

1. **Header Convention:**
   - Incoming requests may supply `x-correlation-id` or `x-request-id`.
   - If missing, the API gateway or entry middleware automatically generates a UUIDv7 / UUIDv4 correlation ID.
2. **Context Propagation:**
   - The correlation ID is stored in Node.js `AsyncLocalStorage` (`packages/core/src/logger/context.ts`).
   - Every log message emitted via the structured logger includes `correlationId`.
3. **Queue & Agent Runs:**
   - When enqueuing a background task (`pg-boss`) or invoking an agent run, `correlationId` must be passed in the task payload and logged across worker execution lifecycles.

---

## 5. Database Migration Protocol (Single Migration-Owner)

> [!WARNING]
> Only **one designated migration owner** may create or edit `packages/database/prisma/schema.prisma` or migration SQL at any time.

```bash
# 1. Modify schema.prisma (only if designated migration owner)
# 2. Generate new migration file
pnpm --filter @visahobe/database db:migrate:dev --name your_migration_name

# 3. Document the migration in database/migrations/MIGRATION_LOG.md:
#    - ID, Purpose, Rollback plan, RLS impact, Index impact, Test requirements

# 4. Verify idempotent replay
pnpm --filter @visahobe/database db:deploy
```

---

## 6. Common Development Commands

```bash
# Code Quality Checks
pnpm format:check   # Verify formatting with Prettier
pnpm format:write   # Fix formatting
pnpm lint           # Run ESLint across monorepo
pnpm typecheck      # Run TypeScript typechecks
pnpm test           # Run Vitest test suite

# Database Operations
pnpm db:generate    # Re-generate Prisma Client types
pnpm db:studio      # Open Prisma Studio web inspector
```
