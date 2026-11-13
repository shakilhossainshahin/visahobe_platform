# TICKET-P0-004: PostgreSQL Setup, Prisma ORM Baseline, and Migration Workflow

**Ticket ID:** TICKET-P0-004  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 2 Engineering Days  
**Dependencies:** [TICKET-P0-001](./TICKET-P0-001-monorepo-initialization.md), [TICKET-P0-002](./TICKET-P0-002-typescript-lint-format-testing.md)  
**Related ADRs:** [ADR-002](../decisions/ADR-002-tenant-isolation-model.md), [ADR-003](../decisions/ADR-003-backend-stack-and-architecture-style.md)  

---

## 1. Objective

Configure the PostgreSQL 16 database environment, initialize Prisma ORM in `packages/database`, generate the initial baseline migration for core system entities with PostgreSQL Row-Level Security (RLS) policies, secure tenant-context session variables (`SET LOCAL app.current_tenant_id`), and establish a strict single-migration-owner protocol.

---

## 2. Mandatory Migration Governance Rules

### 2.1 Single Migration-Owner Rule
> [!IMPORTANT]
> **Only one migration owner may create or modify `prisma/schema.prisma` or database migration files at a time.** Concurrent agent or human edits to the schema or migration files are strictly prohibited. Any schema change must be coordinated through the designated migration owner agent to prevent migration version drift and conflicting schema states.

### 2.2 Mandatory Migration Documentation Standard
Every migration generated must include a structured header comment and an entry in `database/migrations/MIGRATION_LOG.md` detailing:
- **Migration ID & Name:** (e.g. `20261113000001_initial_baseline`)
- **Purpose:** Clear business and domain rationale for the change.
- **Rollback / Forward-Fix Plan:** Explicit SQL steps or strategy if migration fails or must be reverted.
- **RLS Impact:** Affected tenant tables and exact `CREATE POLICY` statements applied.
- **Index Impact:** Created/dropped indexes and query performance implications.
- **Test Requirement:** Verification command proving the migration is idempotent and passes RLS boundary tests.

---

## 3. Scope of Work

1. **Local Development Database Environment (`docker-compose.dev.yml`):**
   - Configure PostgreSQL 16 container service with persistent volume.
   - Configure a dedicated test database container (`visahobe_test`) for automated integration tests.
   - Configure health check probes (`pg_isready`).

2. **Prisma Schema Configuration (`packages/database/prisma/schema.prisma`):**
   - Configure PostgreSQL datasource and client generator.
   - Define baseline Phase 0 entities with UUID primary keys and timestamps:
     - `tenants`: Multi-tenant organization boundaries.
     - `users`: Core user accounts (email, status, MFA flags).
     - `memberships`: User-tenant relationships with roles.
     - `roles`: Role definitions (`owner`, `admin`, `case_manager`, `verifier`, `finance`, `client`, `partner`).
     - `permissions`: Fine-grained permission keys (`case.read`, `document.verify`, etc.).
     - `role_permissions`: Role-to-permission mapping table.
     - `cases`: High-level case entity with `tenant_id`.
     - `tasks`: Durable workflow tasks with `tenant_id`.
     - `documents`: Document metadata with `tenant_id` and storage references.
     - `audit_logs`: Append-only audit log table.

3. **Row-Level Security (RLS) & Tenant Isolation Mechanism:**
   - **Primary Isolation Boundary:** PostgreSQL RLS policies (`CREATE POLICY`) combined with session variables (`SET LOCAL app.current_tenant_id` and `SET LOCAL app.current_user_role`) serve as the primary tenant-isolation boundary.
   - **Role of Triggers:** Database triggers are strictly reserved for audit logs, updated timestamps, or domain invariants; triggers must never be relied upon as the primary authorization or isolation mechanism.
   - Include custom SQL migration step:
     - Enable RLS on all tenant-owned tables (`ALTER TABLE cases ENABLE ROW LEVEL SECURITY;`).
     - Define standard RLS policies enforcing tenant isolation:
       ```sql
       CREATE POLICY cases_tenant_isolation ON cases
         FOR ALL
         USING (
           tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
           OR current_setting('app.current_user_role', true) IN ('owner', 'admin', 'case_manager', 'verifier')
         )
         WITH CHECK (
           tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
         );
       ```

4. **Database Package Utilities (`packages/database/src/`):**
   - Export typed Prisma Client instance with connection pooling.
   - Implement `withTenantContext<T>(tenantId: string, role: string, fn: () => Promise<T>): Promise<T>` helper to safely execute queries within PostgreSQL `SET LOCAL` session context.

5. **Seeder Script (`packages/database/prisma/seed.ts`):**
   - Seed default roles and granular permissions.
   - Seed test tenant and initial platform owner credentials for local staging verification.

---

## 4. Deliverables

- [ ] `docker-compose.dev.yml` for local PostgreSQL 16.
- [ ] `packages/database/prisma/schema.prisma` with core entities.
- [ ] Documented baseline migration in `packages/database/prisma/migrations/`.
- [ ] `packages/database/src/client.ts` and `tenant-context.ts`.
- [ ] `packages/database/prisma/seed.ts` seeder script.
- [ ] `database/migrations/MIGRATION_LOG.md` tracking migration metadata.
- [ ] Root scripts: `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:seed`, `pnpm db:studio`.

---

## 5. Acceptance Criteria

1. Only the designated migration owner agent or engineer modifies `prisma/schema.prisma` or migration SQL.
2. Running `pnpm db:migrate` on a clean PostgreSQL instance runs from start to finish without manual intervention and creates all tables, foreign keys, and RLS policies.
3. Every migration includes documented Purpose, Rollback plan, RLS impact, and Index impact in `MIGRATION_LOG.md`.
4. PostgreSQL RLS policies (`CREATE POLICY`) are verified as the primary tenant boundary; triggers are limited to audit and timestamp invariants.
5. Running `pnpm db:seed` inserts default roles and permissions idempotently without duplicates.
6. Schema enforces UUID primary keys, strict foreign key constraints, and tenant scoping.

---

## 6. Verification Commands

```bash
docker compose -f docker-compose.dev.yml up -d
pnpm --filter @visahobe/database db:generate
pnpm --filter @visahobe/database db:migrate:dev --name initial_baseline
pnpm --filter @visahobe/database db:seed
```
