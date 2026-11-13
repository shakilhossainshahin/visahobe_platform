import { Prisma } from '@prisma/client';
import { prisma } from './client.js';

export const PRIVILEGED_STAFF_ROLES = [
  'owner',
  'admin',
  'case_manager',
  'verifier',
  'finance',
  'browser_operator',
  'developer_reviewer',
] as const;

export interface TenantContextSession {
  tenantId: string;
  userId?: string | undefined;
  role?: string | undefined;
  isMfaVerified?: boolean | undefined;
  [key: string]: unknown;
}

export interface TenantContextOptions {
  tenantId: string;
  userId?: string | undefined;
  role?: string | undefined;
  isMfaVerified?: boolean | undefined;
  hasScopedAccess?: boolean | undefined;
  auditAction?: string | undefined;
  auditEntityType?: string | undefined;
  auditEntityId?: string | undefined;
}

/**
 * Executes a database operation within a transaction that sets PostgreSQL
 * session variables:
 * - `app.current_tenant_id`
 * - `app.current_user_id`
 * - `app.current_user_role`
 * - `app.has_scoped_access`
 *
 * This enforces Row-Level Security (RLS) policies at the database persistence layer.
 * Because `set_config(..., ..., true)` is transaction-scoped, session variables are
 * automatically cleared when the transaction commits or rolls back, preventing cross-tenant leakage.
 */
export async function withTenantContext<T>(
  tenantId: string,
  role: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T>;
export async function withTenantContext<T>(
  options: TenantContextOptions,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T>;
export async function withTenantContext<T>(
  session: TenantContextSession,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: Partial<TenantContextOptions>,
): Promise<T>;
export async function withTenantContext<T>(
  arg1: string | TenantContextOptions | TenantContextSession,
  arg2: string | ((tx: Prisma.TransactionClient) => Promise<T>),
  arg3?: ((tx: Prisma.TransactionClient) => Promise<T>) | Partial<TenantContextOptions>,
): Promise<T> {
  let tenantId: string;
  let userId: string | undefined;
  let role: string;
  let isMfaVerified = false;
  let hasScopedAccess = false;
  let auditAction: string | undefined;
  let auditEntityType: string | undefined;
  let auditEntityId: string | undefined;
  let fn: (tx: Prisma.TransactionClient) => Promise<T>;

  if (typeof arg1 === 'string') {
    // Overload 1: (tenantId: string, role: string, fn: Function)
    tenantId = arg1;
    role = typeof arg2 === 'string' ? arg2 : 'client';
    fn = arg3 as (tx: Prisma.TransactionClient) => Promise<T>;
  } else if (typeof arg2 === 'function') {
    // Overload 2 or 3: (options/session, fn, extraOptions)
    const contextObj = arg1;
    const extraOptions = (arg3 as Partial<TenantContextOptions>) || {};

    tenantId = contextObj.tenantId;
    userId = extraOptions.userId ?? contextObj.userId;
    role = extraOptions.role ?? contextObj.role ?? 'client';
    isMfaVerified = Boolean(extraOptions.isMfaVerified ?? contextObj.isMfaVerified);
    hasScopedAccess = Boolean(
      extraOptions.hasScopedAccess ?? (contextObj as TenantContextOptions).hasScopedAccess,
    );
    auditAction = extraOptions.auditAction ?? (contextObj as TenantContextOptions).auditAction;
    auditEntityType =
      extraOptions.auditEntityType ?? (contextObj as TenantContextOptions).auditEntityType;
    auditEntityId =
      extraOptions.auditEntityId ?? (contextObj as TenantContextOptions).auditEntityId;
    fn = arg2;
  } else {
    throw new Error('Invalid arguments provided to withTenantContext');
  }

  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('Tenant context requires a valid tenantId string');
  }

  // Cross-tenant scoped access guard
  if (hasScopedAccess) {
    const isStaff = (PRIVILEGED_STAFF_ROLES as readonly string[]).includes(role.toLowerCase());
    if (!isStaff) {
      throw new Error(
        `Role '${role}' is not a privileged staff role and cannot be granted cross-tenant scoped access.`,
      );
    }
    if (!isMfaVerified) {
      throw new Error(
        `Privileged role '${role}' requires verified Multi-Factor Authentication (AAL2) to perform cross-tenant scoped operations.`,
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    // Set transaction-local session variables for PostgreSQL RLS policies
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId ?? ''}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_role', ${role}, true)`;
    await tx.$executeRaw`SELECT set_config('app.has_scoped_access', ${hasScopedAccess ? 'true' : 'false'}, true)`;

    // If privileged cross-tenant operation, write append-only audit log
    if (hasScopedAccess) {
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: userId ?? null,
          action: auditAction ?? 'staff.cross_tenant.access',
          entityType: auditEntityType ?? 'tenant',
          entityId: auditEntityId ?? tenantId,
          newValues: {
            actorRole: role,
            hasScopedAccess: true,
            isMfaVerified: true,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return fn(tx);
  });
}
