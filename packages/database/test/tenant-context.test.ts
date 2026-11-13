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
    expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);

    transactionSpy.mockRestore();
  });

  it('should support options object overload with default role', async () => {
    const executedValues: unknown[] = [];
    const mockTx = {
      $executeRaw: vi.fn(async (_strings: unknown, ...values: unknown[]) => {
        executedValues.push(...values);
        return 1;
      }),
    };

    const transactionSpy = vi
      .spyOn(prisma, '$transaction')
      .mockImplementation(
        async <T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
          return callback(mockTx as unknown as Prisma.TransactionClient);
        },
      );

    const tenantId = '22222222-2222-2222-2222-222222222222';

    await withTenantContext({ tenantId }, async () => {
      return 'ok';
    });

    expect(executedValues).toContain(tenantId);
    expect(executedValues).toContain('client'); // default role

    transactionSpy.mockRestore();
  });
});
