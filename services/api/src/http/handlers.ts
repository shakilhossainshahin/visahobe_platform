import {
  validateJwtClaims,
  InvalidTokenError,
  MissingTenantClaimError,
  MfaRequiredError,
  PermissionDeniedError,
  type UserSession,
} from '@visahobe/auth';
import {
  StorageAccessDeniedError,
  ClientShieldingService,
  type ClientTier,
  type CasePayloadInput,
} from '@visahobe/core';
import { CaseNotFoundError, CaseService } from '../cases/case-service.js';
import { DocumentNotFoundError, DocumentService } from '../documents/document-service.js';
import { AuditService } from '../audit/audit-service.js';
import {
  WalletService,
  InsufficientFundsError,
  WalletNotFoundError,
  InvalidSignatureError,
  type TopUpWebhookPayload,
} from '../wallet/wallet-service.js';
import {
  AgencyService,
  AgencyNotFoundError,
  AgencyConflictError,
  type CreateAgencyInput,
} from '../agencies/agency-service.js';
import {
  PartnerConnectorRegistry,
  type IPartnerConnector,
  type PartnerCaseSubmissionPayload,
} from '@visahobe/integrations';
import { ExecutiveDigestService } from '../executive/digest-service.js';
import type { ApiResponse, AuthenticatedRequest, CaseStatus } from '../types.js';

export interface HttpResponse {
  status: number;
  body: ApiResponse;
  headers?: Record<string, string>;
}

export class OperationsApiHandler {
  /**
   * Resolves UserSession from request headers or cookies.
   * STRICT SECURITY INVARIANT:
   * Ignores and strips 'x-tenant-id' client headers. Tenant boundary is extracted
   * solely from the cryptographically verified JWT claims.
   */
  public static async authenticateRequest(req: AuthenticatedRequest): Promise<UserSession> {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    let token = '';

    if (typeof authHeader === 'string') {
      token = authHeader.replace(/^Bearer\s+/i, '').trim();
    }

    if (!token && req.headers['cookie']) {
      const cookieStr = typeof req.headers['cookie'] === 'string' ? req.headers['cookie'] : '';
      const match = cookieStr.match(/visahobe_session=([^;]+)/);
      if (match && match[1]) {
        token = match[1];
      }
    }

    if (!token) {
      throw new InvalidTokenError('Missing authorization token in request headers or cookies.');
    }

    // Cryptographic claim validation (iss, aud, exp, sub, tenant_id, aal)
    const session = await validateJwtClaims(token);
    return session;
  }

  /**
   * Dispatches incoming API request to appropriate controller action.
   */
  public static async handleRequest(
    method: string,
    pathname: string,
    req: AuthenticatedRequest,
  ): Promise<HttpResponse> {
    try {
      const session = await OperationsApiHandler.authenticateRequest(req);

      // Route: GET /api/v1/cases
      if (method === 'GET' && pathname === '/api/v1/cases') {
        const status = typeof req.query?.['status'] === 'string' ? req.query['status'] : undefined;
        const priority =
          typeof req.query?.['priority'] === 'string' ? req.query['priority'] : undefined;
        const cases = await CaseService.listCases(session, { status, priority });
        const host = typeof req.headers['host'] === 'string' ? req.headers['host'] : undefined;
        const tier: ClientTier = ClientShieldingService.resolveClientTier({
          host,
          userRole: session.role,
        });
        const shieldedCases = cases.map((c) =>
          ClientShieldingService.shieldCaseRecord(c as unknown as CasePayloadInput, tier, {
            callerTenantId: session.tenantId,
            callerRole: session.role,
          }),
        );
        return {
          status: 200,
          body: { success: true, data: shieldedCases },
        };
      }

      // Route: GET /api/v1/cases/:id
      const caseMatch = pathname.match(/^\/api\/v1\/cases\/([^/]+)$/);
      if (method === 'GET' && caseMatch && caseMatch[1]) {
        const caseRecord = await CaseService.getCaseById(session, caseMatch[1]);
        const host = typeof req.headers['host'] === 'string' ? req.headers['host'] : undefined;
        const tier: ClientTier = ClientShieldingService.resolveClientTier({
          host,
          userRole: session.role,
        });
        const shielded = ClientShieldingService.shieldCaseRecord(
          caseRecord as unknown as CasePayloadInput,
          tier,
          {
            callerTenantId: session.tenantId,
            callerRole: session.role,
          },
        );
        return {
          status: 200,
          body: { success: true, data: shielded },
        };
      }

      // Route: PATCH /api/v1/cases/:id/status
      const caseStatusMatch = pathname.match(/^\/api\/v1\/cases\/([^/]+)\/status$/);
      if (method === 'PATCH' && caseStatusMatch && caseStatusMatch[1]) {
        const body = (req.body ?? {}) as { newStatus?: CaseStatus; notes?: string };
        if (!body.newStatus) {
          return {
            status: 400,
            body: {
              success: false,
              error: { code: 'INVALID_PAYLOAD', message: 'Missing newStatus' },
            },
          };
        }
        const updated = await CaseService.updateCaseStatus(session, {
          caseId: caseStatusMatch[1],
          newStatus: body.newStatus,
          notes: body.notes,
        });
        return {
          status: 200,
          body: { success: true, data: updated },
        };
      }

      // Route: POST /api/v1/cases/:id/assign
      const caseAssignMatch = pathname.match(/^\/api\/v1\/cases\/([^/]+)\/assign$/);
      if (method === 'POST' && caseAssignMatch && caseAssignMatch[1]) {
        const body = (req.body ?? {}) as { specialistUserId?: string };
        if (!body.specialistUserId) {
          return {
            status: 400,
            body: {
              success: false,
              error: { code: 'INVALID_PAYLOAD', message: 'Missing specialistUserId' },
            },
          };
        }
        const updated = await CaseService.assignCaseSpecialist(session, {
          caseId: caseAssignMatch[1],
          specialistUserId: body.specialistUserId,
        });
        return {
          status: 200,
          body: { success: true, data: updated },
        };
      }

      // Route: POST /api/v1/documents/:id/approve
      const docApproveMatch = pathname.match(/^\/api\/v1\/documents\/([^/]+)\/approve$/);
      if (method === 'POST' && docApproveMatch && docApproveMatch[1]) {
        const body = (req.body ?? {}) as { notes?: string };
        const approved = await DocumentService.approveDocument(session, {
          documentId: docApproveMatch[1],
          notes: body.notes,
        });
        return {
          status: 200,
          body: { success: true, data: approved },
        };
      }

      // Route: POST /api/v1/documents/:id/resubmit
      const docResubmitMatch = pathname.match(/^\/api\/v1\/documents\/([^/]+)\/resubmit$/);
      if (method === 'POST' && docResubmitMatch && docResubmitMatch[1]) {
        const body = (req.body ?? {}) as { reason?: string };
        if (!body.reason) {
          return {
            status: 400,
            body: {
              success: false,
              error: { code: 'INVALID_PAYLOAD', message: 'Missing resubmission reason' },
            },
          };
        }
        const updated = await DocumentService.requestDocumentResubmission(session, {
          documentId: docResubmitMatch[1],
          reason: body.reason,
        });
        return {
          status: 200,
          body: { success: true, data: updated },
        };
      }

      // Route: POST /api/v1/documents/:id/signed-url
      const docSignedUrlMatch = pathname.match(/^\/api\/v1\/documents\/([^/]+)\/signed-url$/);
      if (method === 'POST' && docSignedUrlMatch && docSignedUrlMatch[1]) {
        const body = (req.body ?? {}) as {
          caseId?: string;
          filename?: string;
          operation?: 'download' | 'upload';
          expiresInSeconds?: number;
        };
        if (!body.caseId || !body.filename || !body.operation) {
          return {
            status: 400,
            body: {
              success: false,
              error: {
                code: 'INVALID_PAYLOAD',
                message: 'Missing caseId, filename, or operation',
              },
            },
          };
        }
        const signedUrl = DocumentService.generatePresignedUrl(session, {
          documentId: docSignedUrlMatch[1],
          caseId: body.caseId,
          rawFilename: body.filename,
          operation: body.operation,
          expiresInSeconds: body.expiresInSeconds,
        });
        return {
          status: 200,
          body: { success: true, data: signedUrl },
        };
      }

      // Route: GET /api/v1/audit/logs
      if (method === 'GET' && pathname === '/api/v1/audit/logs') {
        const logs = await AuditService.getLogsForTenant(session);
        return {
          status: 200,
          body: { success: true, data: logs },
        };
      }

      // Route: GET /api/v1/partners
      if (method === 'GET' && pathname === '/api/v1/partners') {
        const agencies = await AgencyService.listAgencies(session);
        return {
          status: 200,
          body: { success: true, data: agencies },
        };
      }

      // Route: POST /api/v1/partners
      if (method === 'POST' && pathname === '/api/v1/partners') {
        const result = await AgencyService.onboardAgency(session, req.body as CreateAgencyInput);
        return {
          status: 201,
          body: { success: true, data: result },
        };
      }

      // Route: GET /api/v1/partners/resolve-domain
      if (method === 'GET' && pathname === '/api/v1/partners/resolve-domain') {
        const host =
          typeof req.query?.['host'] === 'string'
            ? req.query['host']
            : typeof req.headers['host'] === 'string'
              ? req.headers['host']
              : undefined;
        const resolution = AgencyService.resolveTenantByHost(host);
        return {
          status: 200,
          body: { success: true, data: resolution },
        };
      }

      // Route: GET /api/v1/partners/:id
      const partnerMatch = pathname.match(/^\/api\/v1\/partners\/([^/]+)$/);
      if (method === 'GET' && partnerMatch && partnerMatch[1]) {
        const agency = await AgencyService.getAgency(session, partnerMatch[1]);
        return {
          status: 200,
          body: { success: true, data: agency },
        };
      }

      // Route: GET /api/v1/wallet
      if (method === 'GET' && pathname === '/api/v1/wallet') {
        const tenantId =
          typeof req.query?.['tenantId'] === 'string' ? req.query['tenantId'] : undefined;
        const wallet = await WalletService.getWallet(session, tenantId);
        return {
          status: 200,
          body: { success: true, data: wallet },
        };
      }

      // Route: POST /api/v1/wallet/topup (Pay Station / Stripe Webhook)
      if (method === 'POST' && pathname === '/api/v1/wallet/topup') {
        const topUpResult = await WalletService.topUp(req.body as TopUpWebhookPayload);
        return {
          status: 200,
          body: { success: true, data: topUpResult },
        };
      }

      // Route: POST /api/v1/wallet/deduct
      if (method === 'POST' && pathname === '/api/v1/wallet/deduct') {
        const body = (req.body as Record<string, unknown>) || {};
        const caseId = String(body['caseId'] || '');
        const amount = Number(body['amount'] || 0);
        const description =
          typeof body['description'] === 'string' ? body['description'] : undefined;
        const tenantId = typeof body['tenantId'] === 'string' ? body['tenantId'] : undefined;

        const debitResult = await WalletService.deductCaseFee(
          session,
          caseId,
          amount,
          description,
          tenantId,
        );
        return {
          status: 200,
          body: { success: true, data: debitResult },
        };
      }

      // Route: GET /api/v1/wallet/transactions
      if (method === 'GET' && pathname === '/api/v1/wallet/transactions') {
        const tenantId =
          typeof req.query?.['tenantId'] === 'string' ? req.query['tenantId'] : undefined;
        const txs = await WalletService.listTransactions(session, tenantId);
        return {
          status: 200,
          body: { success: true, data: txs },
        };
      }

      // Route: GET /api/v1/connectors
      if (method === 'GET' && pathname === '/api/v1/connectors') {
        const registry = PartnerConnectorRegistry.getInstance();
        const connectors = registry
          .listConnectors()
          .map((c: IPartnerConnector) => c.getMaskedConfig());
        return {
          status: 200,
          body: { success: true, data: connectors },
        };
      }

      // Route: POST /api/v1/fulfillment/dispatch
      if (method === 'POST' && pathname === '/api/v1/fulfillment/dispatch') {
        const body = (req.body as PartnerCaseSubmissionPayload) || {};
        const registry = PartnerConnectorRegistry.getInstance();
        const connector = registry.resolveConnectorForCase(body.countryCode, body.serviceType);
        const dispatchResult = await connector.dispatchCase(body);
        return {
          status: 200,
          body: {
            success: true,
            data: { connector: connector.getMaskedConfig(), result: dispatchResult },
          },
        };
      }

      // Route: GET /api/v1/executive/digest
      if (method === 'GET' && pathname === '/api/v1/executive/digest') {
        const digest = await ExecutiveDigestService.getDailyDigest(session);
        return {
          status: 200,
          body: { success: true, data: digest },
        };
      }

      return {
        status: 404,
        body: {
          success: false,
          error: { code: 'NOT_FOUND', message: `Route '${method} ${pathname}' not found` },
        },
      };
    } catch (err: unknown) {
      if (err instanceof InvalidTokenError || err instanceof MissingTenantClaimError) {
        return {
          status: 401,
          body: {
            success: false,
            error: { code: 'UNAUTHORIZED', message: err.message },
          },
        };
      }

      if (err instanceof MfaRequiredError) {
        return {
          status: 403,
          body: {
            success: false,
            error: { code: 'MFA_REQUIRED', message: err.message },
          },
        };
      }

      if (err instanceof PermissionDeniedError) {
        return {
          status: 403,
          body: {
            success: false,
            error: { code: 'FORBIDDEN', message: err.message },
          },
        };
      }

      if (err instanceof StorageAccessDeniedError) {
        return {
          status: 403,
          body: {
            success: false,
            error: { code: 'STORAGE_ACCESS_DENIED', message: err.message },
          },
        };
      }

      if (
        err instanceof CaseNotFoundError ||
        err instanceof DocumentNotFoundError ||
        err instanceof WalletNotFoundError ||
        err instanceof AgencyNotFoundError
      ) {
        return {
          status: 404,
          body: {
            success: false,
            error: { code: err.code, message: err.message },
          },
        };
      }

      if (err instanceof InsufficientFundsError) {
        return {
          status: 402,
          body: {
            success: false,
            error: { code: err.code, message: err.message },
          },
        };
      }

      if (err instanceof AgencyConflictError) {
        return {
          status: 409,
          body: {
            success: false,
            error: { code: err.code, message: err.message },
          },
        };
      }

      if (err instanceof InvalidSignatureError) {
        return {
          status: 400,
          body: {
            success: false,
            error: { code: err.code, message: err.message },
          },
        };
      }

      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return {
        status: 500,
        body: {
          success: false,
          error: { code: 'INTERNAL_SERVER_ERROR', message },
        },
      };
    }
  }
}
