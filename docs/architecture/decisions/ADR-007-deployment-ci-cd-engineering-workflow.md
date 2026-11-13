# ADR-007: Deployment Model, CI/CD, and Controlled Engineering Workflow

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Lead Architect, DevOps & Security Lead  
**Consulted:** Final Architecture Blueprint v2.0 (Sections 1, 4.2, 5, 11), Master System Blueprint v1.0 (Sections 11, 14.2)

---

## 1. Context and Problem Statement

Autonomous or AI-assisted coding agents are capable of generating vast amounts of code and modifying database schemas at unprecedented speed. If an agent is granted direct write access to `main`, direct access to production database connections, or unconstrained deployment privileges, a single flawed prompt or subtle hallucination can wipe production data, deploy security vulnerabilities, or trigger catastrophic downtime.

VisaHobe requires an engineering workflow where the **Super Main Agent** can act as a high-powered software engineer (investigating bugs, writing tests, creating branches, opening pull requests, and staging builds) while enforcing an unbreakable human-governed deployment pipeline.

---

## 2. Decision Drivers

- **Zero Autonomous Production Writes:** AI agents must never directly push to production branches (`main`/`staging`), alter production schemas, or deploy to production without explicit human review.
- **Git as Single Source of Truth:** All application code, configuration schemas, documentation, and database migrations must reside in Git and pass automated continuous integration.
- **Reproducible & Safe Database Migrations:** Database migrations must be forward-compatible, tested against staging data, and executed via audited migration tooling.
- **Fast Rollback Capability:** Deployments must support automated rollback upon health check failure.

---

## 3. Decision

VisaHobe establishes a **GitHub Branch → PR → Automated CI → Human Peer Review → Staging → Production Approval Gate** engineering workflow, orchestrated via the Super Main Agent CLI and GitHub Actions:

### 3.1 Controlled Engineering Lifecycle

```
[ Feature / Bugfix Task ]
         │
         ▼
1. Super Main Agent creates isolated branch: `feat/` or `fix/`
         │
2. Implements bounded code changes & unit/integration tests
         │
3. Runs local checks (lint, typecheck, tests)
         │
4. Creates GitHub Pull Request with structured summary & risk assessment
         │
         ▼
[ GitHub Actions CI Pipeline ]
  ├── TypeScript Compilation (`tsc --noEmit`)
  ├── ESLint & Prettier Formatting
  ├── Unit & Integration Tests (Vitest)
  ├── Dependency Vulnerability & Secret Leak Scanning (TruffleHog / GitGuardian)
  └── Prisma Migration Dry-Run
         │
         ▼
[ HUMAN REVIEW GATE (Developer Reviewer / Staff) ]
  ├── Requires 1+ authorized human approval
  ├── Strict branch protection on `main` and `staging`
         │
         ▼ (Approved & Merged)
[ Staging Deployment Pipeline ]
  ├── Automatic deploy to staging environment
  ├── Automated smoke tests & health probe verification
         │
         ▼
[ PRODUCTION APPROVAL GATE ]
  ├── Requires explicit approval by Platform Owner / Admin
  ├── Automatic backup snapshot prior to deployment
  ├── Execution of reviewed database migrations
  └── Zero-downtime container rollout + health checks (auto-rollback on failure)
```

### 3.2 Change Categorization and Governance

| Category                     | Mechanism                                             | Approval Requirement                                             |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| **Marketing Content**        | CMS Draft / Review / Publish workflow                 | Content Editor approval; no git commit required.                 |
| **UI Configuration**         | Schema-validated JSON feature flags & widget settings | Stored in DB with instant toggle & audit log.                    |
| **Application Code**         | Feature branch → GitHub PR → Staging → Production     | Mandatory Human PR review + Owner deployment sign-off.           |
| **Database Schema**          | Numbered Prisma migration file (`prisma migrate`)     | Schema review + dry-run in staging + Owner sign-off before prod. |
| **Infrastructure / Secrets** | Infrastructure-as-Code (Terraform / Docker)           | Two-person review for sensitive production secrets.              |

### 3.3 Super Admin CLI Engineering Commands

The Super Main Agent interacts with engineering workflows through structured CLI commands:

```bash
# Branch and PR creation
visahobe github branch create --name feat/p0-database-baseline
visahobe github pr create --title "P0-004: Initialize Prisma schema and RLS policies" --risk low

# CI inspection
visahobe ci inspect --pr 42

# Deployment management (Strictly requires human approval flags)
visahobe deploy staging
visahobe deploy production --requires-approval
visahobe rollback --release-id rel_20261113_01
```

---

## 4. Consequences

### Positive

- **Guaranteed Safety:** Eliminates rogue code changes or unverified schema alterations in production.
- **Complete Audit Trail:** Every line of code, migration, and deployment is immutably recorded in Git commit history and GitHub audit logs.
- **Staging Parity:** Bugs and migration conflicts are caught in the staging environment before touching client data.

### Negative / Trade-offs

- AI cannot instantly self-heal production code in real-time without waiting for human review.
- Multi-step approval adds latency between code generation and production release.

### Mitigations

- Emergency hotfix procedures allow authorized human owners to trigger expedited PR merges with recorded post-incident audits.
- Automated staging deployment provides immediate live previews for human reviewers.

---

## 5. Compliance and Verification Criteria

- [ ] GitHub repository branch protection rules forbid direct pushes to `main` and `staging`.
- [ ] PR merge is blocked unless all CI checks (typecheck, lint, tests, secret scan) pass.
- [ ] Database migrations must execute successfully in a clean staging test container before production deployment is permitted.
