# ADR-003: Backend Stack and Modular Monolith Architecture

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Lead Architect, Engineering Lead  
**Consulted:** Final Architecture Blueprint v2.0 (Sections 1, 9, 12, 14), Master System Blueprint v1.0 (Section 14)

---

## 1. Context and Problem Statement

Modern enterprise platforms frequently suffer from either of two extremes:

1. An unconstrained "distributed microservices" architecture implemented prematurely, leading to severe network latency, distributed transaction failures, complex local development, and high operational overhead.
2. An unstructured single-monolith spaghetti codebase with tightly coupled database queries and non-durable background processes.

VisaHobe requires an architecture that provides strong domain boundaries, high developer velocity, full type safety across apps and backend services, robust transactional guarantees, and decoupled background worker execution.

---

## 2. Decision Drivers

- **Simplicity & Velocity:** Maintain a single primary backend language (TypeScript) and unified repository.
- **Durable Execution:** Long-running workflows (document OCR, agent execution, external partner portal syncing) must survive process restarts and failures without losing state.
- **Scalability Path:** Domain modules must be decoupled via clean interfaces so that high-load modules (e.g. OCR processing, browser session workers) can be scaled independently or extracted if necessary.
- **Relational Integrity:** Complex relationships among cases, applicants, country policy packs, invoices, payments, and audit logs require ACID transactions.

---

## 3. Decision

VisaHobe adopts a **Modular Monolith + Independent Background Workers + Agent Orchestration Runtime** architecture implemented in TypeScript:

### 3.1 Technology Selection

| Component               | Technology                                                           | Rationale                                                                                                       |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Primary Language**    | TypeScript (Node.js 20+ / 22+ LTS)                                   | Full-stack end-to-end type safety shared between frontend and backend.                                          |
| **Monorepo Manager**    | Turborepo + pnpm workspaces                                          | Ultra-fast caching, deterministic dependency resolution, and workspace orchestration.                           |
| **Web Applications**    | Next.js (App Router), React, Tailwind CSS                            | High performance, server-side rendering for public SEO, React Server Components.                                |
| **API Architecture**    | Modular Fastify / Express / Next.js Route Handlers in `services/api` | High-throughput, clean plugin-based domain module separation.                                                   |
| **Database**            | PostgreSQL 16                                                        | Relational integrity, JSONB support for unstructured policy/metadata, robust RLS.                               |
| **ORM & Migrations**    | Prisma ORM                                                           | Strongly typed queries, declarative schema definitions, versioned and reproducible migrations.                  |
| **Job Queue & Workers** | `pg-boss` (PostgreSQL-backed queue)                                  | Durable transactional job queue running on the existing PostgreSQL instance; zero Redis dependency for Phase 0. |
| **Object Storage**      | S3-compatible private storage (Cloudflare R2 / AWS S3)               | Encrypted storage with signed URLs for confidential documents and screenshots.                                  |
| **Realtime Gateway**    | Server-Sent Events (SSE) / WebSockets in `services/realtime`         | Live case updates, agent chat streaming, and browser session event broadcasts.                                  |

### 3.2 Monorepo Package & Service Boundaries

The codebase is structured under strict boundaries:

- `apps/`: Next.js web applications (`website`, `client-dashboard`, `super-admin`).
- `services/`: Core HTTP APIs and long-running runtime servers (`api`, `agent-runtime`, `orchestrator`, `realtime`).
- `packages/`: Shared libraries with clear responsibilities:
  - `packages/database`: Prisma schema, client instance, RLS helpers, seeders.
  - `packages/auth`: Session management, RBAC evaluator, token verification.
  - `packages/core`: Shared domain models, validation schemas (Zod), error definitions.
  - `packages/agents`: Agent definitions, tool contracts, prompt versions.
  - `packages/workflows`: Workflow definitions, state machine validators.
  - `packages/ui` & `packages/design-system`: Shared Tailwind tokens, shadcn/ui components.
  - `packages/browser-automation`: Browser Use adapter interfaces and types.
- `workers/`: Independent worker processes consuming `pg-boss` queues (`document-processing`, `task-execution`, `notifications`, `sla-monitor`, `browser-session`).

---

## 4. Consequences

### Positive

- **Zero Premature Microservices:** No distributed tracing nightmares or multi-repository version mismatches during the critical initial phases.
- **Transactional Consistency:** Database operations and queue task enqueuing can occur inside the same PostgreSQL transaction using transactional outbox or pg-boss.
- **Shared Type Safety:** Changes to domain schemas (Zod/Prisma) instantly propagate compile-time checks across the API, client dashboard, and agent runtime.
- **Independent Worker Scaling:** Background workers run in separate worker processes, preventing heavy tasks (e.g. OCR, browser automation) from starving HTTP API threads.

### Negative / Trade-offs

- Boundaries must be strictly maintained through linting and package import rules to prevent circular dependencies between packages.
- PostgreSQL carries the load of both data storage and job queue management (`pg-boss`) during Phase 0 to Phase 2.

### Mitigations

- Enforce strict dependency rules via `turbo.json` and ESLint import boundaries.
- Dedicated PostgreSQL connection pools for API services versus `pg-boss` background workers.

---

## 5. Compliance and Verification Criteria

- [ ] All packages compile cleanly under TypeScript strict mode (`"strict": true`).
- [ ] No circular dependencies across monorepo packages (verified via `turbo check` or `madge`).
- [ ] Background worker jobs retry idempotently and dead-letter failed tasks after maximum retry thresholds.
