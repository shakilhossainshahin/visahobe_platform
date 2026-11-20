# TICKET-P3-002: Scoped Admin & Partner MCP Servers (PostgreSQL 16 Kernel RLS Boundaries) & B2C Client Shielding Layer

- **Ticket ID:** `TICKET-P3-002`
- **Phase:** Phase 3 — Super AI Agent & Scoped MCP Server Infrastructure
- **Priority:** `P0`
- **Status:** `Completed & Verified`
- **Governing ADRs:** `ADR-012` (Scoped MCP Boundaries & B2C Client Shielding), `ADR-010` (3-Tier B2B2C & Prepaid Wallet), `ADR-011` (Super AI Agent Autonomy Matrix), `ADR-004`/`ADR-007` (RLS & Single Migration Owner)

---

## 1. Objective

Implement the complete Scoped Model Context Protocol (MCP) server architecture under `ADR-012`:

1. **Admin MCP Server (`@visahobe/admin-mcp-server`)**: Full operational control, strictly enforcing Authenticator Assurance Level 2 (AAL2 MFA) and RBAC tool execution with append-only audit logging and PII redaction.
2. **Partner MCP Server (`@visahobe/partner-mcp-server`)**: Scoped strictly to the calling partner agency's `tenant_id` via cryptographically verified JWT claims and PostgreSQL 16 Kernel RLS (`SET LOCAL app.current_tenant_id = X`), blocking administrative tools and cross-tenant queries.
3. **B2C Client Shielding Layer (`@visahobe/core`, `services/api`, `apps/client-dashboard`)**: Defense-in-depth data shielding ensuring retail applicants never receive internal casework notes, agent confidence scores, wholesale fee margins, or raw MCP endpoints.

---

## 2. Core Deliverables

### Step A — Scoped Admin MCP Server (`packages/admin-mcp-server`)

- **Package Identity**: Registered `@visahobe/admin-mcp-server` (`v0.1.0`) in `pnpm-workspace.yaml` and `vitest.workspace.ts`.
- **AAL2 MFA Enforcement**:
  - Validates session context for Authenticator Assurance Level 2 (`aal: 'aal2'` or `isMfaVerified: true`).
  - Rejects single-factor sessions (`aal1`) with `AdminMcpMfaRequiredError` (HTTP 403 / JSON-RPC error code `-32001`).
- **Role-Based Tool Scoping**:
  - Strict role mapping for administrative staff roles: `owner`, `admin`, `case_manager`, `verifier`, and `finance`.
  - Disallows unauthorized operations with `AdminMcpPermissionError`.
- **Hardened Admin Tool Registry**:
  - `listAllTenants`: Inspect platform-wide partner and client tenants with status filters.
  - `inspectCaseAuditTrail`: Review immutable audit history for specific cases.
  - `reassignCaseSpecialist`: Reassign case managers or verifiers with audit tracking.
  - `triggerBrowserUseReplay`: Trigger dry-run automated filing replays with safety checkpoints.
  - `adjustAgencyWalletBalance`: Credit/debit partner wallets through strict ledger double-entry.
  - `dispatchDailyExecutiveDigest`: Compile and dispatch executive operations digest.
- **Append-Only Audit Logging & PII Redaction**:
  - Records every tool invocation in `AuditService` with execution status, actor identity, and duration.
  - Automatically scrubs sensitive PII (passports, tokens, bank accounts) from inputs and output payloads via `@visahobe/core` redactor.

### Step B — Scoped Partner MCP Server (`packages/partner-mcp-server`)

- **Package Identity**: Registered `@visahobe/partner-mcp-server` (`v0.1.0`) in `pnpm-workspace.yaml` and `vitest.workspace.ts`.
- **Kernel RLS & Boundary Invariant**:
  - Extracts `tenant_id` exclusively from cryptographically verified JWT claims.
  - Strictly ignores spoofed HTTP headers (e.g., `x-tenant-id`).
  - Sets PostgreSQL 16 transaction context variables:
    `SET LOCAL app.current_tenant_id = '<partner_tenant_id>'`
    `SET LOCAL app.current_user_role = 'partner'`
- **Anti-Superadmin Tool Barrier**:
  - Rejects any invocation of administrative tools (`listAllTenants`, `adjustAgencyWalletBalance`, etc.) with `PartnerMcpForbiddenToolError` (HTTP 403 / JSON-RPC error code `-32003`).
- **Cross-Tenant Access Rejection**:
  - Detects and rejects cross-tenant case or document queries with `PartnerMcpBoundaryViolationError`.
- **Partner-Scoped Operational Tool Registry**:
  - `listAgencyCases`: List cases belonging strictly to the partner agency.
  - `getCaseDocumentChecklist`: Retrieve document requirements and verification status for agency cases.
  - `checkWalletBalance`: Inspect partner agency prepaid wallet balance and currency.
  - `submitVisaCase`: Submit a new visa application with atomic case fee debit from agency wallet.
  - `uploadCaseDocument`: Register and sanitize applicant documents into case vault.

### Step C — B2C Client Shielding Layer (`@visahobe/core`)

- **Client Tier Resolution (`ClientShieldingService`)**:
  - Resolves client context into `b2c_retail`, `b2b2c_partner`, or `internal_staff`.
- **Case Record Sanitization (`shieldCaseRecord`)**:
  - Strips internal casework notes (`internalNotes`), agent confidence metrics (`confidenceScore`, `autonomyLevel`), and wholesale margin breakdown for retail applicants.
- **Intake & Assessment Sanitization (`shieldIntakeAssessment`)**:
  - Redacts internal risk flags and wholesale partner rates for B2C applicants.
- **Branding Isolation (`shieldBranding`)**:
  - Replaces agency custom white-label branding with default VisaHobe branding when accessed in retail mode.
- **Raw MCP Access Enforcement (`assertNoRawMcpAccess`)**:
  - Strictly prevents retail applicants from accessing raw MCP endpoints or JSON-RPC handlers, throwing `RawMcpAccessForbiddenError`.
- **AI Concierge Shielding (`shieldConciergeMessage`)**:
  - Validates and sanitizes AI concierge responses, guaranteeing no leakage of system prompts or restricted internal operational metadata.

### Step D — Operations API & Client Dashboard Integration

- **Operations API (`services/api/src/http/handlers.ts`)**:
  - Integrates `ClientShieldingService` in `GET /api/v1/cases` and `GET /api/v1/cases/:id` to automatically scrub data based on the caller's verified tier.
- **Client Dashboard (`apps/client-dashboard`)**:
  - Verified built-in AI Concierge operates within the ADR-012 shielded envelope with zero raw MCP endpoints exposed to browser clients.

---

## 3. Verification & Pre-Push Gate

All 7 mandatory pre-push verification gates pass with exit code `0`:

1. `pnpm install --frozen-lockfile` (33 projects linked)
2. `pnpm format:check` (Prettier verified across all workspace packages)
3. `pnpm lint` (0 ESLint errors, 0 warnings)
4. `pnpm typecheck` (All 33 projects typecheck cleanly)
5. `pnpm test` (60 test files, 351 unit and integration tests passing)
6. `pnpm build` (All 13 packages and 3 Next.js applications build cleanly)
7. `pnpm verify:phase-0` (25/25 baseline criteria passing)
