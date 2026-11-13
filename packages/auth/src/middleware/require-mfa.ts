import { enforceMfaPolicy } from '../mfa.js';
import type { UserSession } from '../types.js';

export function requireMfa(session: UserSession): void {
  enforceMfaPolicy(session);
}
