import { describe, expect, it, beforeEach } from 'vitest';
import { createMockAuthContext, MfaRequiredError } from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import { DocumentService } from '../src/documents/document-service.js';
import { AuditService } from '../src/audit/audit-service.js';
import type { DocumentRecord } from '../src/types.js';

describe('DocumentService — Verification, Audit & Signed URLs (TICKET-P2-002)', () => {
  const tenantA = '11111111-1111-1111-1111-111111111111';
  const tenantB = '22222222-2222-2222-2222-222222222222';

  const mockDocA: DocumentRecord = {
    id: 'doc-pass-001',
    tenantId: tenantA,
    caseId: 'case-sg-001',
    fileName: 'passport_bio.pdf',
    filePath:
      'tenants/11111111-1111-1111-1111-111111111111/cases/case-sg-001/doc-pass-001/passport_bio.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    DocumentService.clear();
    AuditService.clear();
    DocumentService.seedDocument(mockDocA);
  });

  it('approves document verification and records sanitized audit log', async () => {
    const verifierSession = createMockAuthContext({
      userId: 'usr-verifier-01',
      tenantId: tenantA,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const updated = await DocumentService.approveDocument(verifierSession, {
      documentId: 'doc-pass-001',
      notes: 'Certified genuine bio page for john.doe@visahobe.com.',
    });

    expect(updated.status).toBe('verified');

    const logs = await AuditService.getLogsForTenant(verifierSession);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe('document.verify');
    expect(logs[0]?.details).not.toContain('john.doe@visahobe.com');
    expect(logs[0]?.details).toContain('[REDACTED_EMAIL]');
  });

  it('requests document resubmission and records reason in audit trail', async () => {
    const verifierSession = createMockAuthContext({
      userId: 'usr-verifier-01',
      tenantId: tenantA,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const updated = await DocumentService.requestDocumentResubmission(verifierSession, {
      documentId: 'doc-pass-001',
      reason: 'Passport bio page is blurred and illegible.',
    });

    expect(updated.status).toBe('resubmission_requested');

    const logs = await AuditService.getLogsForTenant(verifierSession);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe('document.request_resubmission');
    expect(logs[0]?.details).toContain('Passport bio page is blurred and illegible.');
  });

  it('rejects unverified staff trying to approve a document (MFA required)', async () => {
    const unverifiedVerifier = createMockAuthContext({
      tenantId: tenantA,
      role: 'verifier',
      isMfaVerified: false,
      aal: 'aal1',
    });

    await expect(
      DocumentService.approveDocument(unverifiedVerifier, {
        documentId: 'doc-pass-001',
      }),
    ).rejects.toThrow(MfaRequiredError);
  });

  it('rejects cross-tenant document approval with StorageAccessDeniedError', async () => {
    const verifierTenantB = createMockAuthContext({
      tenantId: tenantB,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    await expect(
      DocumentService.approveDocument(verifierTenantB, {
        documentId: 'doc-pass-001',
      }),
    ).rejects.toThrow(StorageAccessDeniedError);
  });

  it('generates pre-signed storage URL with filename traversal sanitization and 15m TTL cap', () => {
    const verifierSession = createMockAuthContext({
      tenantId: tenantA,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const result = DocumentService.generatePresignedUrl(verifierSession, {
      caseId: 'case-sg-001',
      documentId: 'doc-pass-001',
      rawFilename: '../../../../etc/shadow..passport.pdf',
      operation: 'download',
      expiresInSeconds: 3600, // Exceeds 15m (900s) maximum
    });

    expect(result.url).toBeDefined();
    expect(result.operation).toBe('download');
    // Traversal stripped
    expect(result.key).not.toContain('../');
    expect(result.key).not.toContain('etc');
    expect(result.key).toContain('passport.pdf');

    // TTL capped at 900 seconds
    const diffSeconds = (result.expiresAt.getTime() - Date.now()) / 1000;
    expect(diffSeconds).toBeLessThanOrEqual(905);
    expect(diffSeconds).toBeGreaterThan(850);
  });
});
