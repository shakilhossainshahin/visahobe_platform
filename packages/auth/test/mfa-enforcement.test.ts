import { describe, expect, it } from 'vitest';
import {
  createMockAuthContext,
  enforceMfaPolicy,
  isPrivilegedStaffRole,
  MfaRequiredError,
  PRIVILEGED_STAFF_ROLES,
  requireMfa,
} from '../src/index.js';

describe('Role-Differentiated MFA Enforcement', () => {
  it('should identify all privileged staff roles', () => {
    for (const role of PRIVILEGED_STAFF_ROLES) {
      expect(isPrivilegedStaffRole(role)).toBe(true);
      expect(isPrivilegedStaffRole(role.toUpperCase())).toBe(true);
    }
    expect(isPrivilegedStaffRole('client')).toBe(false);
    expect(isPrivilegedStaffRole('partner')).toBe(false);
  });

  it('should block privileged staff roles when isMfaVerified is false', () => {
    for (const role of PRIVILEGED_STAFF_ROLES) {
      const session = createMockAuthContext({
        role,
        isMfaVerified: false,
        aal: 'aal1',
      });

      expect(() => enforceMfaPolicy(session)).toThrow(MfaRequiredError);
      expect(() => requireMfa(session)).toThrow(MfaRequiredError);
    }
  });

  it('should allow privileged staff roles when isMfaVerified is true (AAL2)', () => {
    for (const role of PRIVILEGED_STAFF_ROLES) {
      const session = createMockAuthContext({
        role,
        isMfaVerified: true,
        aal: 'aal2',
      });

      expect(() => enforceMfaPolicy(session)).not.toThrow();
      expect(() => requireMfa(session)).not.toThrow();
    }
  });

  it('should permit client and partner roles without MFA (optional client MFA for MVP)', () => {
    const clientRoles = ['client', 'partner'];
    for (const role of clientRoles) {
      const session = createMockAuthContext({
        role,
        isMfaVerified: false,
        aal: 'aal1',
      });

      expect(() => enforceMfaPolicy(session)).not.toThrow();
      expect(() => requireMfa(session)).not.toThrow();
    }
  });
});
