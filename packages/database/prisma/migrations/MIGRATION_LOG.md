# VisaHobe Database Migration Log

This document records all database migrations applied to the VisaHobe multi-tenant PostgreSQL database.

## Migration Governance Standard

1. **Single Migration-Owner Rule:** Only the designated migration owner may modify `schema.prisma` or author migration files.
2. **Reproducible Deployments:** Migrations must run via `prisma migrate deploy` from clean state to completion without manual intervention.
3. **Defense-in-Depth RLS:** All tenant-scoped entities must enable Row-Level Security (`ENABLE ROW LEVEL SECURITY`) and force RLS (`FORCE ROW LEVEL SECURITY`) with policies referencing session context `app.current_tenant_id`.

---

## Migration Index

| Migration ID     | Name               | Applied Date | RLS Impact                              | Status         |
| ---------------- | ------------------ | ------------ | --------------------------------------- | -------------- |
| `20261113000001` | `initial_baseline` | 2026-11-13   | RLS Enabled & Forced on 5 tenant tables | Ready / Active |

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
