# AGENTS.md — VisaHobe Autonomous Engineering Operating Manual

> **Purpose:** Permanent, 100% repository-verified operational rules, architecture constraints, and execution protocols for AI agents (Antigravity, Claude Code, Cline, Cursor, GitHub Codespaces) working on the `visahobe_platform` monorepo.
> **Strict Invariant:** Zero guesswork. Every path, script name, package identifier, database model, and CI check documented here is verified directly against ground-truth repository files.

---

## Section 1: Ground-Truth Monorepo Map

The VisaHobe monorepo is governed by `pnpm@9.12.3`, `Node.js >=20.0.0`, and `Turborepo` workspace configuration (`pnpm-workspace.yaml`).

### 1.1 Product Surfaces & Customer Applications (`apps/*`)

| Directory               | Package Name (`package.json`) | Dev Port / Target                   | Framework / Core Stack              | Description                                                                                                   |
| :---------------------- | :---------------------------- | :---------------------------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `apps/website`          | `@visahobe/website`           | `3000` (`next dev --port 3000`)     | Next.js 15, React 18, Tailwind CSS  | Public acquisition site, country visa guides, dynamic SSG `/countries/[slug]`, interactive eligibility wizard |
| `apps/client-dashboard` | `@visahobe/client-dashboard`  | `3001` (`next dev --port 3001`)     | Next.js 15, React 18, Tailwind CSS  | Authenticated applicant workspace, 5-stage case timeline, ADR-009 solid Document Vault, upload API, messages  |
| `apps/super-admin`      | `@visahobe/super-admin`       | `3002` (configured for Phase 2)     | TypeScript, NodeNext                | Internal operations command center for verifiers, case managers, browser operators, and platform admins       |
| `apps/mobile`           | `@visahobe/mobile`            | Native Android (`com.visahobe.app`) | Capacitor 6, Android WebView Bridge | Android mobile wrapper, Deep Emerald theme, domain allowlist, camera/biometrics/safe deep-link bridge SDK     |

### 1.2 Core Domain Packages (`packages/*`)

| Directory                     | Package Name (`package.json`)  | Core Purpose / Exported Capabilities                                                                                           |
| :---------------------------- | :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `packages/core`               | `@visahobe/core`               | Core domain types, metadata scrubber (`sanitizeUploadFilename`), PII regex redactor, secret vault, JSON logger, signed URLs    |
| `packages/design-system`      | `@visahobe/design-system`      | Color palette tokens (`#0D3B2E`, `#FFFFFF`), Liquid Glass presets, typography scales, `visahobeTailwindPreset`                 |
| `packages/ui`                 | `@visahobe/ui`                 | Accessible components (`Button`, `Card`, `GlassCard`, `Badge`, `Input`, `NavbarShell`, `FooterShell`, `DataTable`)             |
| `packages/cms`                | `@visahobe/cms`                | Structured country visa policy engine, 6 launch country guides (`singapore`, `germany`, `uk`, `canada`, `australia`, `uae`)    |
| `packages/auth`               | `@visahobe/auth`               | Strict JWT claims validation (`iss`, `aud`, `exp`, `sub`, `tenant_id`), secure cookies, CSRF protection, staff MFA enforcement |
| `packages/database`           | `@visahobe/database`           | PostgreSQL 16 schema, Prisma client, migration workflow, seeders, transaction context bridge (`app.current_tenant_id`)         |
| `packages/shared`             | `@visahobe/shared`             | Cross-package shared types, validation schemas, and platform-wide constants                                                    |
| `packages/agents`             | `@visahobe/agents`             | Agent prompt templates, state definitions, and agent tool execution contracts                                                  |
| `packages/browser-automation` | `@visahobe/browser-automation` | Browser Use integration runtime, browser session controller, and DOM isolation boundaries                                      |
| `packages/integrations`       | `@visahobe/integrations`       | External API clients (payment gateways, embassy booking interfaces, SMS/email webhooks)                                        |
| `packages/workflows`          | `@visahobe/workflows`          | Durable workflow definitions, multi-step orchestration chains, and retry policies                                              |

### 1.3 Service Daemons & Microservices (`services/*`)

| Directory                | Package Name              | Core Responsibility                                                                          |
| :----------------------- | :------------------------ | :------------------------------------------------------------------------------------------- |
| `services/api`           | `@visahobe/api`           | Central REST / GraphQL gateway routing external API requests to internal services            |
| `services/agent-runtime` | `@visahobe/agent-runtime` | LangGraph execution runner executing autonomous specialist agent pipelines                   |
| `services/orchestrator`  | `@visahobe/orchestrator`  | High-level distributed process orchestrator coordinating workers and human-in-the-loop gates |
| `services/realtime`      | `@visahobe/realtime`      | WebSocket / SSE server streaming live case status updates and agent execution logs           |

### 1.4 Background Workers (`workers/*`)

| Directory                        | Package Name                              | Task Queue & Processing Scope                                                   |
| :------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------ |
| `workers/document-processing`    | `@visahobe/worker-document-processing`    | Async document OCR, virus scanning, classification, and metadata validation     |
| `workers/browser-session`        | `@visahobe/worker-browser-session`        | Headless browser execution container for embassy appointment bookings           |
| `workers/follow-up`              | `@visahobe/worker-follow-up`              | Automated client reminder dispatches and missing-document escalations           |
| `workers/finance-reconciliation` | `@visahobe/worker-finance-reconciliation` | Payment matching, gateway fee reconciliation, and ledger balance verification   |
| `workers/notifications`          | `@visahobe/worker-notifications`          | Multi-channel dispatch (email, SMS, WhatsApp) for statutory status changes      |
| `workers/partner-sync`           | `@visahobe/worker-partner-sync`           | Synchronization with law firms, visa consultants, and overseas partner agencies |
| `workers/sla-monitor`            | `@visahobe/worker-sla-monitor`            | Real-time monitoring of government processing timelines and internal audit SLAs |
| `workers/task-execution`         | `@visahobe/worker-task-execution`         | Generic distributed task worker executing asynchronous background jobs          |

### 1.5 Self-Hosted Super Agent Engine (`self-hosted/super-agent/*`)

| Directory                         | Package Name                    | Operational Purpose                                                            |
| :-------------------------------- | :------------------------------ | :----------------------------------------------------------------------------- |
| `self-hosted/super-agent/cli`     | `@visahobe/super-agent-cli`     | CLI terminal tool for platform administrators to dispatch and supervise agents |
| `self-hosted/super-agent/runtime` | `@visahobe/super-agent-runtime` | Standalone isolated agent execution harness with local LLM fallback            |
| `self-hosted/super-agent/tools`   | `@visahobe/super-agent-tools`   | Hardened tool registry exposing vetted system actions to autonomous agents     |

---

## Section 2: Verified Root Scripts & Fast Scoped Verification Protocol

### 2.1 Exact Root Package Scripts (`package.json`)

Do **NOT** guess script names. Use only these verified commands:

```bash
# Monorepo Build & Check
pnpm build              # pnpm -r run build
pnpm lint               # eslint .
pnpm typecheck          # pnpm -r run typecheck
pnpm format:check       # prettier --check .
pnpm format:write       # prettier --write .

# Testing & Verification
pnpm test               # vitest run
pnpm test:watch         # vitest
pnpm test:coverage      # vitest run --coverage
pnpm verify:phase-0     # tsx scripts/verify-phase-0.ts (25 foundational checks)

# Database & Migrations (Scoped to @visahobe/database)
pnpm db:generate        # prisma generate
pnpm db:migrate         # prisma migrate deploy
pnpm db:seed            # tsx prisma/seed.ts
pnpm db:studio          # prisma studio
pnpm db:validate        # prisma validate

# Workspace Clean
pnpm clean              # pnpm -r exec rimraf dist
```

### 2.2 Fast Iterative Scoped Verification (Speed Multiplier)

Running `pnpm typecheck` or `pnpm test` across all 31 projects takes 10–20 seconds. During active development, iterate 3–4x faster by running scoped checks on modified packages:

```bash
# 1. Scoped Typecheck (Fast: 1-2 seconds)
pnpm --filter @visahobe/<package-name> typecheck

# Examples:
pnpm --filter @visahobe/website typecheck
pnpm --filter @visahobe/client-dashboard typecheck
pnpm --filter @visahobe/mobile typecheck
pnpm --filter @visahobe/core typecheck

# 2. Scoped Unit Testing (Fast: 1-2 seconds)
pnpm --filter @visahobe/<package-name> test

# Examples:
pnpm --filter @visahobe/client-dashboard test
pnpm --filter @visahobe/mobile test
pnpm --filter @visahobe/cms test
```

### 2.3 The "Package Pre-Build" Rule (CI & Fresh Runner Invariant)

> [!IMPORTANT]
> Downstream Next.js apps (`apps/website`, `apps/client-dashboard`) and consumer packages import compiled TypeScript declarations (`dist/*.d.ts`) or source declarations from upstream packages.
> On clean environments (or after branch switching), ALWAYS run internal package builds before executing Next.js typecheck or build:
>
> ```bash
> pnpm --filter "./packages/**" build
> ```
>
> This matches step 70 of `.github/workflows/ci.yml` and prevents `Cannot find module '@visahobe/...'` errors.

### 2.4 Mandatory Pre-Push Verification Gate

Before staging any commit or pushing a branch, ALL of the following commands MUST pass with exit code `0`:

```bash
pnpm install --frozen-lockfile   # Verify lockfile consistency
pnpm format:check                # Verify Prettier compliance
pnpm lint                        # Verify ESLint (0 errors, 0 warnings)
pnpm typecheck                   # Verify TypeScript across all workspace projects
pnpm test                        # Verify Vitest across all 31 test suites
pnpm build                       # Verify full production build
pnpm verify:phase-0              # Verify Phase 0 baseline criteria (25/25)
```

---

## Section 3: Database, RLS & Storage Strategy (Non-Negotiable)

### 3.1 Verified Prisma Models (`packages/database/prisma/schema.prisma`)

The database is PostgreSQL 16 managed via Prisma ORM (`@prisma/client@^5.22.0`). All IDs are UUID PKs (`@id @default(uuid()) @db.Uuid`).

1. `Tenant` (`tenants`): Multi-tenant account boundaries (`id`, `name`, `slug`, `status`).
2. `User` (`users`): Global identity (`id`, `email`, `fullName`, `phone`, `status`, `mfaEnabled`).
3. `Role` (`roles`): RBAC role definitions (`id`, `name`, `description`, `isSystem`).
4. `Permission` (`permissions`): Granular permissions (`id`, `action`, `subject`, `description`).
5. `RolePermission` (`role_permissions`): Join table mapping roles to permissions.
6. `Membership` (`memberships`): Tenant-user-role linkage (`tenantId`, `userId`, `roleId`).
7. `Case` (`cases`): Core visa application (`tenantId`, `clientId`, `caseNumber`, `countryCode`, `serviceType`, `status`, `priority`, `metadata`).
8. `Task` (`tasks`): Operational workflow steps (`tenantId`, `caseId`, `title`, `status`, `priority`, `assignedToUserId`, `dueDate`).
9. `Document` (`documents`): Vault document records (`tenantId`, `caseId`, `fileName`, `filePath`, `fileSize`, `mimeType`, `status`, `checksum`, `metadata`).
10. `AuditLog` (`audit_logs`): Immutable audit trail (`tenantId`, `userId`, `action`, `entityType`, `entityId`, `oldValues`, `newValues`, `ipAddress`, `userAgent`).

### 3.2 The Single Migration-Owner Rule

> [!CAUTION]
> **STRICT BAN:** AI agents must NEVER modify `packages/database/prisma/schema.prisma` or create new migration SQL files in `packages/database/prisma/migrations/` UNLESS the user prompt explicitly requests a database schema change.
> Any unapproved schema modification violates the Single Migration-Owner Rule (ADR-004/ADR-007) and will cause CI failure on `PostgreSQL Migration & RLS Check`.

### 3.3 PostgreSQL 16 Kernel RLS & Security Roles

1. **Non-Superuser Runtime Role (`visahobe_app`):** The application connection pool runs as `visahobe_app` with `NOSUPERUSER NOBYPASSRLS`. It cannot bypass Row-Level Security.
2. **Session Context Variables:** Every database transaction sets the verified tenant claim before executing queries:
   ```sql
   SET LOCAL app.current_tenant_id = '<verified-tenant-uuid>';
   SET LOCAL app.current_user_role = '<client|admin|case_manager|verifier>';
   ```
3. **RLS Policy Enforcement:** All tenant-scoped tables (`cases`, `tasks`, `documents`, `memberships`, `audit_logs`) have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY` enabled.
4. **Tenant Header Spoofing Rejection:** Client HTTP headers (e.g. `x-tenant-id`) are **strictly ignored** for data isolation. The tenant context is extracted solely from the cryptographically verified JWT claim.

### 3.4 Document Storage Invariant (Zero Raw Binaries in DB)

- Never store binary file data (BLOBs, base64 strings) in PostgreSQL tables.
- All documents (passports, financial records, visa forms) are stored in S3-compatible private object storage using tenant-isolated path hierarchies: `tenants/{tenant_id}/cases/{case_id}/documents/{document_id}`.
- Downloads and uploads use short-lived presigned URLs (TTL <= 15 minutes) generated via `@visahobe/core` storage boundary service.
- All file uploads MUST pass through `sanitizeUploadFilename()` from `@visahobe/core` to strip POSIX and Windows directory traversal attacks (`../`, `..\`) and drive letters.

---

## Section 4: UI Design (`ADR-009`), Security & PII Guardrails

### 4.1 Authoritative Visual Identity & Palette (`ADR-009`)

| Palette Token     | Hex Code        | Role in UI              | Usage Invariant                                                                               |
| :---------------- | :-------------- | :---------------------- | :-------------------------------------------------------------------------------------------- |
| **Brand Primary** | `#0D3B2E`       | Deep Emerald Dark-Green | Primary buttons, active nav pills, status headers, splash screen                              |
| **Brand Hover**   | `#092A21`       | Darker Emerald          | Hover/pressed state on primary emerald controls                                               |
| **Brand Accent**  | `#145342`       | Mid-Emerald             | Focus rings, borders on selected cards, subtle gradient stops                                 |
| **Surface White** | `#FFFFFF`       | Pure White              | Data table rows, card canvases, form inputs, primary content panels                           |
| **Surface Muted** | `#F8FAFC`       | Soft Off-White          | Page canvas background, secondary sidebars, zebra striping                                    |
| **Border Subtle** | `#E2E8F0`       | Hairline Slate          | 1px borders on solid data tables, cards, inputs                                               |
| **Status Tokens** | Green/Amber/Red | Semantic Feedback       | `#15803D` (Verified/Success), `#B45309` (Pending/Warning), `#B91C1C` (Action Required/Danger) |

### 4.2 The ADR-009 High-Contrast Solid Table Rule (CRITICAL)

> [!WARNING]
> **Liquid Glass (`backdrop-filter: blur(...)`) is STRICTLY FORBIDDEN on:**
>
> - Data tables (e.g. Document Vault checklists, case queues, applicant directories).
> - Document comparison and OCR extraction verification diffs.
> - Financial ledgers, invoice tables, fee breakdowns.
> - Form input fields and long statutory disclosure text.
>
> **Solid White Invariant:** All tabular data MUST be rendered on solid, high-contrast white surfaces (`bg-white`) with crisp 1px borders (`#E2E8F0`) and 0 blur. This prevents text distortion, reduces visual fatigue, and guarantees 100% legibility for government officers and applicants.
>
> **Permitted Liquid Glass Surfaces:** Reserved exclusively for sticky top navigation (`NavbarShell`), hero trust badges, floating command palettes (`Cmd+K`), active milestone summary indicators, upload drag-and-drop modals, and notification drawers.

### 4.3 Defense-in-Depth PII & Secret Redaction (Zero Leakage)

1. **Structured Logging:** All server-side and API routes must instantiate and log via `@visahobe/core`:
   ```ts
   import { createLogger } from '@visahobe/core';
   const logger = createLogger({ service: 'my-service-name' });
   ```
2. **Layered PII Redaction:**
   - **Layer 1 (Field Denylist):** Automatically redacts `password`, `apiKey`, `passportNumber`, `creditCard`, `token`, `secret`, `ssn`, `nid`.
   - **Layer 2 (Allowlist Validation):** Validates outbound payloads against strict Zod schemas.
   - **Layer 3 (Regex Fallback):** Scans and redacts unformatted passport numbers, email addresses, and phone numbers in unstructured text and stack traces.
3. **Deep Links & Mobile URL Safety:** Never append raw applicant PII (emails, names, passport numbers) to deep-link query parameters. Deep links must route through `resolveAppDeepLink()` from `@visahobe/mobile` which automatically scrubs sensitive query keys.

---

## Section 5: Current Roadmap Progress & Strict Git/PR Workflow

### 5.1 Monorepo Implementation Status

- **Phase 0 — Foundation (`TICKET-P0-001` through `TICKET-P0-008`):**
  - **100% COMPLETE & SIGNED OFF.** Formally verified via `pnpm verify:phase-0` (25/25 checks passing).
- **Phase 1 — Design System & Public Website (`TICKET-P1-001` through `TICKET-P1-005`):**
  - `TICKET-P1-001`: Design Tokens & Liquid Glass UI Kit (`@visahobe/design-system`, `@visahobe/ui`) — **MERGED**
  - `TICKET-P1-002`: Next.js 15 Public Website & Eligibility Intake (`apps/website`) — **MERGED**
  - `TICKET-P1-003`: CMS Content Pipeline & Dynamic Country Guides (`packages/cms`, `apps/website`) — **MERGED**
  - `TICKET-P1-004`: Client Dashboard Workspace & Document Vault (`apps/client-dashboard`) — **MERGED**
  - `TICKET-P1-005`: Android Mobile App Capacitor Packaging & Native Bridge (`apps/mobile`) — **MERGED**
- **Phase 2 — Internal Operations & Case Management Command Center:**
  - **NEXT ACTIVE MILESTONE:** Starting with `TICKET-P2-001` (Super Admin PWA & Core Operations Workspace in `apps/super-admin`).

### 5.2 Strict Git & Pull Request Rules (Zero Self-Merge)

1. **Branch Hygiene:**
   - Always pull the latest `main` before starting any ticket:
     ```bash
     git checkout main
     git pull origin main
     ```
   - Always create a dedicated, ticket-scoped feature branch:
     ```bash
     git checkout -b feature/ticket-<phase>-<number>-<slug>
     # or for maintenance:
     git checkout -b chore/<slug>
     ```
2. **Conventional Commits:**
   - Commit messages must follow the standard conventional format:
     `feat(<scope>): <description>` (e.g. `feat(client-dashboard): build case timeline and document vault (TICKET-P1-004)`)
     `fix(<scope>): <description>`
     `chore(<scope>): <description>`
3. **Push & PR Rules:**
   - Push ONLY the dedicated feature branch:
     ```bash
     git push -u origin <branch-name>
     ```
   - **NEVER push directly to `main`.**
   - **NEVER merge Pull Requests yourself.** The agent must provide the one-click comparison URL and leave code review and PR merge authorization to the human repository owner.
