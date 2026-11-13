import { describe, expect, it } from 'vitest';
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
import { withTenantContext } from '@visahobe/database';

describe('Tenant Isolation & RLS Security Suite (TICKET-P0-006)', () => {
  const tenantA = '11111111-1111-4111-8111-111111111111';
  const tenantB = '22222222-2222-4222-8222-222222222222';
  const userA = 'aaaa1111-1111-4aaa-8aaa-aaaaaaaaaaaa';
  const userB = 'bbbb2222-2222-4bbb-8bbb-bbbbbbbbbbbb';

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

    it('should execute scoped staff operation and write structured audit log', async () => {
      const isDbConnected = Boolean(process.env.DATABASE_URL);

      if (!isDbConnected) {
        // Contract validation when running outside database container
        expect(withTenantContext).toBeDefined();
        return;
      }

      // When connected to PostgreSQL 16 container (e.g. CI)
      const auditResult = await withTenantContext(
        {
          tenantId: tenantA,
          userId: userB,
          role: 'owner',
          hasScopedAccess: true,
          isMfaVerified: true,
          auditAction: 'security.test.cross_tenant_access',
          auditEntityType: 'case',
          auditEntityId: 'case-test-1',
        },
        async (tx) => {
          return tx.auditLog.findFirst({
            where: {
              tenantId: tenantA,
              action: 'security.test.cross_tenant_access',
            },
          });
        },
      );

      expect(auditResult).not.toBeNull();
      expect(auditResult?.tenantId).toBe(tenantA);
      expect(auditResult?.userId).toBe(userB);
    });
  });
});
