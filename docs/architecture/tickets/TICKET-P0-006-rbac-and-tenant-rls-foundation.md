# TICKET-P0-006: Row-Level Security (RLS) Policies and RBAC Evaluator

**Ticket ID:** TICKET-P0-006  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 2 Engineering Days  
**Dependencies:** [TICKET-P0-004](./TICKET-P0-004-database-and-migration-pipeline.md), [TICKET-P0-005](./TICKET-P0-005-auth-mfa-baseline.md)  
**Related ADRs:** [ADR-002](../decisions/ADR-002-tenant-isolation-model.md), [ADR-008](../decisions/ADR-008-security-auth-and-permission-boundaries.md)

---

## 1. Objective

Implement and verify the defense-in-depth tenant isolation model by connecting verified session claims to PostgreSQL Row-Level Security (RLS) policies (`CREATE POLICY`) and secure tenant-context session variables (`SET LOCAL app.current_tenant_id`), supported by a high-performance RBAC permission evaluation engine.

---

## 2. Scope of Work

1. **PostgreSQL RLS Policies as Primary Isolation Boundary:**
   - Define and deploy comprehensive RLS SQL policies across all tenant-owned entities (`cases`, `tasks`, `documents`, `audit_logs`, `invoices`, `chat_threads`):
     ```sql
     ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

     CREATE POLICY cases_tenant_isolation ON cases
       FOR ALL
       USING (
         tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
         OR (
           current_setting('app.current_user_role', true) IN ('owner', 'admin', 'case_manager', 'verifier')
           AND NULLIF(current_setting('app.has_scoped_access', true), 'false')::boolean = true
         )
       )
       WITH CHECK (
         tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
       );
     ```
   - **Boundary vs Trigger Clarification:** PostgreSQL RLS policies (`CREATE POLICY`) are the primary, non-bypassable tenant-isolation boundary. Database triggers are strictly reserved for audit logging, invariant checks, and timestamps.

2. **Database Context Middleware Bridge:**
   - Integrate `extractSession` with `withTenantContext`:
     - Every authenticated HTTP request or worker task executing a database transaction sets the local PostgreSQL session parameters:
       - `app.current_tenant_id`
       - `app.current_user_id`
       - `app.current_user_role`
       - `app.has_scoped_access` (boolean flag set only when authorized staff access is audited)

3. **RBAC Permission Evaluation Engine (`packages/auth/src/permissions.ts`):**
   - Implement `hasPermission(session: UserSession, permission: PermissionKey): boolean`.
   - Implement `requirePermission(permission: PermissionKey)` route middleware.
   - Cache role-to-permission mappings in memory with TTL to ensure sub-millisecond evaluation without repeated database round-trips.

4. **Object Storage Signed URL Tenant Boundary:**
   - Storage service verifies caller's `tenant_id` against the document's `tenant_id` before issuing short-lived pre-signed download/upload URLs. Cross-tenant signed URL requests throw `ForbiddenException`.

5. **Cross-Tenant Security Test Suite (`tests/security/tenant-isolation.test.ts`):**
   - Write comprehensive automated integration tests against live PostgreSQL test container:
     - **Test 1:** Seed Case for Tenant A. Authenticated with Tenant B JWT, execute `SELECT * FROM cases WHERE id = case_a_id`. Assert result is empty / null.
     - **Test 2:** Authenticated with Tenant B JWT, attempt `UPDATE documents SET filename = 'tampered.pdf' WHERE id = doc_a_id`. Assert zero rows updated / permission denied.
     - **Test 3:** Authenticated with Tenant B JWT, request a signed download URL for Tenant A's document. Assert HTTP 403 Forbidden.
     - **Test 4:** Super Admin user without explicit scoped permission or audit logging attempts to read tenant cases. Assert access is denied.
     - **Test 5:** Super Admin user with explicit scoped permission accesses tenant case. Assert audit log entry is immediately created in `audit_logs` with actor attribution, timestamp, and accessed tenant ID.

---

## 3. Deliverables

- [ ] Complete RLS policy definitions in `database/policies/` and applied via Prisma migration.
- [ ] Context bridge middleware in `packages/database/src/tenant-context.ts`.
- [ ] RBAC permission evaluator in `packages/auth/src/permissions.ts`.
- [ ] Tenant-verified storage URL service in `packages/core/src/storage/`.
- [ ] Automated security test suite in `tests/security/tenant-isolation.test.ts`.

---

## 4. Acceptance Criteria

1. **Tenant Isolation:** A request with Tenant A JWT cannot read Tenant B cases, tasks, or messages, and cannot update Tenant B document metadata under any condition.
2. **Storage Isolation:** Pre-signed storage URLs cannot be generated for another tenant's files; cross-tenant download/upload attempts are rejected with HTTP 403.
3. **Privileged Staff Scoping:** Super Admin or internal staff roles cannot access tenant data without explicit scoped permission and automated append-only audit logging.
4. **Primary Boundary Enforcement:** PostgreSQL RLS policies (`CREATE POLICY`) strictly enforce row access; database triggers are verified as auxiliary audit/invariant mechanisms only.
5. All security integration tests in `tests/security/tenant-isolation.test.ts` pass in CI.

---

## 5. Verification Commands

```bash
pnpm --filter @visahobe/database test
pnpm exec vitest run tests/security/tenant-isolation.test.ts
```
