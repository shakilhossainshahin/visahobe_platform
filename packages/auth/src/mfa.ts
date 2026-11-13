import { PRIVILEGED_STAFF_ROLES } from './constants.js';
import { MfaRequiredError } from './errors.js';
import type { UserSession } from './types.js';

export function isPrivilegedStaffRole(role: string): boolean {
  return (PRIVILEGED_STAFF_ROLES as readonly string[]).includes(role.toLowerCase());
}

export function requiresMfa(role: string): boolean {
  return isPrivilegedStaffRole(role);
}

export function enforceMfaPolicy(session: UserSession): void {
  if (requiresMfa(session.role) && !session.isMfaVerified) {
    throw new MfaRequiredError(
      `Role '${session.role}' is a privileged staff role and requires verified Multi-Factor Authentication (AAL2).`,
    );
  }
}
