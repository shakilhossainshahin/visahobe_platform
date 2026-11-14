import { redactPii } from '@visahobe/core';
import type { UserSession } from '@visahobe/auth';
import type { AuditLogRecord } from '../types.js';

export interface RecordAuditInput {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null | undefined;
  newValues?: Record<string, unknown> | null | undefined;
  details?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export class AuditService {
  private static logs: AuditLogRecord[] = [];

  /**
   * Records an immutable audit log entry.
   * Defense-in-depth: all values and details are scrubbed of raw PII via @visahobe/core.
   */
  public static async recordLog(
    session: UserSession,
    input: RecordAuditInput,
  ): Promise<AuditLogRecord> {
    const rawDetails = input.details ?? '';
    const sanitizedDetails = rawDetails ? (redactPii(rawDetails) as string) : '';

    const sanitizedOldValues = input.oldValues
      ? (redactPii(input.oldValues) as Record<string, unknown>)
      : null;

    const sanitizedNewValues = input.newValues
      ? (redactPii(input.newValues) as Record<string, unknown>)
      : null;

    const logEntry: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      tenantId: session.tenantId,
      userId: session.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValues: sanitizedOldValues,
      newValues: sanitizedNewValues,
      details: sanitizedDetails,
      ipAddress: input.ipAddress || '127.0.0.1 (API Gateway)',
      userAgent: input.userAgent || 'VisaHobe-Api-Client/1.0',
      createdAt: new Date().toISOString(),
    };

    AuditService.logs.push(logEntry);
    return logEntry;
  }

  /**
   * Retrieves audit logs strictly isolated by tenantId.
   */
  public static async getLogsForTenant(
    session: UserSession,
    filter?: { entityId?: string; action?: string },
  ): Promise<AuditLogRecord[]> {
    return AuditService.logs.filter((log) => {
      if (log.tenantId !== session.tenantId) {
        return false;
      }
      if (filter?.entityId && log.entityId !== filter.entityId) {
        return false;
      }
      if (filter?.action && !log.action.startsWith(filter.action)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Resets the in-memory audit store (for testing).
   */
  public static clear(): void {
    AuditService.logs = [];
  }
}
