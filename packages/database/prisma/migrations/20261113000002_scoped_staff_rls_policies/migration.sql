-- ==============================================================================
-- Migration ID: 20261113000002_scoped_staff_rls_policies
-- Purpose:
--   1. Strengthen PostgreSQL Row-Level Security policies to require explicit
--      audit-scoped authorization (`app.has_scoped_access = 'true'`) for staff cross-tenant access.
--   2. Establish non-superuser application role (`visahobe_app`, NOSUPERUSER NOBYPASSRLS)
--      so that Row-Level Security policies are genuinely enforced in all environments
--      including CI service containers where the default user is a PostgreSQL SUPERUSER.
--
-- Rollback / Forward-Fix Plan:
--   Rollback: Re-apply migration 20261113000001_initial_baseline policies.
--   Forward-Fix: Apply additive RLS migration.
--
-- RLS Impact:
--   - Replaced policies on memberships, cases, tasks, documents, and audit_logs.
--   - Replaced fragile boolean cast with safe string comparison:
--     `current_setting('app.has_scoped_access', true) = 'true'`.
--   - Established non-superuser application role `visahobe_app` (NOSUPERUSER NOBYPASSRLS).
--
-- Index Impact:
--   No index changes. Existing tenant_id indexes support policy evaluations.
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
            AND current_setting('app.has_scoped_access', true) = 'true'
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
            AND current_setting('app.has_scoped_access', true) = 'true'
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
            AND current_setting('app.has_scoped_access', true) = 'true'
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
            AND current_setting('app.has_scoped_access', true) = 'true'
        )
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR (
            current_setting('app.current_user_role', true) IN ('owner', 'admin')
            AND current_setting('app.has_scoped_access', true) = 'true'
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
            AND current_setting('app.has_scoped_access', true) = 'true'
        )
    )
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR (
            current_setting('app.current_user_role', true) IN ('owner', 'admin')
            AND current_setting('app.has_scoped_access', true) = 'true'
        )
    );

-- ------------------------------------------------------------------------------
-- 6. Application Role for Genuine RLS Enforcement (NOSUPERUSER, NOBYPASSRLS)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'visahobe_app') THEN
        CREATE ROLE visahobe_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD 'visahobe_app_password';
    END IF;
END
$$;

-- Grant schema and table privileges to visahobe_app
GRANT USAGE ON SCHEMA public TO visahobe_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO visahobe_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO visahobe_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO visahobe_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO visahobe_app;

-- Grant visahobe_app role to current migration/database user
DO $$
BEGIN
    EXECUTE format('GRANT visahobe_app TO %I', CURRENT_USER);
END
$$;
