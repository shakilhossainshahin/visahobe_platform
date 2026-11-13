# VisaHobe — Architecture Decision Records (ADR) Index

This directory contains the authoritative Architecture Decision Records (ADRs) establishing the technical baseline for the VisaHobe platform, in conformance with Section 14 of the Final Architecture Blueprint v2.0.

| ADR ID | Title | Status | Date | Core Scope |
|---|---|---|---|---|
| [ADR-001](./ADR-001-product-surfaces.md) | Product Surfaces and Workspace Architecture | **Accepted** | 2026-11-13 | 3 Primary Surfaces (Website, Client Dashboard, Super Admin), scoped Partner workspace |
| [ADR-002](./ADR-002-tenant-isolation-model.md) | Multi-Tenant Isolation Model and Data Boundaries | **Accepted** | 2026-11-13 | PostgreSQL Row-Level Security (RLS), verified session claims, private storage |
| [ADR-003](./ADR-003-backend-stack-and-architecture-style.md) | Backend Stack and Modular Monolith Architecture | **Accepted** | 2026-11-13 | Node.js/TypeScript, Turborepo, Next.js, Prisma ORM, PostgreSQL, pg-boss workers |
| [ADR-004](./ADR-004-agent-orchestration-runtime.md) | Agent Orchestration Runtime, Tool Contracts, and Human Approval Gates | **Accepted** | 2026-11-13 | LangGraph durable state checkpointers, 6 specialist agents, Zod tool schemas, human gates |
| [ADR-005](./ADR-005-browser-use-integration.md) | Browser Automation Architecture and Browser Use Integration | **Accepted** | 2026-11-13 | Browser Use execution engine adapter, container sandbox, domain allowlists, human takeover |
| [ADR-006](./ADR-006-model-gateway-and-cli-strategy.md) | Model Gateway and Super Admin CLI Model Strategy | **Accepted** | 2026-11-13 | Provider-agnostic model routing (Anthropic, Gemini, OpenAI, Ollama), CLI model selector |
| [ADR-007](./ADR-007-deployment-ci-cd-engineering-workflow.md) | Deployment Model, CI/CD, and Controlled Engineering Workflow | **Accepted** | 2026-11-13 | GitHub Branch-PR-CI, human review gates, reviewed migrations, automated rollback |
| [ADR-008](./ADR-008-security-auth-and-permission-boundaries.md) | Security Architecture, Authentication, and Permission Boundaries | **Accepted** | 2026-11-13 | 3-tier permissions, Supabase Auth + MFA for staff, encrypted credential vault, PII redaction |
| [ADR-009](./ADR-009-ui-design-system-and-liquid-glass.md) | UI Design System, Color Palette, and Liquid Glass Specification | **Accepted** | 2026-11-13 | White + Dark-Green (`#0D3B2E`), selective Liquid Glass, Inter + Noto Sans Bengali |

---

### ADR Lifecycle & Modification Policy
1. ADRs capture architectural invariants. Proposed modifications must be submitted via a GitHub Pull Request accompanied by an engineering impact analysis.
2. In the event of a superseded decision, the existing ADR status must be marked `Superseded by ADR-XXX` and linked accordingly.
