# TICKET-P2-003: Enterprise Architecture Blueprint Upgrade (3-Tier B2B2C SaaS, Prepaid Agency Wallet, Dynamic Partner Connectors, Super AI Agent Autonomy & Scoped MCP Servers)

**Status:** Completed & Verified  
**Priority:** P0 (Foundational Architecture Milestone)  
**Estimated Effort:** 2 days  
**Target Release:** Phase 2 (Enterprise Operations Baseline)  
**Authoritative Documents:**

- `VisaHobe_Final_Architecture_Blueprint_v2.0.md`
- `docs/architecture/decisions/ADR-010-b2b2c-partner-agency-and-prepaid-wallet.md`
- `docs/architecture/decisions/ADR-011-super-ai-agent-autonomy-and-partner-connectors.md`
- `docs/architecture/decisions/ADR-012-scoped-mcp-servers-and-tenant-boundaries.md`
- `AGENTS.md` / `.antigravity/rules.md`

---

## 1. Executive Summary & Objective

The initial VisaHobe architecture was designed as a direct B2C visa assistance platform with internal operator controls. To scale globally across hundreds of partner travel agencies, overseas law firms, and corporate immigration desks, the enterprise architecture requires a unified, high-throughput upgrade:

1. **3-Tier Hierarchical Multi-Tenant B2B2C Model:** Structuring the platform into Tier 1 (Platform Owner / Super Admin), Tier 2 (B2B Partner Travel Agencies with custom domains, white-label branding, and staff seats), and Tier 3 (End Applicants under B2C or Agency sponsorship).
2. **Prepaid Agency Wallet & Immutable Financial Ledger:** Eliminating platform credit risk via an upfront agency wallet model with atomic balance validation, auto-deduction upon visa case submission, and an immutable double-entry ledger.
3. **Hybrid Fulfillment Strategy & Dynamic Partner Connector Registry:** Seamlessly operating between direct autonomous AI visa processing (`@visahobe/agents` + `@visahobe/browser-automation`) and external partner delegation (`@visahobe/integrations` + `workers/partner-sync`) for regional law firms and visa portals.
4. **Super AI Agent Autonomy & Executive Digest:** Implementing a 3-level confidence-based autonomy matrix, mandatory Human-in-the-Loop review gates (`in_review`) for high-risk consular filings, and automated daily executive KPI digests for leadership.
5. **Scoped Model Context Protocol (MCP) Servers:** Providing dedicated, authenticated MCP servers for Super Admin operators (AAL2 MFA required) and Partner Agencies (strictly isolated by `tenant_id` via PostgreSQL 16 Kernel RLS), while shielding B2C applicants behind a safe AI Concierge.

---

## 2. Core Architectural Pillars

### 2.1 3-Tier Hierarchical Multi-Tenant B2B2C Model

```mermaid
graph TD
    T1["Tier 1: Platform Owner<br/>(admin.visahobe.com)<br/>Super Admin & Root Operations"]
    T2A["Tier 2: Partner Agency A<br/>(agency1.travel.com)<br/>White-Label Portal & Prepaid Wallet"]
    T2B["Tier 2: Partner Agency B<br/>(visahobe.com/p/bengal-travel)<br/>Branded Portal & Prepaid Wallet"]
    T2C["Direct VisaHobe B2C<br/>(visahobe.com)<br/>Platform Native Consumer Desk"]
    T3A["Tier 3: Agency A Applicants<br/>(Client Dashboard & Mobile App)"]
    T3B["Tier 3: Agency B Applicants<br/>(Client Dashboard & Mobile App)"]
    T3C["Tier 3: Direct Retail Applicants<br/>(Client Dashboard & Mobile App)"]

    T1 --> T2A
    T1 --> T2B
    T1 --> T2C
    T2A --> T3A
    T2B --> T3B
    T2C --> T3C
```

- **Tier 1 (Platform Owner / Super Admin):** `admin.visahobe.com` (Port 3002). Root governance, cross-tenant system metrics, global provider routing, billing oversight, and security auditing.
- **Tier 2 (B2B Partner Travel Agencies):** Managed entities with white-label branding (logo, primary color, company info), custom domain/subdomain routing, agency staff/case manager seats, and wholesale pricing tiers.
- **Tier 3 (End Applicants):** Direct retail or agency-sponsored applicants accessing `app.visahobe.com` or white-label portal, Android app, solid document vault, and live 5-stage case timeline.

### 2.2 Prepaid Agency Wallet & Double-Entry Ledger

```mermaid
sequenceDiagram
    autonumber
    actor Agency as Partner Agency Staff
    participant Web as Agency Portal
    participant API as Operations API
    participant Wallet as Wallet Engine
    participant DB as PostgreSQL 16 (RLS)

    Agency->>Web: Top Up Wallet ($5,000 via Pay Station / Stripe)
    Web->>API: POST /api/wallet/topup
    API->>Wallet: Process Gateway Webhook
    Wallet->>DB: INSERT wallet_transactions (CREDIT, balance += $5000)
    Note over Wallet,DB: Immutable Ledger Entry Verified

    Agency->>Web: Submit New Visa Application (e.g. Case $85 fee)
    Web->>API: POST /api/cases/submit
    API->>Wallet: Deduct Fee (Atomic Check & Lock)
    Note over Wallet,DB: SELECT balance FROM agency_wallets WHERE tenant_id = x FOR UPDATE
    alt Sufficient Balance
        Wallet->>DB: INSERT wallet_transactions (DEBIT, balance -= $85)
        Wallet->>DB: UPDATE cases SET status = 'submitted'
        API-->>Web: Submission Accepted (Case Active)
    else Insufficient Balance
        Wallet-->>API: InsufficientFundsError (Overdraft Rejected)
        API-->>Web: Error 402: Please Top Up Agency Wallet
    end
```

- **Zero Overdraft Invariant:** An agency cannot initiate automated processing or case submission without sufficient settled funds in their prepaid wallet.
- **Atomic Locking:** Balance deduction uses pessimistic locking (`SELECT ... FOR UPDATE`) within a database transaction context to prevent race conditions during bulk case uploads.
- **Auditable Reconciliation:** Every movement of funds is recorded in `wallet_transactions` referencing `tenant_id`, `case_id`, `amount`, `balance_before`, `balance_after`, `reference_type`, and cryptographic checksums.

### 2.3 Hybrid Fulfillment & Dynamic Partner Connector Registry

```mermaid
flowchart TD
    Case["New Visa Case Submitted<br/>(Country: X, Category: Y)"] --> Router{"Fulfillment Strategy Router<br/>(@visahobe/orchestrator)"}

    Router -->|No External Partner Required<br/>e.g. Direct e-Visa / Portal| AI["Direct Autonomous AI Fulfillment<br/>(@visahobe/agents + @visahobe/browser-automation)"]
    Router -->|Licensed Partner Mandatory<br/>e.g. In-Country Law Firm / VFS Booking| Registry["Dynamic Partner Connector Registry<br/>(@visahobe/integrations + workers/partner-sync)"]

    AI --> LevelEval{"Confidence Score Evaluation<br/>(Target >= 0.95)"}
    LevelEval -->|Confidence >= 0.95 & Low-Risk| DirectSubmit["Level 3: Autonomous Submission"]
    LevelEval -->|Confidence < 0.95 or High-Risk| StaffGate["Level 2: Verifier Approval Gate<br/>(Status: in_review)"]

    Registry --> Connector["Pluggable Partner Adapter<br/>(REST API / Webhook / SFTP)"]
    Connector --> Partner["External Partner Agency / Law Firm"]
    Partner --> Sync["Bidirectional Status Sync<br/>(Worker Task Queue)"]

    StaffGate --> VerifiedSubmit["Staff Authorized Submission"]
```

- **Pluggable Interface (`IPartnerConnector`):**
  - Standardized lifecycle methods: `dispatchCase()`, `fetchCaseStatus()`, `syncDocuments()`, and `handleWebhook()`.
  - Independent connector adapters for regional immigration firms, embassy submission desks, and courier services.
- **Direct Autonomous AI:** Headless browser automation and form population executing through `@visahobe/browser-automation` with strict domain allowlists and human takeover support.

### 2.4 Super AI Agent Autonomy & Executive Digest

| Autonomy Level | Designation               | Scope & Behavior                                                                                           | Verification Gate                                                                                |
| :------------- | :------------------------ | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **Level 1**    | **Assisted Draft**        | AI extracts OCR data, flags document discrepancies, drafts statutory visa application forms.               | Mandatory staff review before saving form state.                                                 |
| **Level 2**    | **Semi-Autonomous**       | AI prepares complete case package, validates eligibility checklist, prepares submission payloads.          | **Verifier Gate (`in_review`):** Human case manager must explicitly authorize before submission. |
| **Level 3**    | **Autonomous Submission** | Automated submission to official government e-visa portals (e.g. Singapore, UAE, Turkey standard e-visas). | Restricted to pre-approved country/visa categories with confidence score >= 0.95.                |

- **Mandatory Consular Gate:** Under no circumstances may an AI agent execute fee payments on live government portals or schedule consular biometrics without explicit human authorization.
- **Daily Executive Digest:** Scheduled daily cron worker generating executive platform summaries:
  - Total active cases, new submissions, completed visas.
  - Overall agent success rate and autonomous vs assisted ratios.
  - Agency wallet balances, low-balance warnings, total processed volume.
  - SLA breach warnings and stalled case escalations.

### 2.5 Scoped Model Context Protocol (MCP) Architecture

```mermaid
graph LR
    subgraph Operators ["Internal Operators & Super Admin"]
        AdminUser["Super Admin Staff<br/>(MFA AAL2 Active)"]
        AdminCLI["Super Admin CLI<br/>(super-agent-cli)"]
    end

    subgraph Partners ["B2B Partner Agencies"]
        PartnerStaff["Agency Case Manager<br/>(JWT Claims: tenant_id)"]
        PartnerAgent["Agency AI Assistant<br/>(Client Agent Workspace)"]
    end

    subgraph B2C ["End Applicants"]
        Applicant["Retail Applicant<br/>(Browser / Android Mobile)"]
    end

    subgraph MCPLayer ["MCP Server Layer"]
        AdminMCP["Admin MCP Server<br/>(@visahobe/admin-mcp-server)<br/>All-Tenants Admin Tools + Audit Log"]
        PartnerMCP["Partner MCP Server<br/>(@visahobe/partner-mcp-server)<br/>Tenant-Scoped Tools + Kernel RLS"]
        Concierge["Built-in AI Concierge<br/>(Controlled UI Streaming Widget)"]
    end

    subgraph CoreDB ["PostgreSQL 16 Storage"]
        DB[(PostgreSQL 16<br/>Row-Level Security Enforced)]
    end

    AdminUser --> AdminMCP
    AdminCLI --> AdminMCP
    PartnerStaff --> PartnerMCP
    PartnerAgent --> PartnerMCP
    Applicant --> Concierge

    AdminMCP -->|SET LOCAL role = 'admin'| DB
    PartnerMCP -->|SET LOCAL app.current_tenant_id = X| DB
    Concierge -.->|Read-Only Safe FAQ / Status| DB
```

- **Admin MCP Server:** Unrestricted operational capability across all tenants, strictly guarded by staff session validation, AAL2 MFA requirement, and audit logging of every tool invocation.
- **Partner MCP Server:** Isolated to the calling agency's `tenant_id`. Every tool query injects session variables `SET LOCAL app.current_tenant_id = '<agency-uuid>'` and `SET LOCAL app.current_user_role = 'partner'`. Any attempt to read or modify external tenant records triggers an immediate database RLS rejection.
- **B2C Shielding:** Retail applicants do not have access to raw MCP tool servers; they interact exclusively with a client concierge UI widget with fixed domain intent constraints.

---

## 3. Associated Architectural Decisions

This ticket incorporates three formal Architecture Decision Records:

1. `ADR-010`: B2B2C Multi-Tenant Architecture, Agency White-Labeling, and Prepaid Wallet Engine
2. `ADR-011`: Super AI Agent Autonomy Matrix, Consular Review Gates, and Dynamic Partner Connectors
3. `ADR-012`: Scoped Model Context Protocol (MCP) Servers and Multi-Tenant Kernel RLS Boundaries

---

## 4. Verification and Acceptance Criteria

- [x] Master Blueprint `VisaHobe_Final_Architecture_Blueprint_v2.0.md` updated with 3-tier B2B2C, prepaid wallet, dynamic partner connectors, agent autonomy, and scoped MCP servers.
- [x] `ADR-010`, `ADR-011`, and `ADR-012` authored and indexed in `docs/architecture/decisions/README.md`.
- [x] Roadmap in `docs/architecture/tickets/README.md` updated with `TICKET-P2-004`, `TICKET-P3-001`, and `TICKET-P3-002`.
- [x] `AGENTS.md` and `.antigravity/rules.md` synchronized and 100% identical.
- [x] Full 7-step pre-push gate passed (`pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm verify:phase-0`).
