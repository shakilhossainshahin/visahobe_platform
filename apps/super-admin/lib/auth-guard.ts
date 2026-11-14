import {
  assertPermission,
  enforceMfaPolicy,
  hasPermission,
  isPrivilegedStaffRole,
  type PermissionKey,
  type UserSession,
} from '@visahobe/auth';

export class InsufficientRoleError extends Error {
  readonly statusCode = 403;
  readonly code = 'INSUFFICIENT_ROLE';

  constructor(requiredRole: string, currentRole: string) {
    super(`Action requires role '${requiredRole}', but current role is '${currentRole}'.`);
    this.name = 'InsufficientRoleError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Validates staff session and asserts specific role or permission requirements.
 */
export function assertStaffRole(session: UserSession, allowedRoles: string[]): void {
  enforceMfaPolicy(session);

  const normalizedRole = session.role.toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  if (!isPrivilegedStaffRole(session.role) || !normalizedAllowed.includes(normalizedRole)) {
    throw new InsufficientRoleError(allowedRoles.join(' | '), session.role);
  }
}

export function assertStaffActionPermission(session: UserSession, permission: PermissionKey): void {
  enforceMfaPolicy(session);
  assertPermission(session, permission);
}

export function checkStaffActionPermission(
  session: UserSession,
  permission: PermissionKey,
): boolean {
  if (!session.isMfaVerified) {
    return false;
  }
  return hasPermission(session, permission);
}
