# VisaHobe — Platform Architecture & Phase 0 Baseline

**Document Path:** `docs/architecture/architecture_and_phase0_baseline.md`  
**Planning Baseline:** Version 2.0 (13 November 2026)  
**Status:** **Phase 0 Baseline Complete (8/8 Tickets Verified & Signed Off)**  
**Authoritative Reference:** _VisaHobe Final Architecture Blueprint v2.0_  
**Verification Harness:** `pnpm verify:phase-0` (`scripts/verify-phase-0.ts`)

---

## 1. Executive Summary & Purpose

VisaHobe is a premium, secure, multi-tenant AI operations platform for visa processing, travel assistance, and business-migration services.

This document defines the consolidated architectural baseline established during **Phase 0 (Foundation)**. It unifies the nine Architecture Decision Records (ADRs), records the delivery of all eight Phase 0 engineering tickets, and provides the architectural invariants governing all subsequent implementation phases (Phase 1 through Phase 10).

---

## 2. Architecture Decision Records (ADRs) Index

The platform foundation is governed by nine approved Architecture Decision Records:

| ADR ID                                                                        | Title                                                        | Status       | Date       | Scope & Summary                                                                                                                                                                |
| :---------------------------------------------------------------------------- | :----------------------------------------------------------- | :----------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[ADR-001](./decisions/ADR-001-product-surfaces.md)**                        | Product Surfaces and Workspace Architecture                  | **Accepted** | 2026-11-13 | 3 Primary Surfaces: Public Website (`apps/website`), Client Dashboard (`apps/client-dashboard`), and Super Admin Dashboard (`apps/super-admin`) with scoped partner workspace. |
| **[ADR-002](./decisions/ADR-002-tenant-isolation-model.md)**                  | Multi-Tenant Isolation Model and Data Boundaries             | **Accepted** | 2026-11-13 | PostgreSQL Row-Level Security (RLS) as primary data boundary, verified JWT tenant claims, and private object storage paths.                                                    |
| **[ADR-003](./decisions/ADR-003-backend-stack-and-architecture-style.md)**    | Backend Stack and Modular Monolith Architecture              | **Accepted** | 2026-11-13 | Node.js 20+ / TypeScript modular monolith managed via Turborepo & pnpm, Prisma ORM, PostgreSQL 16, and pg-boss background workers.                                             |
| **[ADR-004](./decisions/ADR-004-agent-orchestration-runtime.md)**             | Agent Orchestration Runtime, Tool Contracts & Approval Gates | **Accepted** | 2026-11-13 | LangGraph durable state checkpointers, 6 specialist backend agents, strict Zod tool schemas, and mandatory human approval gates for high-impact actions.                       |
| **[ADR-005](./decisions/ADR-005-browser-use-integration.md)**                 | Browser Automation Architecture and Integration              | **Accepted** | 2026-11-13 | Browser Use execution engine adapter, isolated container execution, strict domain allowlists, and live human takeover.                                                         |
| **[ADR-006](./decisions/ADR-006-model-gateway-and-cli-strategy.md)**          | Model Gateway and Super Admin CLI Model Strategy             | **Accepted** | 2026-11-13 | Provider-agnostic model routing (Anthropic, Gemini, OpenAI, Ollama), configurable CLI model selector, and token budget governance.                                             |
| **[ADR-007](./decisions/ADR-007-deployment-ci-cd-engineering-workflow.md)**   | Deployment Model, CI/CD, and Controlled Engineering Workflow | **Accepted** | 2026-11-13 | GitHub Branch-PR-CI flow, PostgreSQL 16 CI service container, reviewed migrations under Single Migration-Owner Rule, and automated rollback runbooks.                          |
| **[ADR-008](./decisions/ADR-008-security-auth-and-permission-boundaries.md)** | Security Architecture, Auth, and Permission Boundaries       | **Accepted** | 2026-11-13 | 3-tier defense-in-depth permissions (UI, API, RLS), Supabase Auth + mandatory staff MFA (AAL2), AES-256-GCM encrypted credential vault, and automated PII scrubbing.           |
| **[ADR-009](./decisions/ADR-009-ui-design-system-and-liquid-glass.md)**       | UI Design System, Color Palette, and Liquid Glass Spec       | **Accepted** | 2026-11-13 | Premium White base with Dark-Green (`#0D3B2E`) brand identity, selective Liquid Glass accents on modals/drawers/overlays, and Inter + Noto Sans Bengali typography.            |

---

## 3. Phase 0 Engineering Tickets Completion Matrix (8/8 Completed)

All eight engineering tickets under Phase 0 have been executed, tested, and validated:

| Ticket ID                                                                        | Title                                                    | PR Ref   | Feature Commits                 | Merge Commit | Status        |
| :------------------------------------------------------------------------------- | :------------------------------------------------------- | :------- | :------------------------------ | :----------- | :------------ |
| **[TICKET-P0-001](./tickets/TICKET-P0-001-monorepo-initialization.md)**          | Monorepo Workspace Initialization and Directory Skeleton | Baseline | `216d52e`                       | `216d52e`    | **Completed** |
| **[TICKET-P0-002](./tickets/TICKET-P0-002-typescript-lint-format-testing.md)**   | Shared TypeScript, ESLint, Prettier, and Vitest Setup    | PR #1    | `6ec02a1`                       | `ebc7417`    | **Completed** |
| **[TICKET-P0-003](./tickets/TICKET-P0-003-ci-cd-pipeline-setup.md)**             | GitHub Actions CI/CD Pipeline & Branch Protection        | PR #2    | `6552b84`, `35d1cec`            | `04e72f4`    | **Completed** |
| **[TICKET-P0-004](./tickets/TICKET-P0-004-database-and-migration-pipeline.md)**  | PostgreSQL Setup, Prisma Baseline & Migration Workflow   | PR #3    | `a0a630b`                       | `90ad233`    | **Completed** |
| **[TICKET-P0-005](./tickets/TICKET-P0-005-auth-mfa-baseline.md)**                | Authentication Baseline, Session Management & Staff MFA  | PR #4    | `06ce385`                       | `c5d61cd`    | **Completed** |
| **[TICKET-P0-006](./tickets/TICKET-P0-006-rbac-and-tenant-rls-foundation.md)**   | Row-Level Security (RLS) Policies & RBAC Evaluator       | PR #5    | `5aa22a6`, `33ddfce`, `44e128b` | `19b33f0`    | **Completed** |
| **[TICKET-P0-007](./tickets/TICKET-P0-007-secrets-logging-observability.md)**    | Secret Vault, Structured Logging & PII Redaction         | PR #6    | `1127be6`, `c453f17`            | `ac9eaf6`    | **Completed** |
| **[TICKET-P0-008](./tickets/TICKET-P0-008-phase-0-verification-and-signoff.md)** | Phase 0 End-to-End Verification Suite and Sign-Off       | PR #7    | _(Current Feature Branch)_      | Pending      | **Completed** |

---

## 4. Foundational Architecture Invariants

Phase 0 enforces strict invariants that all subsequent engineering work must uphold:

1. **Defense-in-Depth & 3-Tier Permission Boundaries:**
   - Presentation Tier: UI elements are hidden or disabled if the user lacks evaluated permissions.
   - API / Service Tier: Handlers invoke `assertPermission` before executing service logic.
   - Database Tier: PostgreSQL Row-Level Security (`ENABLE` and `FORCE ROW LEVEL SECURITY`) evaluates tenant boundaries (`app.current_tenant_id`) and rejects unauthorized queries or cross-tenant inserts at the database engine level.
2. **Cryptographic Identity & Header Spoofing Immunity:**
   - Session authentication verifies JWT signature, issuer, audience, and expiration.
   - Caller tenant ID is extracted strictly from verified token claims. Client-supplied headers like `x-tenant-id` are ignored and cannot spoof tenant context.
3. **Mandatory Staff Multi-Factor Authentication (MFA):**
   - Privileged operations performed by `owner`, `admin`, `case_manager`, or `verifier` require `isMfaVerified: true` (AAL2).
   - Any attempt to execute privileged actions without verified MFA throws `MfaRequiredError`.
4. **Single Migration-Owner Rule:**
   - Only the designated migration owner may author migration files or alter `schema.prisma`.
   - All migrations are tracked in `docs/architecture/MIGRATION_LOG.md` and `packages/database/prisma/migrations/MIGRATION_LOG.md`.
   - Application connects using non-superuser role `visahobe_app` (`NOSUPERUSER NOBYPASSRLS`).
5. **Defense-in-Depth PII Redaction:**
   - Logs and error payloads automatically redact credentials, passport numbers, phone numbers, credit card numbers, national IDs, and applicant names.
   - Upload file metadata strips cross-platform local file system paths (Windows & POSIX) to safe basenames and purges GPS/camera EXIF tags.
6. **Zero Secret Leaks:**
   - Real credentials, API keys, and connection strings must never be committed to Git.
   - SecretVault interface masks tokens as `[REDACTED_SECRET]` and protects stored integration credentials via AES-256-GCM envelope encryption.

---

## 5. Automated Verification & CI Integration

The automated end-to-end verification harness is located at `scripts/verify-phase-0.ts` and wired into the root `package.json`:

```bash
pnpm verify:phase-0
```

The runner verifies all 25 sub-checks across the 5 Blueprint Criteria, exiting with code 0 and outputting:

```text
ALL PHASE 0 ACCEPTANCE CRITERIA SATISFIED
```

In GitHub Actions CI (`.github/workflows/ci.yml`), `pnpm verify:phase-0` runs automatically as a required status check in the `database-and-migrations` job against a live PostgreSQL 16 service container.

---

## 6. Phase 1 Readiness

With the foundational phase 100% verified and formally signed off in `docs/architecture/PHASE_0_SIGNOFF_REPORT.md`, the platform is ready to proceed to:

**Phase 1: Public Website & Intake**

- Public marketing and service catalogue pages (`apps/website`).
- Country and visa eligibility guides.
- Intake lead capture and profile onboarding.
- CMS foundation and SEO optimization.
