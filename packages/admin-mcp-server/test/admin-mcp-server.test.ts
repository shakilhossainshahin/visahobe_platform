import { describe, expect, it } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import {
  AdminMcpServer,
  AdminMcpMfaRequiredError,
  AdminMcpPermissionError,
  AdminMcpToolNotFoundError,
} from '../src/index.js';

describe('Admin MCP Server (ADR-012)', () => {
  const superAdminSession: UserSession = {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'operator@visahobe.com',
    tenantId: '11111111-1111-1111-1111-111111111111',
    role: 'super_admin',
    isMfaVerified: true,
    aal: 'aal2',
    claims: { sub: '00000000-0000-0000-0000-000000000001', role: 'super_admin', aal: 'aal2' },
  };

  const verifierSession: UserSession = {
    userId: '00000000-0000-0000-0000-000000000002',
    email: 'verifier@visahobe.com',
    tenantId: '11111111-1111-1111-1111-111111111111',
    role: 'verifier',
    isMfaVerified: true,
    aal: 'aal2',
    claims: { sub: '00000000-0000-0000-0000-000000000002', role: 'verifier', aal: 'aal2' },
  };

  const aal1StaffSession: UserSession = {
    ...superAdminSession,
    isMfaVerified: false,
    aal: 'aal1',
  };

  const clientSession: UserSession = {
    userId: '00000000-0000-0000-0000-000000000099',
    email: 'applicant@example.com',
    tenantId: '22222222-2222-2222-2222-222222222222',
    role: 'client',
    isMfaVerified: false,
    aal: 'aal1',
  };

  it('strictly rejects access when staff user has not completed AAL2 MFA', () => {
    expect(() => AdminMcpServer.listTools({ session: aal1StaffSession })).toThrow(
      AdminMcpMfaRequiredError,
    );
  });

  it('rejects access when non-staff client role attempts to access Admin MCP server', () => {
    expect(() => AdminMcpServer.listTools({ session: clientSession })).toThrow(
      AdminMcpPermissionError,
    );
  });

  it('lists available operational tools scoped to user role', () => {
    const adminTools = AdminMcpServer.listTools({ session: superAdminSession });
    expect(adminTools.some((t) => t.name === 'listAllTenants')).toBe(true);
    expect(adminTools.some((t) => t.name === 'adjustAgencyWalletBalance')).toBe(true);
    expect(adminTools.some((t) => t.name === 'dispatchDailyExecutiveDigest')).toBe(true);

    const verifierTools = AdminMcpServer.listTools({ session: verifierSession });
    expect(verifierTools.some((t) => t.name === 'inspectCaseAuditTrail')).toBe(true);
    expect(verifierTools.some((t) => t.name === 'triggerBrowserUseReplay')).toBe(true);
    // Verifier cannot adjust balances or dispatch executive digests
    expect(verifierTools.some((t) => t.name === 'adjustAgencyWalletBalance')).toBe(false);
    expect(verifierTools.some((t) => t.name === 'dispatchDailyExecutiveDigest')).toBe(false);
  });

  it('blocks verifier from invoking financial adjustment tool (role boundary)', async () => {
    await expect(
      AdminMcpServer.callTool(
        {
          name: 'adjustAgencyWalletBalance',
          arguments: {
            tenantId: '11111111-1111-1111-1111-111111111111',
            amount: 500,
            operation: 'credit',
            reason: 'Unauthorized credit',
          },
        },
        { session: verifierSession },
      ),
    ).rejects.toThrow(AdminMcpPermissionError);
  });

  it('executes dispatchDailyExecutiveDigest for authorized super_admin with AAL2 MFA', async () => {
    const result = await AdminMcpServer.callTool(
      { name: 'dispatchDailyExecutiveDigest' },
      { session: superAdminSession },
    );

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.type).toBe('text');
    const parsed = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
    expect(parsed['digestId']).toBeDefined();
    expect(parsed['autonomyMetrics']).toBeDefined();
  });

  it('handles JSON-RPC 2.0 tools/list and tools/call protocol requests', async () => {
    // 1. tools/list
    const listRes = await AdminMcpServer.handleJsonRpc(
      {
        jsonrpc: '2.0',
        id: 'req-1',
        method: 'tools/list',
      },
      { session: superAdminSession },
    );

    expect(listRes.jsonrpc).toBe('2.0');
    expect(listRes.id).toBe('req-1');
    const tools = (listRes.result as { tools: unknown[] }).tools;
    expect(tools.length).toBeGreaterThan(3);

    // 2. tools/call
    const callRes = await AdminMcpServer.handleJsonRpc(
      {
        jsonrpc: '2.0',
        id: 'req-2',
        method: 'tools/call',
        params: {
          name: 'inspectCaseAuditTrail',
          arguments: { caseId: 'case-test-101' },
        },
      },
      { session: superAdminSession },
    );

    expect(callRes.id).toBe('req-2');
    expect(callRes.result).toBeDefined();

    // 3. Unknown tool
    const unknownRes = await AdminMcpServer.handleJsonRpc(
      {
        jsonrpc: '2.0',
        id: 'req-3',
        method: 'tools/call',
        params: { name: 'nonExistentTool' },
      },
      { session: superAdminSession },
    );

    expect(unknownRes.error).toBeDefined();
    expect(unknownRes.error?.code).toBe(-32601);

    // 4. Direct callTool with unknown tool throws AdminMcpToolNotFoundError
    await expect(
      AdminMcpServer.callTool({ name: 'nonExistentTool' }, { session: superAdminSession }),
    ).rejects.toThrow(AdminMcpToolNotFoundError);
  });
});
