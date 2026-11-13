# VisaHobe Database Migration Log

This document records all database migrations applied to the VisaHobe multi-tenant PostgreSQL database.

## Migration Governance Standard

1. **Single Migration-Owner Rule:** Only the designated migration owner may modify `schema.prisma` or author migration files.
2. **Reproducible Deployments:** Migrations must run via `prisma migrate deploy` from clean state to completion without manual intervention.
3. **Defense-in-Depth RLS:** All tenant-scoped entities must enable Row-Level Security (`ENABLE ROW LEVEL SECURITY`) and force RLS (`FORCE ROW LEVEL SECURITY`) with policies referencing session context `app.current_tenant_id`.

---

## Migration Index

| Migration ID     | Name                        | Applied Date | RLS Impact                                             | Status         |
| ---------------- | --------------------------- | ------------ | ------------------------------------------------------ | -------------- |
| `20261113000001` | `initial_baseline`          | 2026-11-13   | RLS Enabled & Forced on 5 tenant tables                | Ready / Active |
| `20261113000002` | `scoped_staff_rls_policies` | 2026-11-13   | Refined RLS policies requiring `app.has_scoped_access` | Ready / Active |

---

### Migration: `20261113000001_initial_baseline`

- **Migration ID & Name:** `20261113000001_initial_baseline`
- **Purpose:**
  Initial baseline schema for VisaHobe Phase 0 multi-tenant foundation. Establishes core system models:
  - Tenancy & Identity: `tenants`, `users`
  - RBAC: `roles`, `permissions`, `role_permissions`, `memberships`
  - Core Operations: `cases`, `tasks`, `documents`
  - Compliance: `audit_logs`
- **Rollback / Forward-Fix Plan:**
  - _Rollback SQL:_
    ```sql
    DROP TABLE IF EXISTS audit_logs, documents, tasks, cases, memberships, role_permissions, permissions, roles, users, tenants CASCADE;
    ```
  - _Forward-Fix:_ Create subsequent additive migration via `prisma migrate new`.
- **RLS Impact:**
  - `ALTER TABLE memberships ENABLE ROW LEVEL SECURITY; ALTER TABLE memberships FORCE ROW LEVEL SECURITY;`
  - `ALTER TABLE cases ENABLE ROW LEVEL SECURITY; ALTER TABLE cases FORCE ROW LEVEL SECURITY;`
  - `ALTER TABLE tasks ENABLE ROW LEVEL SECURITY; ALTER TABLE tasks FORCE ROW LEVEL SECURITY;`
  - `ALTER TABLE documents ENABLE ROW LEVEL SECURITY; ALTER TABLE documents FORCE ROW LEVEL SECURITY;`
  - `ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY; ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;`
  - Policies enforce tenant isolation matching `NULLIF(current_setting('app.current_tenant_id', true), '')::uuid` with privileged role bypass (`owner`, `admin`, `case_manager`, `verifier`) via `current_setting('app.current_user_role', true)`.
- **Index Impact:**
  - Primary Keys: UUID with `gen_random_uuid()`
  - Foreign Key Indexes on all relation columns (`tenant_id`, `user_id`, `role_id`, `case_id`, `assigned_to_user_id`)
  - Unique Indexes on `tenants.slug`, `users.email`, `roles.name`, `cases.case_number`, and composite pairs (`memberships(tenant_id, user_id)`, `role_permissions(role_id, permission_id)`, `permissions(action, subject)`)
  - Compound query index `idx_cases_tenant_status` (`tenant_id`, `status`)
- **Test Requirement:**
  - Executed via `pnpm --filter @visahobe/database db:migrate` against PostgreSQL 16 service container.
  - Verification test verifying RLS boundary isolation and idempotent replay.

---

### Migration: `20261113000002_scoped_staff_rls_policies`

- **Migration ID & Name:** `20261113000002_scoped_staff_rls_policies`
- **Purpose:**
  1. Strengthen PostgreSQL Row-Level Security policies to require explicit audit-scoped authorization (`app.has_scoped_access = 'true'`) for staff cross-tenant access. Enforces that staff or Super Admin users without explicit scoped access cannot read or mutate rows across tenant boundaries.
  2. Create non-superuser application role `visahobe_app` (`NOSUPERUSER NOBYPASSRLS`) to guarantee genuine RLS policy enforcement even when connection user is a PostgreSQL superuser (such as CI service containers).
- **Rollback / Forward-Fix Plan:**
  - _Rollback SQL:_
    Re-apply baseline policies from `20261113000001_initial_baseline/migration.sql`.
  - _Forward-Fix:_
    Apply subsequent additive migration.
- **RLS Impact:**
  - Refined policies on `memberships`, `cases`, `tasks`, `documents`, and `audit_logs`.
  - Added clause: `AND current_setting('app.has_scoped_access', true) = 'true'` to privileged role bypass conditions.
  - Created application role `visahobe_app` with `NOSUPERUSER NOBYPASSRLS`.
- **Index Impact:**
  - Zero index changes. Existing B-Tree indexes on `tenant_id` support policy filtering.
- **Test Requirement:**
  - Executed via `tests/security/tenant-isolation.test.ts`.
