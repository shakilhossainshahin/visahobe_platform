# ADR-012: Scoped Model Context Protocol (MCP) Servers and Multi-Tenant Kernel RLS Boundaries

**Status:** Accepted  
**Date:** 15 November 2026  
**Deciders:** Core Architecture Team, Security & Compliance Lead, AI Platform Lead  
**Consulted:** Final Architecture Blueprint v2.0, ADR-002 (Tenant Isolation), ADR-008 (Security & Auth)

---

## 1. Context and Problem Statement

The Model Context Protocol (MCP) has emerged as an open standard for connecting AI models to external tools, data sources, and operational environments. Within VisaHobe, autonomous specialist agents, internal staff tools (such as the Super Admin CLI), and partner agency workspaces utilize tools to query cases, inspect documents, trigger workflows, and review status.

However, exposing raw, monolithic MCP endpoints across multi-tenant environments introduces severe security hazards:

1. **Cross-Tenant Data Leakage:** A partner agency utilizing an AI assistant via MCP could inadvertently or maliciously query another partner's cases, client PII, or financial records if tool implementations lack database-level isolation.
2. **Privilege Escalation:** Unprivileged users or external agents could invoke sensitive administrative tools (such as model configuration, tenant suspension, or database inspection) intended strictly for internal platform operators.
3. **Prompt Injection & Unbounded Execution:** Direct exposure of MCP tool registries to retail B2C applicants creates injection vectors where malicious prompts could trigger unintended system actions.

An architectural boundary separating internal administrative MCP tooling, tenant-scoped partner agency MCP tooling, and B2C client interactions is required.

---

## 2. Decision Drivers

- **Zero Cross-Tenant Leakage:** An MCP tool executed on behalf of a partner agency must be physically incapable of accessing another tenant's records, even under prompt injection or coding defects.
- **Mandatory Staff MFA (AAL2):** Administrative MCP capabilities must be restricted to authenticated staff with verified Authenticator Assurance Level 2 (AAL2).
- **PostgreSQL Kernel RLS Enforcement:** MCP tool handlers must execute database queries through PostgreSQL 16 Kernel Row-Level Security rather than relying solely on application-level `WHERE` clauses.
- **B2C Surface Defense:** Retail applicants must never be granted direct access to raw MCP server endpoints.

---

## 3. Decision

VisaHobe adopts a **Tiered Scoped MCP Architecture** comprising two dedicated server instances and an isolated client AI concierge:

```
[ Super Admin Staff / CLI ] ----> [ Admin MCP Server ] ----> PostgreSQL 16 (Full Admin RLS)
   (MFA AAL2 Required)           (Cross-Tenant Tools)         (Audit Logging Mandatory)

[ B2B Partner Agency ] ---------> [ Partner MCP Server ] ---> PostgreSQL 16 (Tenant-Scoped RLS)
   (JWT Claim: tenant_id)         (Scoped Agency Tools)       (app.current_tenant_id = X)

[ B2C Retail Applicants ] ------> [ Built-in AI Concierge ] -> Scoped Chat Stream (No Raw MCP)
   (Client Portal / App)          (Read-Only Safe Intent)
```

### 3.1 Admin MCP Server (`@visahobe/admin-mcp-server` / `apps/super-admin/mcp`)

1. **Authentication & Session Gate:**
   - Accessible only by internal operators authenticated with staff claims and verified MFA (`aal: 'aal2'`).
   - Rejects unauthenticated or unverified requests with `401 Unauthorized` / `403 Forbidden`.
2. **Operational Tool Registry:**
   - Exposes platform-wide operational tools: `listAllTenants`, `inspectCaseAuditTrail`, `reassignCaseSpecialist`, `triggerBrowserUseReplay`, `adjustAgencyWalletBalance`, and `dispatchDailyExecutiveDigest`.
3. **Mandatory Audit Trail:**
   - Every tool call executes within an audit wrapper that records the calling staff `userId`, `toolName`, input parameters (scrubbed of PII), execution status, and timestamp to `audit_logs`.

### 3.2 Partner MCP Server (`@visahobe/partner-mcp-server`)

1. **Strict Tenant Context Derivation:**
   - Derives calling `tenant_id` exclusively from the cryptographically verified JWT claim. Client-supplied headers or parameters attempting to override tenant context are strictly rejected.
2. **PostgreSQL 16 Kernel RLS Binding:**
   - Every MCP tool database transaction sets transaction-scoped session context:
     ```sql
     SET LOCAL app.current_tenant_id = '<verified-agency-tenant-uuid>';
     SET LOCAL app.current_user_role = 'partner';
     ```
   - All queries pass through PostgreSQL RLS policies. Any attempt to read or modify another tenant's cases, documents, or wallet records returns empty sets or throws permission violations at the kernel level.
3. **Scoped Partner Tool Registry:**
   - Exposes tools limited to the agency's domain:
     - `listAgencyCases`: Query cases owned by the calling agency.
     - `getCaseDocumentChecklist`: Check submission requirements for an agency case.
     - `checkWalletBalance`: Inspect the agency's prepaid wallet and recent ledger entries.
     - `submitVisaCase`: Submit an agency visa application and trigger atomic wallet deduction.
   - Administrative tools (tenant provisioning, cross-tenant auditing, global provider routing) are **completely omitted** from the Partner MCP registry.

### 3.3 B2C Client Shielding (Built-in AI Concierge)

1. **No Raw MCP Endpoint Exposure:**
   - Retail applicants (B2C) and agency-sponsored applicants are **never** provided endpoints to execute MCP tools directly.
2. **Guided AI Concierge:**
   - Applicants interact with a constrained conversational interface running in `@visahobe/client-dashboard` and `@visahobe/mobile`.
   - The concierge can answer policy FAQs, explain missing document requirements, and stream response tokens, but invokes backend actions solely through verified, parameter-validated internal REST APIs.

---

## 4. Consequences and Invariants

### Positive Consequences

- **Ironclad Multi-Tenancy:** Partner agency AI integrations cannot breach tenant boundaries even under adversarial prompt manipulation.
- **Enterprise Staff Auditing:** Full visibility into every administrative tool invocation executed by human operators or CLI agents.
- **Attack Surface Minimization:** B2C clients cannot discover or probe backend tool APIs.
- **Standardized Tool Contracts:** Consistent Zod schema definitions across all tools guarantee strict input validation.

### Negative Consequences / Trade-offs

- **Dual Server Maintenance:** Maintaining separate Admin and Partner MCP servers requires synchronized schema contracts and shared core library packages.
- **Session Management:** Partner MCP tools require stateless JWT verification or signed ephemeral session tokens for CLI/IDE agent integrations.

---

## 5. Security & Isolation Invariants

1. **Kernel RLS Invariant:** Partner MCP tools must never query the database using connection pool superuser bypass credentials. All queries must run under the `visahobe_app` role with `SET LOCAL app.current_tenant_id` active.
2. **PII Redaction Invariant:** Outbound tool results returned to AI models must be filtered through `@visahobe/core` PII redactors to strip raw passport numbers and payment card details.
3. **MFA AAL2 Enforcement:** Admin MCP server initialization and tool execution must fail closed if the calling user's JWT reflects `aal1` (single-factor).
