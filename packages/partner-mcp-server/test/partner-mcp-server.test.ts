import { describe, expect, it, beforeEach } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import {
  CaseService,
  WalletService,
  BENGAL_AGENCY_TENANT_ID,
  EUROVISA_AGENCY_TENANT_ID,
} from '@visahobe/api';
import {
  PartnerMcpServer,
  PartnerMcpBoundaryViolationError,
  PartnerMcpForbiddenToolError,
  PartnerMcpToolNotFoundError,
} from '../src/index.js';

describe('Partner MCP Server (ADR-012)', () => {
  const bengalAgencySession: UserSession = {
    userId: 'usr-bengal-agent-01',
    email: 'agent@bengaltravel.com',
    tenantId: BENGAL_AGENCY_TENANT_ID,
    role: 'agency_manager',
    isMfaVerified: true,
    aal: 'aal2',
    claims: {
      sub: 'usr-bengal-agent-01',
      tenant_id: BENGAL_AGENCY_TENANT_ID,
      role: 'agency_manager',
    },
  };

  const eurovisaAgencySession: UserSession = {
    userId: 'usr-euro-agent-01',
    email: 'ops@eurovisa.com',
    tenantId: EUROVISA_AGENCY_TENANT_ID,
    role: 'agency_manager',
    isMfaVerified: true,
    aal: 'aal2',
    claims: {
      sub: 'usr-euro-agent-01',
      tenant_id: EUROVISA_AGENCY_TENANT_ID,
      role: 'agency_manager',
    },
  };

  beforeEach(() => {
    CaseService.clear();
    // Seed an agency case for Bengal
    CaseService.seedCase({
      id: 'case-bengal-101',
      tenantId: BENGAL_AGENCY_TENANT_ID,
      clientId: 'usr-client-bengal-1',
      caseNumber: 'VH-2026-SG-B01',
      countryCode: 'SG',
      serviceType: 'Tourist e-Visa',
      status: 'specialist_review',
      priority: 'standard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed a case for EuroVisa
    CaseService.seedCase({
      id: 'case-euro-202',
      tenantId: EUROVISA_AGENCY_TENANT_ID,
      clientId: 'usr-client-euro-2',
      caseNumber: 'VH-2026-DE-E02',
      countryCode: 'DE',
      serviceType: 'EU Blue Card',
      status: 'specialist_review',
      priority: 'standard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('derives tenant context strictly from verified JWT claim; ignores spoofed x-tenant-id header', () => {
    // Malicious client tries to pass EuroVisa tenant ID in header
    const context = PartnerMcpServer.createContext(bengalAgencySession, EUROVISA_AGENCY_TENANT_ID);

    expect(context.tenantId).toBe(BENGAL_AGENCY_TENANT_ID);
    expect(context.tenantId).not.toBe(EUROVISA_AGENCY_TENANT_ID);
    expect(context.rlsContextActive).toBe(true);

    const euroContext = PartnerMcpServer.createContext(eurovisaAgencySession);
    expect(euroContext.tenantId).toBe(EUROVISA_AGENCY_TENANT_ID);
  });

  it('lists partner tools only; administrative operational tools are omitted', () => {
    const context = PartnerMcpServer.createContext(bengalAgencySession);
    const tools = PartnerMcpServer.listTools(context);

    expect(tools.some((t) => t.name === 'listAgencyCases')).toBe(true);
    expect(tools.some((t) => t.name === 'checkWalletBalance')).toBe(true);
    expect(tools.some((t) => t.name === 'submitVisaCase')).toBe(true);
    expect(tools.some((t) => t.name === 'getCaseDocumentChecklist')).toBe(true);

    // Administrative tools MUST be omitted
    expect(tools.some((t) => t.name === 'adjustAgencyWalletBalance')).toBe(false);
    expect(tools.some((t) => t.name === 'listAllTenants')).toBe(false);
    expect(tools.some((t) => t.name === 'dispatchDailyExecutiveDigest')).toBe(false);
    expect(tools.some((t) => t.name === 'inspectCaseAuditTrail')).toBe(false);
  });

  it('strictly blocks partner agents from calling administrative tools', async () => {
    const context = PartnerMcpServer.createContext(bengalAgencySession);

    await expect(
      PartnerMcpServer.callTool(
        {
          name: 'adjustAgencyWalletBalance',
          arguments: { amount: 10000 },
        },
        context,
      ),
    ).rejects.toThrow(PartnerMcpForbiddenToolError);

    await expect(PartnerMcpServer.callTool({ name: 'listAllTenants' }, context)).rejects.toThrow(
      PartnerMcpForbiddenToolError,
    );
  });

  it('queries agency wallet balance and recent ledger transactions', async () => {
    const context = PartnerMcpServer.createContext(bengalAgencySession);
    const result = await PartnerMcpServer.callTool({ name: 'checkWalletBalance' }, context);

    expect(result.isError).toBe(false);
    const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
    expect(data['tenantId']).toBe(BENGAL_AGENCY_TENANT_ID);
    expect(data['balance']).toBeDefined();
    expect(data['currency']).toBe('USD');
  });

  it('rejects cross-tenant document checklist query when case belongs to another agency', async () => {
    const bengalContext = PartnerMcpServer.createContext(bengalAgencySession);

    // Bengal agency querying EuroVisa's case
    await expect(
      PartnerMcpServer.callTool(
        {
          name: 'getCaseDocumentChecklist',
          arguments: { caseId: 'case-euro-202' },
        },
        bengalContext,
      ),
    ).rejects.toThrow(PartnerMcpBoundaryViolationError);

    // Tool not found check
    await expect(
      PartnerMcpServer.callTool(
        {
          name: 'nonExistentPartnerTool',
        },
        bengalContext,
      ),
    ).rejects.toThrow(PartnerMcpToolNotFoundError);
  });

  it('submits a new visa case and atomically deducts the fee from agency prepaid wallet', async () => {
    const context = PartnerMcpServer.createContext(bengalAgencySession);

    // Ensure wallet has funds
    await WalletService.topUp({
      tenantId: BENGAL_AGENCY_TENANT_ID,
      amount: 500,
      currency: 'USD',
      gateway: 'pay_station',
      gatewayTransactionId: 'gw-tx-fund-01',
      idempotencyKey: 'idem-fund-01',
      signature: 'test_valid_signature_123',
    });

    const submitResult = await PartnerMcpServer.callTool(
      {
        name: 'submitVisaCase',
        arguments: {
          countryCode: 'SG',
          serviceType: 'Singapore SGAC',
          applicantName: 'Partner Sub Client',
          caseFee: 75,
        },
      },
      context,
    );

    expect(submitResult.isError).toBe(false);
    const data = JSON.parse(submitResult.content[0]?.text ?? '{}') as Record<string, unknown>;
    expect(data['success']).toBe(true);
    expect(data['feeDeducted']).toBe(75);
    const caseObj = data['case'] as Record<string, unknown>;
    expect(caseObj['tenantId']).toBe(BENGAL_AGENCY_TENANT_ID);
    expect(caseObj['countryCode']).toBe('SG');
  });

  it('handles JSON-RPC 2.0 tools/list and tools/call on partner server', async () => {
    const context = PartnerMcpServer.createContext(bengalAgencySession);

    const rpcList = await PartnerMcpServer.handleJsonRpc(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
      },
      context,
    );

    expect(rpcList.id).toBe(1);
    expect((rpcList.result as { tools: unknown[] }).tools.length).toBeGreaterThan(3);

    const rpcForbidden = await PartnerMcpServer.handleJsonRpc(
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'adjustAgencyWalletBalance' },
      },
      context,
    );

    expect(rpcForbidden.error).toBeDefined();
    expect(rpcForbidden.error?.code).toBe(403);
  });
});
