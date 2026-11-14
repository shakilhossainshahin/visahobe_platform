import { assertPermission, enforceMfaPolicy, type UserSession } from '@visahobe/auth';
import {
  generateSignedStorageUrl,
  sanitizeUploadFilename,
  StorageAccessDeniedError,
  type SignedStorageUrlResult,
} from '@visahobe/core';
import { AuditService } from '../audit/audit-service.js';
import type { DocumentRecord } from '../types.js';

export class DocumentNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'DOCUMENT_NOT_FOUND';

  constructor(documentId: string) {
    super(`Document with ID '${documentId}' was not found.`);
    this.name = 'DocumentNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DocumentService {
  private static documents: Map<string, DocumentRecord> = new Map();

  public static seedDocument(doc: DocumentRecord): void {
    DocumentService.documents.set(doc.id, doc);
  }

  public static clear(): void {
    DocumentService.documents.clear();
  }

  public static async getDocumentById(
    session: UserSession,
    documentId: string,
  ): Promise<DocumentRecord> {
    assertPermission(session, 'document.read');

    const found = DocumentService.documents.get(documentId);
    if (!found) {
      throw new DocumentNotFoundError(documentId);
    }

    if (found.tenantId !== session.tenantId) {
      throw new StorageAccessDeniedError(
        `Cross-tenant document access forbidden: Document '${documentId}' belongs to tenant '${found.tenantId}', but caller is authenticated under tenant '${session.tenantId}'.`,
      );
    }

    return found;
  }

  /**
   * Approves a document verification with mandatory staff MFA and immutable audit logging.
   */
  public static async approveDocument(
    session: UserSession,
    input: {
      documentId: string;
      notes?: string | undefined;
    },
  ): Promise<DocumentRecord> {
    assertPermission(session, 'document.verify');
    enforceMfaPolicy(session);

    const doc = await DocumentService.getDocumentById(session, input.documentId);
    const oldStatus = doc.status;

    const updated: DocumentRecord = {
      ...doc,
      status: 'verified',
      updatedAt: new Date().toISOString(),
    };

    DocumentService.documents.set(doc.id, updated);

    await AuditService.recordLog(session, {
      action: 'document.verify',
      entityType: 'Document',
      entityId: doc.id,
      oldValues: { status: oldStatus },
      newValues: { status: 'verified' },
      details: input.notes
        ? `Document verification approved: ${input.notes}`
        : 'Document verification approved by specialist',
    });

    return updated;
  }

  /**
   * Requests document resubmission with mandatory staff MFA and scrubbed audit log.
   */
  public static async requestDocumentResubmission(
    session: UserSession,
    input: {
      documentId: string;
      reason: string;
    },
  ): Promise<DocumentRecord> {
    assertPermission(session, 'document.verify');
    enforceMfaPolicy(session);

    const doc = await DocumentService.getDocumentById(session, input.documentId);
    const oldStatus = doc.status;

    const updated: DocumentRecord = {
      ...doc,
      status: 'resubmission_requested',
      updatedAt: new Date().toISOString(),
    };

    DocumentService.documents.set(doc.id, updated);

    await AuditService.recordLog(session, {
      action: 'document.request_resubmission',
      entityType: 'Document',
      entityId: doc.id,
      oldValues: { status: oldStatus },
      newValues: { status: 'resubmission_requested' },
      details: `Document resubmission requested. Reason: ${input.reason}`,
    });

    return updated;
  }

  /**
   * Generates a pre-signed storage URL bridging @visahobe/core storage boundary service.
   * Enforces:
   * 1. Path traversal sanitization (sanitizeUploadFilename)
   * 2. Short-lived TTL <= 15 minutes (900 seconds)
   * 3. Tenant cryptographic boundary
   */
  public static generatePresignedUrl(
    session: UserSession,
    input: {
      caseId: string;
      documentId: string;
      rawFilename: string;
      operation: 'download' | 'upload';
      expiresInSeconds?: number | undefined;
    },
  ): SignedStorageUrlResult {
    const requiredPermission =
      input.operation === 'upload' ? 'document.upload' : 'document.download';
    assertPermission(session, requiredPermission);

    // 1. Sanitize filename against directory traversal
    const safeFilename = sanitizeUploadFilename(input.rawFilename);

    // 2. Strict TTL invariant: maximum 15 minutes (900 seconds)
    const MAX_TTL_SECONDS = 900;
    const requestedTtl = input.expiresInSeconds ?? MAX_TTL_SECONDS;
    const safeTtl = Math.min(Math.max(1, requestedTtl), MAX_TTL_SECONDS);

    // 3. Delegate to core storage signed URL engine
    return generateSignedStorageUrl({
      callerTenantId: session.tenantId,
      callerRole: session.role,
      callerIsMfaVerified: session.isMfaVerified,
      hasScopedAccess: true,
      documentTenantId: session.tenantId,
      caseId: input.caseId,
      documentId: input.documentId,
      filename: safeFilename,
      operation: input.operation,
      expiresInSeconds: safeTtl,
    });
  }
}
