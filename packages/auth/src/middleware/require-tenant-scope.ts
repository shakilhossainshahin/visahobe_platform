import { UUID_V4_REGEX } from '../constants.js';
import { MissingTenantClaimError } from '../errors.js';
import type { UserSession } from '../types.js';

export function requireTenantScope(session: UserSession): string {
  if (
    !session.tenantId ||
    typeof session.tenantId !== 'string' ||
    !UUID_V4_REGEX.test(session.tenantId)
  ) {
    throw new MissingTenantClaimError(
      'Session does not contain a valid tenantId. Tenant isolation cannot be established.',
    );
  }
  return session.tenantId;
}
