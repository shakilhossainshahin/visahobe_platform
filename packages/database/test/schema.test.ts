import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Prisma Schema and Migration Baseline Verification', () => {
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  const migrationPath = path.resolve(
    __dirname,
    '../prisma/migrations/20261113000001_initial_baseline/migration.sql',
  );

  it('should have a valid schema.prisma file defining all Phase 0 core models', () => {
    expect(fs.existsSync(schemaPath)).toBe(true);
    const content = fs.readFileSync(schemaPath, 'utf8');

    const expectedModels = [
      'model Tenant',
      'model User',
      'model Role',
      'model Permission',
      'model RolePermission',
      'model Membership',
      'model Case',
      'model Task',
      'model Document',
      'model AuditLog',
    ];

    for (const model of expectedModels) {
      expect(content).toContain(model);
    }
  });

  it('should enforce tenant_id and @@index([tenantId]) on all tenant-scoped models', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');

    const tenantScopedModels = ['Case', 'Task', 'Document', 'Membership'];
    for (const model of tenantScopedModels) {
      const modelRegex = new RegExp(`model ${model}\\s*\\{([\\s\\S]*?\\n\\})`, 'm');
      const match = content.match(modelRegex);
      expect(match).not.toBeNull();
      const body = match![1];
      expect(body).toContain('tenantId');
      expect(body).toContain('@map("tenant_id")');
      expect(body).toContain('@@index([tenantId])');
    }
  });

  it('should enforce UUID primary keys on all models', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const idRegex = /id\s+String\s+@id\s+@default\(uuid\(\)\)\s+@db\.Uuid/g;
    const matches = content.match(idRegex);
    expect(matches).not.toBeNull();
    // 10 models defined
    expect(matches!.length).toBeGreaterThanOrEqual(10);
  });

  it('should have an initial baseline migration SQL with RLS policies enabled and forced', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    const rlsTables = ['memberships', 'cases', 'tasks', 'documents', 'audit_logs'];
    for (const table of rlsTables) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      expect(sql).toContain(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;`);
    }

    // Verify session variable usage in policies
    expect(sql).toContain("NULLIF(current_setting('app.current_tenant_id', true), '')::uuid");
    expect(sql).toContain("current_setting('app.current_user_role', true)");
  });

  it('should have automated updated_at triggers in baseline migration', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION update_updated_at_column()');
    expect(sql).toContain('CREATE TRIGGER trg_cases_updated_at');
    expect(sql).toContain('CREATE TRIGGER trg_tasks_updated_at');
  });

  it('should have migration 20261113000002 enforcing app.has_scoped_access and visahobe_app role', () => {
    const migration2Path = path.resolve(
      __dirname,
      '../prisma/migrations/20261113000002_scoped_staff_rls_policies/migration.sql',
    );
    expect(fs.existsSync(migration2Path)).toBe(true);
    const sql = fs.readFileSync(migration2Path, 'utf8');
    expect(sql).toContain("current_setting('app.has_scoped_access', true) = 'true'");
    expect(sql).toContain(
      'CREATE ROLE visahobe_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS',
    );
  });
});
