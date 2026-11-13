# ADR-002: Multi-Tenant Isolation Model and Data Boundaries

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Core Architecture Team, Security & Compliance Lead  
**Consulted:** Final Architecture Blueprint v2.0, Master System Blueprint v1.0  

---

## 1. Context and Problem Statement

VisaHobe handles highly sensitive personal, legal, and financial data: biometric passports, bank statements, tax records, company registration filings, and government submission proofs. In a multi-tenant platform, tenant data leakage constitutes a critical compliance, legal, and reputational disaster. 

Earlier SaaS architectures frequently relied on application-level filtering (e.g. `WHERE tenant_id = x` in ORM queries). Application-layer filters are vulnerable to developer oversight, ORM bypasses, raw SQL queries, and agent tool execution vulnerabilities.

A defense-in-depth tenant isolation strategy is required to guarantee zero cross-tenant data exposure.

---

## 2. Decision Drivers

- **Zero-Trust Multi-Tenancy:** A tenant must never read, modify, or infer another tenant's cases, documents, agent chats, browser sessions, or billing records.
- **Agent Safety:** Specialist AI agents and the Client Main Agent must operate strictly within the tenant's bounded context; an agent tool must not be capable of accessing cross-tenant entities.
- **Regulatory Compliance:** GDPR, local data protection laws, and strict confidentiality agreements.
- **Fail-Safe Architecture:** Data access must be prevented at the database layer even if application code contains a bug.

---

## 3. Decision

VisaHobe adopts a **Shared-Database, Tenant-Scoped Architecture enforced by PostgreSQL Row-Level Security (RLS)** backed by cryptographically verified server-side claims:

### 3.1 Core Tenancy Rules
1. **Tenant Identification:**
   - Every tenant-owned table contains an immutable `tenant_id UUID NOT NULL` column with a foreign key reference to `tenants(id)`.
   - Primary entities with mandatory `tenant_id`: `cases`, `case_applicants`, `documents`, `tasks`, `agent_runs`, `chat_threads`, `messages`, `invoices`, `payments`, `browser_sessions`, and `client_information_requests`.

2. **Server-Side Identity Derivation:**
   - The authenticated user's `tenant_id` and `roles` are derived strictly from cryptographically validated session tokens (Supabase Auth JWT or session cookies).
   - Client-provided `tenant_id` headers or query parameters are explicitly ignored for authorization.

3. **Database-Level Enforcement via PostgreSQL RLS:**
   - PostgreSQL RLS is enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) on all tenant tables.
   - Database sessions set transaction-scoped configuration:
     ```sql
     SET LOCAL app.current_tenant_id = 'tenant-uuid';
     SET LOCAL app.current_user_role = 'client';
     ```
   - RLS Policies enforce isolation:
     ```sql
     CREATE POLICY tenant_isolation_policy ON cases
       FOR ALL
       USING (
         tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
         OR current_setting('app.current_user_role', true) IN ('owner', 'admin', 'case_manager', 'verifier')
       );
     ```

4. **Object Storage Isolation:**
   - Private object storage (S3/Cloudflare R2) organizes files by tenant:
     `s3://visahobe-secure-vault/tenants/{tenant_id}/cases/{case_id}/documents/{document_id}/{filename}`
   - No direct public access. File downloads require server-generated, time-limited (max 15 minutes) pre-signed URLs verified against tenant ownership.

5. **Agent & Browser Runtime Scoping:**
   - Agent execution contexts (`agent_runs`) are stamped with `tenant_id`. Tools executed by the agent inherit the caller's tenant boundary and cannot query external tenant IDs.
   - Browser sessions are strictly tenant-isolated; screenshots and live streams are partitioned by `tenant_id`.

---

## 4. Consequences

### Positive
- **Guaranteed Isolation:** Even if an API endpoint forgets a `WHERE tenant_id = ...` clause, PostgreSQL RLS blocks unauthorized rows from being returned or updated.
- **Auditability:** Cross-tenant access attempts immediately trigger PostgreSQL permission exceptions and audit alarms.
- **Simplified Query Logic:** Application code remains clean while database transactions enforce tenancy.

### Negative / Trade-offs
- Super Admin operations that query across tenants (e.g. cross-tenant case queues) must explicitly switch database role context to an authorized internal role.
- Background worker jobs (`pg-boss`) must set the database tenant context explicitly before executing task logic for a tenant.

### Mitigations
- Create an automated Database Context Wrapper in `packages/database` (`withTenantContext(tenantId, callback)`) to guarantee context initialization and cleanup.
- Dedicated automated security test suite that explicitly attempts cross-tenant reads, writes, document downloads, and agent tool executions.

---

## 5. Compliance and Verification Criteria

- [ ] Every database migration must include `ENABLE ROW LEVEL SECURITY` and explicit policies for tenant-owned tables.
- [ ] Automated integration test: Tenant B attempts to select or update Tenant A's case record and receives an empty set or error.
- [ ] Automated storage test: Pre-signed URL generation fails when requested by a user outside the target tenant.
