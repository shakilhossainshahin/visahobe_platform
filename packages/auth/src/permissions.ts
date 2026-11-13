import { isPrivilegedStaffRole } from './mfa.js';
import { MfaRequiredError, PermissionDeniedError } from './errors.js';
import type { UserSession } from './types.js';

export const ALL_PERMISSIONS = [
  // Cases
  'case.read',
  'case.create',
  'case.update',
  'case.delete',
  'case.close',

  // Documents
  'document.upload',
  'document.read',
  'document.verify',
  'document.delete',
  'document.download',

  // Tasks
  'task.create',
  'task.read',
  'task.execute',
  'task.delete',

  // Submissions
  'submission.prepare',
  'submission.approve',
  'submission.execute',

  // Finance
  'invoice.issue',
  'payment.record',
  'refund.approve',
  'finance.manage',

  // Compliance & Audit
  'audit.view',

  // Automation & Agents
  'agent.run',
  'browser.session.create',
  'browser.session.observe',
  'browser.session.takeover',

  // Engineering & Governance
  'github.pr.create',
  'deployment.approve',
  'migration.propose',
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<string, readonly PermissionKey[]> = {
  owner: ALL_PERMISSIONS,

  admin: [
    'case.read',
    'case.create',
    'case.update',
    'case.delete',
    'case.close',
    'document.upload',
    'document.read',
    'document.verify',
    'document.delete',
    'document.download',
    'task.create',
    'task.read',
    'task.execute',
    'task.delete',
    'submission.prepare',
    'submission.approve',
    'submission.execute',
    'invoice.issue',
    'payment.record',
    'refund.approve',
    'finance.manage',
    'audit.view',
    'agent.run',
    'browser.session.create',
    'browser.session.observe',
    'browser.session.takeover',
  ],

  case_manager: [
    'case.read',
    'case.create',
    'case.update',
    'case.close',
    'document.upload',
    'document.read',
    'document.verify',
    'document.download',
    'task.create',
    'task.read',
    'task.execute',
    'submission.prepare',
    'agent.run',
  ],

  verifier: [
    'case.read',
    'document.read',
    'document.verify',
    'document.upload',
    'document.download',
    'task.read',
    'task.execute',
  ],

  finance: [
    'case.read',
    'document.read',
    'document.download',
    'invoice.issue',
    'payment.record',
    'refund.approve',
    'finance.manage',
  ],

  browser_operator: [
    'case.read',
    'task.read',
    'task.execute',
    'browser.session.create',
    'browser.session.observe',
    'browser.session.takeover',
  ],

  developer_reviewer: [
    'case.read',
    'audit.view',
    'github.pr.create',
    'deployment.approve',
    'migration.propose',
  ],

  client: [
    'case.read',
    'case.create',
    'document.upload',
    'document.read',
    'document.download',
    'task.read',
    'task.execute',
  ],

  partner: [
    'case.read',
    'document.upload',
    'document.read',
    'document.download',
    'task.read',
    'task.execute',
  ],
};

interface CacheEntry {
  permissions: Set<PermissionKey>;
  expiresAt: number;
}

const PERMISSION_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL in memory

export function getPermissionsForRole(role: string): PermissionKey[] {
  const normalizedRole = role.toLowerCase();
  const cached = PERMISSION_CACHE.get(normalizedRole);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return Array.from(cached.permissions);
  }

  const rolePerms = ROLE_PERMISSIONS[normalizedRole] ?? [];
  const permSet = new Set<PermissionKey>(rolePerms);

  PERMISSION_CACHE.set(normalizedRole, {
    permissions: permSet,
    expiresAt: now + CACHE_TTL_MS,
  });

  return Array.from(permSet);
}

export function clearPermissionCache(): void {
  PERMISSION_CACHE.clear();
}

export function hasPermission(session: UserSession, permission: PermissionKey): boolean {
  if (!session || !session.role) {
    return false;
  }

  // If role is a privileged staff role, MFA verification is mandatory
  if (isPrivilegedStaffRole(session.role) && !session.isMfaVerified) {
    return false;
  }

  const normalizedRole = session.role.toLowerCase();
  const grantedPermissions = getPermissionsForRole(normalizedRole);

  return grantedPermissions.includes(permission);
}

export function assertPermission(session: UserSession, permission: PermissionKey): void {
  if (isPrivilegedStaffRole(session.role) && !session.isMfaVerified) {
    throw new MfaRequiredError(
      `Privileged operation requiring '${permission}' is blocked: role '${session.role}' requires verified MFA (AAL2).`,
    );
  }

  if (!hasPermission(session, permission)) {
    throw new PermissionDeniedError(
      permission,
      `User '${session.userId}' with role '${session.role}' lacks required permission '${permission}'.`,
    );
  }
}
