import { describe, expect, it, vi } from 'vitest';
import { withTenantContext } from '../src/tenant-context.js';
import { prisma } from '../src/client.js';
import type { Prisma } from '@prisma/client';

describe('Tenant Context Helper (withTenantContext)', () => {
  it('should reject invalid or missing tenantId', async () => {
    // @ts-expect-error testing invalid input
    await expect(withTenantContext('', 'client', async () => {})).rejects.toThrow(
      'Tenant context requires a valid tenantId string',
    );
  });

  it('should execute raw SQL to set transaction-local session variables', async () => {
    const executedRawQueries: { strings: string; values: unknown[] }[] = [];
    const mockTx = {
      $executeRaw: vi.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
        executedRawQueries.push({ strings: strings.join('?'), values });
        return 1;
      }),
      auditLog: {
        create: vi.fn(),
      },
    };

    const transactionSpy = vi
      .spyOn(prisma, '$transaction')
      .mockImplementation(
        async <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
          return callback(mockTx as unknown as Prisma.TransactionClient);
        },
      );

    const tenantId = '11111111-1111-1111-1111-111111111111';
    const role = 'case_manager';

    const result = await withTenantContext(tenantId, role, async (tx) => {
      expect(tx).toBe(mockTx as unknown as Prisma.TransactionClient);
      return { success: true };
    });

    expect(result).toEqual({ success: true });
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    // Sets tenant_id, user_id, user_role, has_scoped_access
    expect(mockTx.$executeRaw).toHaveBeenCalledTimes(4);

    transactionSpy.mockRestore();
  });

  it('should reject cross-tenant scoped access for non-staff roles', async () => {
    const tenantId = '11111111-1111-1111-1111-111111111111';

    await expect(
      withTenantContext(
        {
          tenantId,
          role: 'client',
          hasScopedAccess: true,
          isMfaVerified: true,
        },
        async () => {},
      ),
    ).rejects.toThrow("Role 'client' is not a privileged staff role");
  });

  it('should reject cross-tenant scoped access for staff without verified MFA', async () => {
    const tenantId = '11111111-1111-1111-1111-111111111111';

    await expect(
      withTenantContext(
        {
          tenantId,
          role: 'admin',
          hasScopedAccess: true,
          isMfaVerified: false,
        },
        async () => {},
      ),
    ).rejects.toThrow('requires verified Multi-Factor Authentication');
  });

  it('should allow scoped cross-tenant access for verified staff and create audit log', async () => {
    const mockTx = {
      $executeRaw: vi.fn(async () => 1),
      auditLog: {
        create: vi.fn(async () => ({ id: 'mock-audit-id' })),
      },
    };

    const transactionSpy = vi
      .spyOn(prisma, '$transaction')
      .mockImplementation(
        async <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
          return callback(mockTx as unknown as Prisma.TransactionClient);
        },
      );

    const tenantId = '11111111-1111-1111-1111-111111111111';
    const userId = 'user-staff-123';

    await withTenantContext(
      {
        tenantId,
        userId,
        role: 'owner',
        hasScopedAccess: true,
        isMfaVerified: true,
        auditAction: 'admin.cross_tenant_audit',
      },
      async () => {
        return 'done';
      },
    );

    expect(mockTx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(mockTx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId,
          userId,
          action: 'admin.cross_tenant_audit',
        }),
      }),
    );

    transactionSpy.mockRestore();
  });
});
