-- ==============================================================================
-- Migration ID: 20261113000002_scoped_staff_rls_policies
-- Purpose:
--   Strengthen PostgreSQL Row-Level Security policies to require explicit
--   audit-scoped authorization (`app.has_scoped_access = 'true'`) for staff cross-tenant access.
--   Enforces that staff or Super Admin users without explicit scoped access
--   cannot read or mutate rows across tenant boundaries.
--
-- Rollback / Forward-Fix Plan:
--   Rollback: Re-apply migration 20261113000001_initial_baseline policies.
--   Forward-Fix: Apply additive RLS migration.
--
-- RLS Impact:
--   Replaced policies on memberships, cases, tasks, documents, and audit_logs:
--   - Added `AND NULLIF(current_setting('app.has_scoped_access', true), 'false')::boolean = true`
--     to privileged staff bypass clauses.
--
-- Index Impact:
--   No index changes. Existing tenant_id indexes support the policy evaluations.
--
-- Test Requirement:
--   tests/security/tenant-isolation.test.ts
--   Verified via `prisma migrate deploy` against PostgreSQL 16 container.
-- ==============================================================================

-- 1. Cases Policy Refinement
DROP POLICY IF EXISTS cases_tenant_isolation ON cases;
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

-- 2. Tasks Policy Refinement
DROP POLICY IF EXISTS tasks_tenant_isolation ON tasks;
CREATE POLICY tasks_tenant_isolation ON tasks
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

-- 3. Documents Policy Refinement
DROP POLICY IF EXISTS documents_tenant_isolation ON documents;
CREATE POLICY documents_tenant_isolation ON documents
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

-- 4. Memberships Policy Refinement
DROP POLICY IF EXISTS memberships_tenant_isolation ON memberships;
CREATE POLICY memberships_tenant_isolation ON memberships
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR (
            current_setting('app.current_user_role', true) IN ('owner', 'admin')
            AND NULLIF(current_setting('app.has_scoped_access', true), 'false')::boolean = true
        )
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR (
            current_setting('app.current_user_role', true) IN ('owner', 'admin')
            AND NULLIF(current_setting('app.has_scoped_access', true), 'false')::boolean = true
        )
    );

-- 5. Audit Logs Policy Refinement
DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
    FOR ALL
    USING (
        tenant_id IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR (
            current_setting('app.current_user_role', true) IN ('owner', 'admin')
            AND NULLIF(current_setting('app.has_scoped_access', true), 'false')::boolean = true
        )
    )
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
