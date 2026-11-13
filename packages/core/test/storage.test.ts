import { describe, expect, it } from 'vitest';
import { generateSignedStorageUrl, StorageAccessDeniedError } from '../src/index.js';

describe('Storage Signed URL Generation (packages/core)', () => {
  const tenantA = '11111111-1111-4111-8111-111111111111';
  const tenantB = '22222222-2222-4222-8222-222222222222';

  it('should generate pre-signed URL when caller tenant matches document tenant', () => {
    const result = generateSignedStorageUrl({
      callerTenantId: tenantA,
      callerRole: 'client',
      documentTenantId: tenantA,
      caseId: 'case-abc',
      documentId: 'doc-xyz',
      filename: 'bank_statement.pdf',
      operation: 'download',
    });

    expect(result.url).toContain('operation=download');
    expect(result.url).toContain('signature=');
    expect(result.key).toBe(
      `tenants/${tenantA}/cases/case-abc/documents/doc-xyz/bank_statement.pdf`,
    );
  });

  it('should reject cross-tenant signed URL generation for client role', () => {
    expect(() =>
      generateSignedStorageUrl({
        callerTenantId: tenantB,
        callerRole: 'client',
        documentTenantId: tenantA,
        caseId: 'case-abc',
        documentId: 'doc-xyz',
        filename: 'bank_statement.pdf',
        operation: 'download',
      }),
    ).toThrow(StorageAccessDeniedError);
  });

  it('should reject cross-tenant access for staff role without verified MFA', () => {
    expect(() =>
      generateSignedStorageUrl({
        callerTenantId: tenantB,
        callerRole: 'admin',
        callerIsMfaVerified: false,
        hasScopedAccess: true,
        documentTenantId: tenantA,
        caseId: 'case-abc',
        documentId: 'doc-xyz',
        filename: 'bank_statement.pdf',
        operation: 'download',
      }),
    ).toThrow(StorageAccessDeniedError);
  });

  it('should allow cross-tenant access for staff role with verified MFA and scoped access', () => {
    const result = generateSignedStorageUrl({
      callerTenantId: tenantB,
      callerRole: 'admin',
      callerIsMfaVerified: true,
      hasScopedAccess: true,
      documentTenantId: tenantA,
      caseId: 'case-abc',
      documentId: 'doc-xyz',
      filename: 'bank_statement.pdf',
      operation: 'download',
    });

    expect(result.url).toBeDefined();
    expect(result.key).toContain(`tenants/${tenantA}`);
  });
});
