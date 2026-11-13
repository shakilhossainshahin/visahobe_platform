# VisaHobe — Platform Architecture & Engineering Documentation

**Document Root:** `docs/architecture/`  
**Planning Baseline:** Version 2.0 (13 November 2026)  
**Status:** Phase 0 Baseline Complete & Signed Off (8/8 Tickets Completed)

---

## 1. Overview

VisaHobe is a premium, secure, multi-tenant AI operations platform for visa processing, travel assistance, and business-migration services. This documentation repository establishes the definitive source of truth for all architectural decisions, security boundaries, browser automation models, agent tool contracts, and implementation phases.

- **[Phase 0 Architecture Baseline](./architecture_and_phase0_baseline.md):** Consolidated Phase 0 baseline documenting all 9 ADRs, 8 completed engineering tickets, and foundational invariants.
- **[Phase 0 Formal Sign-Off Report](./PHASE_0_SIGNOFF_REPORT.md):** Official completion and acceptance report validating all 5 Phase 0 blueprint criteria (25/25 checks passed).

---

## 2. Architecture Documentation Index

### 2.1 Blueprints & Audits

- **[Repository & Runtime Audit](./repository-audit.md):** Inspection of workspace structure, runtime dependencies, Windows host environment, and baseline alignment.
- **[Final Architecture Blueprint v2.0](./blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md):** Authoritative architecture blueprint and implementation roadmap.
- **[Master System Blueprint v1.0](./blueprints/visahobe_blueprint.md):** Consolidated master specification covering workflow registries, database schemas, and agency integrations.

### 2.2 Architecture Decision Records (ADRs)

See the full **[ADR Directory & Index](./decisions/README.md)**:

1. **[ADR-001: Product Surfaces & Workspaces](./decisions/ADR-001-product-surfaces.md)** — Public Website, Client Dashboard, Super Admin Dashboard, and scoped Partner workspace.
2. **[ADR-002: Multi-Tenant Isolation Model](./decisions/ADR-002-tenant-isolation-model.md)** — PostgreSQL Row-Level Security (RLS), verified session claims, and private object storage.
3. **[ADR-003: Backend Stack & Architecture Style](./decisions/ADR-003-backend-stack-and-architecture-style.md)** — Modular Monolith, TypeScript API, Next.js, Prisma ORM, and pg-boss workers.
4. **[ADR-004: Agent Orchestration Runtime](./decisions/ADR-004-agent-orchestration-runtime.md)** — LangGraph stateful checkpointers, 6 specialist agents, Zod tool contracts, and human approval gates.
5. **[ADR-005: Browser Use Integration Architecture](./decisions/ADR-005-browser-use-integration.md)** — Isolated container execution engine, model gateway routing, domain allowlists, and human takeover.
6. **[ADR-006: Model Gateway & CLI Model Strategy](./decisions/ADR-006-model-gateway-and-cli-strategy.md)** — Multi-provider routing (Anthropic, Gemini, OpenAI, Ollama) and configurable CLI models.
7. **[ADR-007: Deployment Model & CI/CD Workflow](./decisions/ADR-007-deployment-ci-cd-engineering-workflow.md)** — Controlled GitHub branch-PR-CI flow, staging previews, reviewed migrations, and rollback.
8. **[ADR-008: Security Architecture & Permissions](./decisions/ADR-008-security-auth-and-permission-boundaries.md)** — 3-tier permissions, Supabase Auth + staff MFA, credential vault, and automated PII redaction.
9. **[ADR-009: UI Design System & Liquid Glass](./decisions/ADR-009-ui-design-system-and-liquid-glass.md)** — Premium White + Dark-Green (`#0D3B2E`) identity with selective Liquid Glass overlays.

### 2.3 Implementation Roadmap & Phase 0 Tickets

See the full **[Phase 0 Tickets Directory & Index](./tickets/README.md)**:

- [TICKET-P0-001: Monorepo Workspace Initialization](./tickets/TICKET-P0-001-monorepo-initialization.md)
- [TICKET-P0-002: TypeScript, ESLint, Prettier, and Vitest Setup](./tickets/TICKET-P0-002-typescript-lint-format-testing.md)
- [TICKET-P0-003: GitHub Actions CI/CD Pipeline Setup](./tickets/TICKET-P0-003-ci-cd-pipeline-setup.md)
- [TICKET-P0-004: PostgreSQL Setup, Prisma ORM Baseline, and Migration Workflow](./tickets/TICKET-P0-004-database-and-migration-pipeline.md)
- [TICKET-P0-005: Authentication Baseline, Session Management, and Staff MFA](./tickets/TICKET-P0-005-auth-mfa-baseline.md)
- [TICKET-P0-006: Row-Level Security (RLS) Policies and RBAC Evaluator](./tickets/TICKET-P0-006-rbac-and-tenant-rls-foundation.md)
- [TICKET-P0-007: Secret Vault Interface, Structured Logging, and PII Redaction](./tickets/TICKET-P0-007-secrets-logging-observability.md)
- [TICKET-P0-008: Phase 0 End-to-End Verification Suite and Sign-Off](./tickets/TICKET-P0-008-phase-0-verification-and-signoff.md)

---

## 3. Governance and Engineering Rules

In accordance with Section 14 and Section 21 of the system blueprints:

1. **No Premature Code Generation:** Engineering agents must not generate application features until the foundational phase (Phase 0) is verified and signed off.
2. **Mandatory Reporting Format:** After every engineering task, the agent must report objectives, implementation details, changed files, migrations, events, test executions, and next steps.
3. **Defense-in-Depth:** Every sensitive action must pass presentation-tier, API-tier, and database RLS-tier validations.
