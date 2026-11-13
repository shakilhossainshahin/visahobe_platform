import { createHmac } from 'crypto';

export class StorageAccessDeniedError extends Error {
  readonly statusCode = 403;
  readonly code = 'STORAGE_ACCESS_DENIED';

  constructor(message = 'Cross-tenant document storage access is forbidden') {
    super(message);
    this.name = 'StorageAccessDeniedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const PRIVILEGED_STAFF_ROLES = [
  'owner',
  'admin',
  'case_manager',
  'verifier',
  'finance',
  'browser_operator',
  'developer_reviewer',
] as const;

export interface GenerateSignedUrlOptions {
  callerTenantId: string;
  callerRole: string;
  callerIsMfaVerified?: boolean | undefined;
  hasScopedAccess?: boolean | undefined;
  documentTenantId: string;
  caseId: string;
  documentId: string;
  filename: string;
  operation: 'download' | 'upload';
  expiresInSeconds?: number | undefined;
  storageEndpoint?: string | undefined;
  signingSecret?: string | undefined;
}

export interface SignedStorageUrlResult {
  url: string;
  key: string;
  expiresAt: Date;
  operation: 'download' | 'upload';
}

/**
 * Generates an isolated, time-limited pre-signed storage URL adhering to ADR-002:
 * `s3://visahobe-secure-vault/tenants/{tenant_id}/cases/{case_id}/documents/{document_id}/{filename}`
 *
 * Enforces strict tenant boundary:
 * If `callerTenantId !== documentTenantId`, access is immediately rejected unless
 * caller has verified staff role AND verified MFA AND explicit scoped access.
 */
export function generateSignedStorageUrl(
  options: GenerateSignedUrlOptions,
): SignedStorageUrlResult {
  const {
    callerTenantId,
    callerRole,
    callerIsMfaVerified = false,
    hasScopedAccess = false,
    documentTenantId,
    caseId,
    documentId,
    filename,
    operation,
    expiresInSeconds = 900, // 15 minutes default
    storageEndpoint = process.env.S3_ENDPOINT || 'https://vault.visahobe.com',
    signingSecret = process.env.JWT_SECRET || 'dev_storage_signing_secret_key_minimum_32_chars',
  } = options;

  // 1. Strict Tenant Isolation Verification
  if (callerTenantId !== documentTenantId) {
    const isStaff = (PRIVILEGED_STAFF_ROLES as readonly string[]).includes(
      callerRole.toLowerCase(),
    );

    if (!isStaff || !hasScopedAccess || !callerIsMfaVerified) {
      throw new StorageAccessDeniedError(
        `Cross-tenant document access denied. Caller tenant '${callerTenantId}' cannot generate ${operation} URL for document owned by tenant '${documentTenantId}'.`,
      );
    }
  }

  // 2. Enforce maximum 15-minute TTL per ADR-002
  const maxTtl = 900;
  const ttl = Math.min(Math.max(expiresInSeconds, 60), maxTtl);
  const expiresAt = new Date(Date.now() + ttl * 1000);
  const expiresEpoch = Math.floor(expiresAt.getTime() / 1000);

  // 3. Partitioned Key Structure: tenants/{tenant_id}/cases/{case_id}/documents/{document_id}/{filename}
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `tenants/${documentTenantId}/cases/${caseId}/documents/${documentId}/${cleanFilename}`;

  // 4. Generate Cryptographic Signature
  const stringToSign = `${operation.toUpperCase()}:${key}:${expiresEpoch}:${documentTenantId}`;
  const signature = createHmac('sha256', signingSecret).update(stringToSign).digest('hex');

  const baseEndpoint = storageEndpoint.replace(/\/+$/, '');
  const url = `${baseEndpoint}/${key}?operation=${operation}&expires=${expiresEpoch}&signature=${signature}`;

  return {
    url,
    key,
    expiresAt,
    operation,
  };
}
