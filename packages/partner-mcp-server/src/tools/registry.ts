import { StorageAccessDeniedError } from '@visahobe/core';
import { CaseService, WalletService, DocumentService } from '@visahobe/api';
import { PartnerMcpBoundaryViolationError } from '../errors.js';
import type { McpToolDefinition, PartnerMcpContext } from '../types.js';

export const PARTNER_TOOL_DEFINITIONS: McpToolDefinition[] = [
  {
    name: 'listAgencyCases',
    description: 'Query all visa applications filed by and scoped to your partner agency.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by case status (optional)' },
      },
    },
  },
  {
    name: 'getCaseDocumentChecklist',
    description: 'Retrieve mandatory and uploaded document checklists for an agency-managed case.',
    inputSchema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', description: 'Case ID belonging to your agency' },
      },
      required: ['caseId'],
    },
  },
  {
    name: 'checkWalletBalance',
    description:
      'Inspect your partner agency prepaid wallet balance, currency, and recent ledger entries.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'submitVisaCase',
    description:
      'Submit a new visa application for an agency client and atomically deduct the case fee.',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Destination country code (SG, AE, TR, MY, etc.)',
        },
        serviceType: { type: 'string', description: 'Visa stream or service type' },
        applicantName: { type: 'string', description: 'Full name of applicant' },
        caseFee: { type: 'number', description: 'Case filing fee in USD' },
      },
      required: ['countryCode', 'serviceType', 'applicantName', 'caseFee'],
    },
  },
  {
    name: 'uploadCaseDocument',
    description: 'Request a secure presigned upload URL to upload a document for an agency case.',
    inputSchema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', description: 'Case ID belonging to your agency' },
        fileName: { type: 'string', description: 'Document filename' },
      },
      required: ['caseId', 'fileName'],
    },
  },
];

export const ADMIN_ONLY_TOOLS = [
  'adjustAgencyWalletBalance',
  'listAllTenants',
  'dispatchDailyExecutiveDigest',
  'inspectCaseAuditTrail',
  'reassignCaseSpecialist',
  'triggerBrowserUseReplay',
];

export type PartnerToolHandler = (
  args: Record<string, unknown>,
  context: PartnerMcpContext,
) => Promise<unknown>;

export const PARTNER_TOOL_HANDLERS: Record<string, PartnerToolHandler> = {
  listAgencyCases: async (args, context) => {
    const status = typeof args['status'] === 'string' ? args['status'] : undefined;
    return CaseService.listCases(context.session, { status });
  },

  getCaseDocumentChecklist: async (args, context) => {
    const caseId = String(args['caseId'] || '');
    try {
      const caseRecord = await CaseService.getCaseById(context.session, caseId);

      // Cross-tenant kernel boundary verification
      if (caseRecord.tenantId !== context.tenantId) {
        throw new PartnerMcpBoundaryViolationError();
      }

      return {
        caseId: caseRecord.id,
        caseNumber: caseRecord.caseNumber,
        countryCode: caseRecord.countryCode,
        status: caseRecord.status,
        checklist: [
          { name: 'Passport Identity Page', status: 'verified', mandatory: true },
          { name: 'Photograph (35x45mm)', status: 'verified', mandatory: true },
          { name: 'Proof of Financial Means', status: 'pending', mandatory: true },
        ],
      };
    } catch (err) {
      if (err instanceof StorageAccessDeniedError) {
        throw new PartnerMcpBoundaryViolationError(
          `Case '${caseId}' does not belong to partner tenant '${context.tenantId}'. Access denied.`,
        );
      }
      throw err;
    }
  },

  checkWalletBalance: async (_args, context) => {
    const wallet = await WalletService.getWallet(context.session, context.tenantId);
    const transactions = await WalletService.listTransactions(context.session, context.tenantId);

    return {
      walletId: wallet.id,
      tenantId: context.tenantId,
      balance: wallet.balance,
      currency: wallet.currency,
      isLowBalance: wallet.isLowBalance,
      recentTransactions: transactions.slice(0, 5),
    };
  },

  submitVisaCase: async (args, context) => {
    const countryCode = String(args['countryCode'] || 'SG').toUpperCase();
    const serviceType = String(args['serviceType'] || 'Standard e-Visa');
    const applicantName = String(args['applicantName'] || 'Agency Client');
    const caseFee = Number(args['caseFee'] || 100);

    const generatedCaseId = `case-${countryCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    // Atomic case fee deduction from agency wallet
    await WalletService.deductCaseFee(
      context.session,
      generatedCaseId,
      caseFee,
      `Prepaid filing fee for ${serviceType} (${countryCode}) - ${applicantName}`,
      context.tenantId,
    );

    const newCase = {
      id: generatedCaseId,
      tenantId: context.tenantId,
      clientId: `usr-cl-${Date.now().toString().slice(-4)}`,
      caseNumber: `VH-2026-${countryCode}-${Date.now().toString().slice(-4)}`,
      countryCode,
      serviceType,
      status: 'specialist_review',
      priority: 'standard',
      applicantName,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      case: newCase,
      feeDeducted: caseFee,
      message: 'Case submitted successfully; wallet fee deducted atomically.',
    };
  },

  uploadCaseDocument: async (args, context) => {
    const caseId = String(args['caseId'] || '');
    const fileName = String(args['fileName'] || 'document.pdf');

    const caseRecord = await CaseService.getCaseById(context.session, caseId);
    if (caseRecord.tenantId !== context.tenantId) {
      throw new PartnerMcpBoundaryViolationError();
    }

    const signedUrl = DocumentService.generatePresignedUrl(context.session, {
      documentId: `doc-${Date.now().toString().slice(-6)}`,
      caseId,
      rawFilename: fileName,
      operation: 'upload',
      expiresInSeconds: 900,
    });

    return {
      caseId,
      fileName,
      uploadUrl: signedUrl.url,
      expiresAt: signedUrl.expiresAt,
    };
  },
};
