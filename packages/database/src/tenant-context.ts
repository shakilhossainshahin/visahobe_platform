import { Prisma } from '@prisma/client';
import { prisma } from './client.js';

export interface TenantContextOptions {
  tenantId: string;
  role?: string;
}

/**
 * Executes a database operation within a transaction that sets PostgreSQL
 * session variables (`SET LOCAL app.current_tenant_id` and `SET LOCAL app.current_user_role`).
 *
 * This enforces Row-Level Security (RLS) policies at the database layer.
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
  tenantIdOrOptions: string | TenantContextOptions,
  roleOrFn: string | ((tx: Prisma.TransactionClient) => Promise<T>),
  maybeFn?: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  let tenantId: string;
  let role: string;
  let fn: (tx: Prisma.TransactionClient) => Promise<T>;

  if (typeof tenantIdOrOptions === 'string') {
    tenantId = tenantIdOrOptions;
    role = typeof roleOrFn === 'string' ? roleOrFn : 'client';
    fn = maybeFn!;
  } else {
    tenantId = tenantIdOrOptions.tenantId;
    role = tenantIdOrOptions.role ?? 'client';
    fn = roleOrFn as (tx: Prisma.TransactionClient) => Promise<T>;
  }

  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('Tenant context requires a valid tenantId string');
  }

  return prisma.$transaction(async (tx) => {
    // Set transaction-local session variables for PostgreSQL RLS policies
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_user_role', ${role}, true)`;

    return fn(tx);
  });
}
