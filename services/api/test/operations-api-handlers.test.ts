import { describe, expect, it, beforeEach } from 'vitest';
import { createMockAuthToken } from '@visahobe/auth';
import { CaseService } from '../src/cases/case-service.js';
import { DocumentService } from '../src/documents/document-service.js';
import { AuditService } from '../src/audit/audit-service.js';
import { AgencyService, BENGAL_AGENCY_TENANT_ID } from '../src/agencies/agency-service.js';
import { OperationsApiHandler } from '../src/http/handlers.js';
import type { AuthenticatedRequest, CaseRecord, DocumentRecord } from '../src/types.js';

describe('OperationsApiHandler — REST Dispatch & Security Perimeter (TICKET-P2-002)', () => {
  const tenantA = '11111111-1111-1111-1111-111111111111';
  const tenantB = '22222222-2222-2222-2222-222222222222';

  const mockCaseA: CaseRecord = {
    id: 'case-sg-100',
    tenantId: tenantA,
    clientId: 'usr-client-100',
    caseNumber: 'VH-2026-SG-100',
    countryCode: 'SG',
    serviceType: 'Employment Pass',
    status: 'specialist_review',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockDocA: DocumentRecord = {
    id: 'doc-100',
    tenantId: tenantA,
    caseId: 'case-sg-100',
    fileName: 'degree_cert.pdf',
    filePath:
      'tenants/11111111-1111-1111-1111-111111111111/cases/case-sg-100/doc-100/degree_cert.pdf',
    fileSize: 1048576,
    mimeType: 'application/pdf',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    CaseService.clear();
    DocumentService.clear();
    AuditService.clear();
    AgencyService.ensureDefaultAgencies();
    CaseService.seedCase(mockCaseA);
    DocumentService.seedDocument(mockDocA);
  });

  it('rejects unauthenticated requests with HTTP 401', async () => {
    const unauthReq: AuthenticatedRequest = {
      headers: {},
    };

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/cases', unauthReq);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('UNAUTHORIZED');
  });

  it('strictly ignores spoofed x-tenant-id client headers', async () => {
    // Staff token is cryptographically bound to Tenant A
    const tokenTenantA = await createMockAuthToken({
      tenantId: tenantA,
      role: 'case_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const spoofAttemptReq: AuthenticatedRequest = {
      headers: {
        authorization: `Bearer ${tokenTenantA}`,
        // Malicious client tries to spoof header to access Tenant B
        'x-tenant-id': tenantB,
      },
    };

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/cases', spoofAttemptReq);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cases = res.body.data as CaseRecord[];
    // Only cases belonging to Tenant A (from verified JWT) are returned
    expect(cases).toHaveLength(1);
    expect(cases[0]?.tenantId).toBe(tenantA);
  });

  it('updates case status via PATCH /api/v1/cases/:id/status with verified staff token', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${token}` },
      body: {
        newStatus: 'consular_filing',
        notes: 'Dossier ready for submission to MOM Singapore.',
      },
    };

    const res = await OperationsApiHandler.handleRequest(
      'PATCH',
      '/api/v1/cases/case-sg-100/status',
      req,
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = res.body.data as CaseRecord;
    expect(updated.status).toBe('consular_filing');
  });

  it('returns HTTP 403 MFA_REQUIRED when staff lacks verified MFA', async () => {
    const tokenWithoutMfa = await createMockAuthToken({
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: false,
      aal: 'aal1',
    });

    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${tokenWithoutMfa}` },
      body: { newStatus: 'consular_filing' },
    };

    const res = await OperationsApiHandler.handleRequest(
      'PATCH',
      '/api/v1/cases/case-sg-100/status',
      req,
    );
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('MFA_REQUIRED');
  });

  it('approves document verification and records audit log', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${token}` },
      body: { notes: 'Apostille stamp confirmed.' },
    };

    const res = await OperationsApiHandler.handleRequest(
      'POST',
      '/api/v1/documents/doc-100/approve',
      req,
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const doc = res.body.data as DocumentRecord;
    expect(doc.status).toBe('verified');

    // Verify audit logs endpoint returns the event
    const auditRes = await OperationsApiHandler.handleRequest('GET', '/api/v1/audit/logs', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(auditRes.status).toBe(200);
    const logs = auditRes.body.data as unknown[];
    expect(logs).toHaveLength(1);
  });

  it('generates pre-signed storage URL via POST /api/v1/documents/:id/signed-url', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${token}` },
      body: {
        caseId: 'case-sg-100',
        filename: 'degree_cert.pdf',
        operation: 'download',
      },
    };

    const res = await OperationsApiHandler.handleRequest(
      'POST',
      '/api/v1/documents/doc-100/signed-url',
      req,
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('url');
  });

  it('lists partner travel agencies via GET /api/v1/partners', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/partners', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const agencies = res.body.data as unknown[];
    expect(agencies.length).toBeGreaterThan(0);
  });

  it('resolves white-label custom domain via GET /api/v1/partners/resolve-domain', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/partners/resolve-domain', {
      headers: { authorization: `Bearer ${token}` },
      query: { host: 'visa.bengaltravel.com' },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('isWhiteLabel', true);
  });

  it('retrieves agency prepaid wallet and transactions via GET /api/v1/wallet', async () => {
    const token = await createMockAuthToken({
      tenantId: BENGAL_AGENCY_TENANT_ID,
      role: 'agency_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/wallet', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('balance');
  });

  it('deducts case fee via POST /api/v1/wallet/deduct and prevents overdraft', async () => {
    const token = await createMockAuthToken({
      tenantId: BENGAL_AGENCY_TENANT_ID,
      role: 'agency_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    // Valid deduction within balance
    const validDebit = await OperationsApiHandler.handleRequest('POST', '/api/v1/wallet/deduct', {
      headers: { authorization: `Bearer ${token}` },
      body: { caseId: 'case-sg-100', amount: 50, description: 'Test Case Fee' },
    });
    expect(validDebit.status).toBe(200);
    expect(validDebit.body.success).toBe(true);

    // Overdraft attempt ($999,999) rejected with HTTP 402
    const overdraft = await OperationsApiHandler.handleRequest('POST', '/api/v1/wallet/deduct', {
      headers: { authorization: `Bearer ${token}` },
      body: { caseId: 'case-sg-999', amount: 999999, description: 'Overdraft Test' },
    });
    expect(overdraft.status).toBe(402);
    expect(overdraft.body.success).toBe(false);
    expect(overdraft.body.error?.code).toBe('INSUFFICIENT_WALLET_BALANCE');
  });

  it('lists registered connectors with masked credentials via GET /api/v1/connectors', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/connectors', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const connectors = res.body.data as Array<Record<string, unknown>>;
    expect(connectors.length).toBeGreaterThan(0);
    // Zero secret leak verification
    expect(JSON.stringify(connectors)).not.toContain('super_secret');
  });

  it('dispatches case fulfillment via POST /api/v1/fulfillment/dispatch', async () => {
    const token = await createMockAuthToken({
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const res = await OperationsApiHandler.handleRequest('POST', '/api/v1/fulfillment/dispatch', {
      headers: { authorization: `Bearer ${token}` },
      body: {
        caseId: 'case-dispatch-test',
        caseNumber: 'VH-2026-SG-99',
        tenantId: tenantA,
        countryCode: 'SG',
        serviceType: 'tourist_evisa',
        applicant: {
          fullName: 'Test Applicant',
          passportNumberRedacted: 'A0987****',
          nationality: 'Bangladesh',
          email: 'test@example.com',
        },
        documentUrls: [
          { category: 'identity_passport', fileName: 'pass.pdf', signedUrl: 'https://s3/p.pdf' },
          { category: 'photo', fileName: 'pic.jpg', signedUrl: 'https://s3/pic.jpg' },
        ],
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('result');
  });
});
