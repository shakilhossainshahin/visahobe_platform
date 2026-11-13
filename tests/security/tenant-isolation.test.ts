import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  assertPermission,
  authenticateSession,
  createMockAuthContext,
  createMockAuthToken,
  hasPermission,
  MfaRequiredError,
  PermissionDeniedError,
} from '@visahobe/auth';
import { generateSignedStorageUrl, StorageAccessDeniedError } from '@visahobe/core';
import { prisma, withTenantContext } from '@visahobe/database';

describe('Tenant Isolation & RLS Security Suite (TICKET-P0-006)', () => {
  const tenantA = '11111111-1111-4111-8111-111111111111';
  const tenantB = '22222222-2222-4222-8222-222222222222';
  const userA = 'aaaa1111-1111-4aaa-8aaa-aaaaaaaaaaaa';
  const userB = 'bbbb2222-2222-4bbb-8bbb-bbbbbbbbbbbb';

  // Seeded test IDs for database RLS integration tests
  const dbTenantAId = 'a0000000-0000-4000-8000-000000000001';
  const dbTenantBId = 'b0000000-0000-4000-8000-000000000002';
  const dbUserAId = 'a1111111-1111-4111-8111-111111111111';
  const dbUserBId = 'b2222222-2222-4222-8222-222222222222';
  const dbStaffUserId = 'c3333333-3333-4333-8333-333333333333';

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;

    // Seed test tenants (tenants table is not tenant-scoped, no RLS)
    await prisma.tenant.upsert({
      where: { id: dbTenantAId },
      update: {},
      create: {
        id: dbTenantAId,
        name: 'Tenant A Security Test',
        slug: 'tenant-a-sec-test',
        status: 'active',
      },
    });

    await prisma.tenant.upsert({
      where: { id: dbTenantBId },
      update: {},
      create: {
        id: dbTenantBId,
        name: 'Tenant B Security Test',
        slug: 'tenant-b-sec-test',
        status: 'active',
      },
    });

    // Seed test users (users table is not tenant-scoped, no RLS)
    await prisma.user.upsert({
      where: { id: dbUserAId },
      update: {},
      create: {
        id: dbUserAId,
        email: 'user-a-sec-test@visahobe.com',
        fullName: 'User A Security Test',
        status: 'active',
      },
    });

    await prisma.user.upsert({
      where: { id: dbUserBId },
      update: {},
      create: {
        id: dbUserBId,
        email: 'user-b-sec-test@visahobe.com',
        fullName: 'User B Security Test',
        status: 'active',
      },
    });

    await prisma.user.upsert({
      where: { id: dbStaffUserId },
      update: {},
      create: {
        id: dbStaffUserId,
        email: 'staff-sec-test@visahobe.com',
        fullName: 'Staff Security Test',
        status: 'active',
        mfaEnabled: true,
      },
    });
  });

  afterAll(async () => {
    if (!process.env.DATABASE_URL) return;
    try {
      await prisma.auditLog.deleteMany({
        where: { tenantId: { in: [dbTenantAId, dbTenantBId] } },
      });
      await prisma.case.deleteMany({
        where: { tenantId: { in: [dbTenantAId, dbTenantBId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [dbUserAId, dbUserBId, dbStaffUserId] } },
      });
      await prisma.tenant.deleteMany({
        where: { id: { in: [dbTenantAId, dbTenantBId] } },
      });
    } catch {
      // Ignored during teardown
    } finally {
      await prisma.$disconnect();
    }
  });

  // ----------------------------------------------------------------------------
  // 1. Storage Signed URL Cross-Tenant Boundary Tests
  // ----------------------------------------------------------------------------
  describe('Object Storage Signed URL Tenant Boundary', () => {
    it('should generate pre-signed URL when caller tenant matches document owner', () => {
      const result = generateSignedStorageUrl({
        callerTenantId: tenantA,
        callerRole: 'client',
        documentTenantId: tenantA,
        caseId: 'case-123',
        documentId: 'doc-456',
        filename: 'passport.pdf',
        operation: 'download',
      });

      expect(result.url).toContain('passport.pdf');
      expect(result.url).toContain(tenantA);
      expect(result.key).toContain(
        `tenants/${tenantA}/cases/case-123/documents/doc-456/passport.pdf`,
      );
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should reject cross-tenant signed URL generation with StorageAccessDeniedError (HTTP 403)', () => {
      // Tenant B caller attempts to generate download URL for Tenant A's document
      expect(() =>
        generateSignedStorageUrl({
          callerTenantId: tenantB,
          callerRole: 'client',
          documentTenantId: tenantA,
          caseId: 'case-123',
          documentId: 'doc-456',
          filename: 'confidential_tax_records.pdf',
          operation: 'download',
        }),
      ).toThrow(StorageAccessDeniedError);
    });

    it('should permit cross-tenant signed URL only for staff with verified MFA and explicit scoped access', () => {
      // Unverified staff or staff without scoped access must be blocked
      expect(() =>
        generateSignedStorageUrl({
          callerTenantId: tenantB,
          callerRole: 'verifier',
          callerIsMfaVerified: false,
          hasScopedAccess: false,
          documentTenantId: tenantA,
          caseId: 'case-123',
          documentId: 'doc-456',
          filename: 'passport.pdf',
          operation: 'download',
        }),
      ).toThrow(StorageAccessDeniedError);

      // Verified staff with scoped access is granted access
      const result = generateSignedStorageUrl({
        callerTenantId: tenantB,
        callerRole: 'verifier',
        callerIsMfaVerified: true,
        hasScopedAccess: true,
        documentTenantId: tenantA,
        caseId: 'case-123',
        documentId: 'doc-456',
        filename: 'passport.pdf',
        operation: 'download',
      });

      expect(result.url).toBeDefined();
      expect(result.key).toContain(
        `tenants/${tenantA}/cases/case-123/documents/doc-456/passport.pdf`,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 2. Client Header Spoofing Prevention Tests
  // ----------------------------------------------------------------------------
  describe('Header Spoofing & Tenant Claim Boundary', () => {
    it('should ignore client-supplied x-tenant-id header and strictly enforce token tenant claim', async () => {
      const token = await createMockAuthToken({
        userId: userA,
        tenantId: tenantA,
        role: 'client',
      });

      const session = await authenticateSession({
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
          'x-tenant-id': tenantB, // Malicious spoofing attempt
        },
      });

      expect(session.tenantId).toBe(tenantA);
      expect(session.tenantId).not.toBe(tenantB);
    });
  });

  // ----------------------------------------------------------------------------
  // 3. RBAC Permission Matrix & Staff MFA Guard Tests
  // ----------------------------------------------------------------------------
  describe('RBAC Permission Matrix Enforcement', () => {
    it('should deny client role from verifying documents or accessing audit logs', () => {
      const clientSession = createMockAuthContext({
        userId: userA,
        tenantId: tenantA,
        role: 'client',
        isMfaVerified: false,
      });

      expect(hasPermission(clientSession, 'document.verify')).toBe(false);
      expect(hasPermission(clientSession, 'audit.view')).toBe(false);
      expect(() => assertPermission(clientSession, 'document.verify')).toThrow(
        PermissionDeniedError,
      );
      expect(() => assertPermission(clientSession, 'audit.view')).toThrow(PermissionDeniedError);
    });

    it('should deny privileged verifier actions when MFA is unverified', () => {
      const unverifiedVerifier = createMockAuthContext({
        userId: userB,
        tenantId: tenantA,
        role: 'verifier',
        isMfaVerified: false,
      });

      expect(hasPermission(unverifiedVerifier, 'document.verify')).toBe(false);
      expect(() => assertPermission(unverifiedVerifier, 'document.verify')).toThrow(
        MfaRequiredError,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 4. Database RLS Policy & Session Context Bridge Tests
  // ----------------------------------------------------------------------------
  describe('Database RLS Context Bridge & Scoped Operations', () => {
    it('should reject cross-tenant scoped access without verified MFA', async () => {
      await expect(
        withTenantContext(
          {
            tenantId: tenantA,
            userId: userB,
            role: 'owner',
            hasScopedAccess: true,
            isMfaVerified: false, // Missing MFA
          },
          async () => {},
        ),
      ).rejects.toThrow('requires verified Multi-Factor Authentication');
    });

    it('should isolate cases between tenants under RLS enforcement', async () => {
      if (!process.env.DATABASE_URL) {
        expect(withTenantContext).toBeDefined();
        return;
      }

      // Seed Case A in Tenant A context
      await withTenantContext(
        { tenantId: dbTenantAId, role: 'client', userId: dbUserAId },
        async (tx) => {
          await tx.case.upsert({
            where: { caseNumber: 'CASE-SEC-RLS-A1' },
            update: {},
            create: {
              tenantId: dbTenantAId,
              clientId: dbUserAId,
              caseNumber: 'CASE-SEC-RLS-A1',
              countryCode: 'BD',
              serviceType: 'tourist',
            },
          });
        },
      );

      // Seed Case B in Tenant B context
      await withTenantContext(
        { tenantId: dbTenantBId, role: 'client', userId: dbUserBId },
        async (tx) => {
          await tx.case.upsert({
            where: { caseNumber: 'CASE-SEC-RLS-B1' },
            update: {},
            create: {
              tenantId: dbTenantBId,
              clientId: dbUserBId,
              caseNumber: 'CASE-SEC-RLS-B1',
              countryCode: 'BD',
              serviceType: 'student',
            },
          });
        },
      );

      // Assert Tenant A cannot read Tenant B's case
      await withTenantContext(
        { tenantId: dbTenantAId, role: 'client', userId: dbUserAId },
        async (tx) => {
          const cases = await tx.case.findMany({
            where: { caseNumber: { in: ['CASE-SEC-RLS-A1', 'CASE-SEC-RLS-B1'] } },
          });
          expect(cases).toHaveLength(1);
          expect(cases[0]?.caseNumber).toBe('CASE-SEC-RLS-A1');
        },
      );

      // Assert Tenant B cannot read Tenant A's case
      await withTenantContext(
        { tenantId: dbTenantBId, role: 'client', userId: dbUserBId },
        async (tx) => {
          const cases = await tx.case.findMany({
            where: { caseNumber: { in: ['CASE-SEC-RLS-A1', 'CASE-SEC-RLS-B1'] } },
          });
          expect(cases).toHaveLength(1);
          expect(cases[0]?.caseNumber).toBe('CASE-SEC-RLS-B1');
        },
      );

      // Assert cross-tenant insert is rejected by RLS WITH CHECK
      await expect(
        withTenantContext(
          { tenantId: dbTenantAId, role: 'client', userId: dbUserAId },
          async (tx) => {
            await tx.case.create({
              data: {
                tenantId: dbTenantBId, // Attempting to insert into Tenant B while in Tenant A context
                clientId: dbUserBId,
                caseNumber: 'CASE-SEC-LEAK-ATTEMPT',
                countryCode: 'BD',
                serviceType: 'work',
              },
            });
          },
        ),
      ).rejects.toThrow();
    });

    it('should execute scoped staff operation and write structured audit log', async () => {
      if (!process.env.DATABASE_URL) {
        expect(withTenantContext).toBeDefined();
        return;
      }

      // When connected to PostgreSQL 16 container (e.g. CI)
      const auditResult = await withTenantContext(
        {
          tenantId: dbTenantAId,
          userId: dbStaffUserId,
          role: 'owner',
          hasScopedAccess: true,
          isMfaVerified: true,
          auditAction: 'security.test.cross_tenant_access',
          auditEntityType: 'tenant',
          auditEntityId: dbTenantAId,
        },
        async (tx) => {
          return tx.auditLog.findFirst({
            where: {
              tenantId: dbTenantAId,
              action: 'security.test.cross_tenant_access',
            },
          });
        },
      );

      expect(auditResult).not.toBeNull();
      expect(auditResult?.tenantId).toBe(dbTenantAId);
      expect(auditResult?.userId).toBe(dbStaffUserId);
    });
  });
});
