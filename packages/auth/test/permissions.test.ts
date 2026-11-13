import { describe, expect, it } from 'vitest';
import {
  assertPermission,
  clearPermissionCache,
  createMockAuthContext,
  getPermissionsForRole,
  hasPermission,
  MfaRequiredError,
  PermissionDeniedError,
  ROLE_PERMISSIONS,
} from '../src/index.js';

describe('RBAC Permission Evaluation Engine', () => {
  it('should grant all system permissions to owner role', () => {
    const ownerSession = createMockAuthContext({
      role: 'owner',
      isMfaVerified: true,
      aal: 'aal2',
    });

    expect(hasPermission(ownerSession, 'case.read')).toBe(true);
    expect(hasPermission(ownerSession, 'document.verify')).toBe(true);
    expect(hasPermission(ownerSession, 'finance.manage')).toBe(true);
    expect(hasPermission(ownerSession, 'audit.view')).toBe(true);
    expect(hasPermission(ownerSession, 'deployment.approve')).toBe(true);
  });

  it('should restrict client role from administrative and verification actions', () => {
    const clientSession = createMockAuthContext({
      role: 'client',
      isMfaVerified: false,
    });

    // Allowed client actions
    expect(hasPermission(clientSession, 'case.read')).toBe(true);
    expect(hasPermission(clientSession, 'case.create')).toBe(true);
    expect(hasPermission(clientSession, 'document.upload')).toBe(true);
    expect(hasPermission(clientSession, 'document.download')).toBe(true);

    // Disallowed administrative actions
    expect(hasPermission(clientSession, 'document.verify')).toBe(false);
    expect(hasPermission(clientSession, 'audit.view')).toBe(false);
    expect(hasPermission(clientSession, 'finance.manage')).toBe(false);
    expect(hasPermission(clientSession, 'case.delete')).toBe(false);

    expect(() => assertPermission(clientSession, 'document.verify')).toThrow(PermissionDeniedError);
    expect(() => assertPermission(clientSession, 'audit.view')).toThrow(PermissionDeniedError);
  });

  it('should block staff roles from exercising permissions if MFA is not verified', () => {
    const unverifiedVerifier = createMockAuthContext({
      role: 'verifier',
      isMfaVerified: false,
      aal: 'aal1',
    });

    // Even though verifier role includes document.verify, lack of MFA blocks it
    expect(hasPermission(unverifiedVerifier, 'document.verify')).toBe(false);
    expect(() => assertPermission(unverifiedVerifier, 'document.verify')).toThrow(MfaRequiredError);

    // With MFA verified, verifier is permitted
    const verifiedVerifier = createMockAuthContext({
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    expect(hasPermission(verifiedVerifier, 'document.verify')).toBe(true);
    expect(() => assertPermission(verifiedVerifier, 'document.verify')).not.toThrow();
  });

  it('should return cached permissions correctly', () => {
    clearPermissionCache();
    const perms1 = getPermissionsForRole('case_manager');
    const perms2 = getPermissionsForRole('case_manager');

    expect(perms1).toEqual(perms2);
    expect(perms1).toContain('case.read');
    expect(perms1).toContain('document.verify');
    expect(perms1).not.toContain('finance.manage');
  });

  it('should verify defined role matrices match expected permissions', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
      const retrieved = getPermissionsForRole(role);
      expect(retrieved.length).toBe(perms.length);
    }
  });
});
