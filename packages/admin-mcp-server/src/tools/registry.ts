import {
  AgencyService,
  AuditService,
  CaseService,
  ExecutiveDigestService,
  WalletService,
} from '@visahobe/api';
import { DryRunTracer } from '@visahobe/browser-automation';
import type { AdminMcpContext, McpToolDefinition } from '../types.js';

export const ADMIN_TOOL_DEFINITIONS: McpToolDefinition[] = [
  {
    name: 'listAllTenants',
    description:
      'Retrieve all registered partner agency tenants with branding and status across the platform.',
    allowedRoles: ['super_admin', 'owner', 'admin'],
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'inspectCaseAuditTrail',
    description:
      'Inspect the cryptographic, append-only audit trail for a case across any tenant boundary.',
    allowedRoles: ['super_admin', 'owner', 'admin', 'case_manager', 'verifier'],
    inputSchema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', description: 'Unique case identifier or case number' },
      },
      required: ['caseId'],
    },
  },
  {
    name: 'reassignCaseSpecialist',
    description: 'Reassign an active visa application to a specialist caseworker.',
    allowedRoles: ['super_admin', 'owner', 'admin', 'case_manager'],
    inputSchema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', description: 'Unique case identifier' },
        specialistUserId: { type: 'string', description: 'User ID of assigned specialist' },
      },
      required: ['caseId', 'specialistUserId'],
    },
  },
  {
    name: 'triggerBrowserUseReplay',
    description:
      'Execute a deterministic, PII-masked browser automation dry-run trace for a destination portal.',
    allowedRoles: ['super_admin', 'owner', 'admin', 'case_manager', 'verifier'],
    inputSchema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', description: 'Case ID' },
        countryCode: {
          type: 'string',
          description: 'Destination country code (SG, AE, TR, GB, etc.)',
        },
      },
      required: ['caseId', 'countryCode'],
    },
  },
  {
    name: 'adjustAgencyWalletBalance',
    description:
      'Credit or debit a partner agency prepaid wallet with double-entry ledger balancing.',
    allowedRoles: ['super_admin', 'owner', 'admin', 'finance'],
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Target partner agency tenant UUID' },
        amount: { type: 'number', description: 'Amount to credit or debit' },
        operation: { type: 'string', enum: ['credit', 'debit'], description: 'Credit or debit' },
        reason: { type: 'string', description: 'Audit rationale for balance adjustment' },
      },
      required: ['tenantId', 'amount', 'operation', 'reason'],
    },
  },
  {
    name: 'dispatchDailyExecutiveDigest',
    description:
      'Compile and retrieve the real-time daily executive digest including autonomy metrics and SLA alerts.',
    allowedRoles: ['super_admin', 'owner', 'admin'],
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export type ToolHandler = (
  args: Record<string, unknown>,
  context: AdminMcpContext,
) => Promise<unknown>;

export const ADMIN_TOOL_HANDLERS: Record<string, ToolHandler> = {
  listAllTenants: async (_args, context) => {
    return AgencyService.listAgencies(context.session);
  },

  inspectCaseAuditTrail: async (args, context) => {
    const caseId = String(args['caseId'] || '');
    const logs = await AuditService.getLogsForTenant(context.session);
    return logs.filter((l) => l.entityId === caseId || l.details?.includes(caseId));
  },

  reassignCaseSpecialist: async (args, context) => {
    const caseId = String(args['caseId'] || '');
    const specialistUserId = String(args['specialistUserId'] || '');
    return CaseService.assignCaseSpecialist(context.session, {
      caseId,
      specialistUserId,
    });
  },

  triggerBrowserUseReplay: async (args, context) => {
    const caseId = String(args['caseId'] || '');
    const countryCode = String(args['countryCode'] || 'SG');

    const plan = DryRunTracer.generatePlan({
      caseId,
      tenantId: context.session.tenantId,
      countryCode,
      applicantData: {
        fullName: 'Admin Replay Applicant',
        passportNumber: 'A12345678',
        nationality: 'BGD',
        birthDate: '1990-01-01',
      },
    });

    return DryRunTracer.executeDryRunTrace(plan);
  },

  adjustAgencyWalletBalance: async (args, context) => {
    const tenantId = String(args['tenantId'] || '');
    const amount = Number(args['amount'] || 0);
    const operation = String(args['operation'] || 'credit');
    const reason = String(args['reason'] || 'Admin manual balance adjustment');

    if (operation === 'debit') {
      return WalletService.deductCaseFee(
        context.session,
        `admin-adj-${Date.now()}`,
        amount,
        reason,
        tenantId,
      );
    }

    const txId = `admin-adj-${Date.now()}`;
    return WalletService.topUp({
      tenantId,
      amount,
      currency: 'USD',
      gateway: 'pay_station',
      gatewayTransactionId: txId,
      idempotencyKey: `idem-${txId}`,
      signature: 'admin_manual_override_signature',
    });
  },

  dispatchDailyExecutiveDigest: async (_args, context) => {
    return ExecutiveDigestService.getDailyDigest(context.session);
  },
};
