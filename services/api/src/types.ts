import type { UserSession } from '@visahobe/auth';

export type CaseStatus =
  | 'draft'
  | 'intake_submitted'
  | 'specialist_review'
  | 'consular_filing'
  | 'decision_issued'
  | 'closed';

export type CasePriority = 'standard' | 'high' | 'urgent';

export interface CaseRecord {
  id: string;
  tenantId: string;
  clientId: string;
  caseNumber: string;
  countryCode: string;
  serviceType: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedToUserId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = 'pending' | 'verified' | 'resubmission_requested' | 'rejected';

export interface DocumentRecord {
  id: string;
  tenantId: string;
  caseId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  checksum?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  tenantId?: string | undefined;
  userId?: string | undefined;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null | undefined;
  newValues?: Record<string, unknown> | null | undefined;
  details?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T | undefined;
  error?:
    | {
        code: string;
        message: string;
        details?: unknown;
      }
    | undefined;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined> | undefined;
  body?: unknown;
  session?: UserSession | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}
