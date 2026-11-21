import { randomUUID } from 'node:crypto';
import {
  assertPermission,
  hasPermission,
  enforceMfaPolicy,
  type UserSession,
} from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import { AuditService } from '../audit/audit-service.js';
import type { CasePriority, CaseRecord, CaseStatus } from '../types.js';

export interface CreateCaseInput {
  countryCode: string;
  serviceType: string;
  clientId?: string | undefined;
  priority?: CasePriority | undefined;
  status?: CaseStatus | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export class CaseNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'CASE_NOT_FOUND';

  constructor(caseId: string) {
    super(`Case with ID '${caseId}' was not found.`);
    this.name = 'CaseNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CaseService {
  private static cases: Map<string, CaseRecord> = new Map();

  /**
   * Seed mock cases for development / test verification.
   */
  public static seedCase(caseRecord: CaseRecord): void {
    CaseService.cases.set(caseRecord.id, caseRecord);
  }

  public static clear(): void {
    CaseService.cases.clear();
  }

  /**
   * Creates a new case strictly scoped to session.tenantId.
   */
  public static async createCase(
    session: UserSession,
    input: CreateCaseInput,
  ): Promise<CaseRecord> {
    assertPermission(session, 'case.create');

    const country = input.countryCode.trim().toUpperCase();
    const caseId = `case-${randomUUID()}`;
    const seq = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `VH-2026-${country}-${seq}`;
    const now = new Date().toISOString();

    const record: CaseRecord = {
      id: caseId,
      tenantId: session.tenantId,
      clientId: input.clientId ?? session.userId,
      caseNumber,
      countryCode: country,
      serviceType: input.serviceType,
      status: input.status ?? 'draft',
      priority: input.priority ?? 'standard',
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    CaseService.cases.set(record.id, record);

    await AuditService.recordLog(session, {
      action: 'case.created',
      entityType: 'Case',
      entityId: record.id,
      newValues: {
        caseNumber: record.caseNumber,
        countryCode: record.countryCode,
        status: record.status,
      },
      details: `Created new case ${record.caseNumber} for country ${record.countryCode}`,
    });

    return record;
  }

  /**
   * System-level status update for automated workflow execution engines.
   */
  public static async transitionCaseStatusSystem(
    caseId: string,
    newStatus: CaseStatus,
    _reason?: string,
  ): Promise<CaseRecord> {
    const existing = CaseService.cases.get(caseId);
    if (!existing) {
      throw new CaseNotFoundError(caseId);
    }
    const updated: CaseRecord = {
      ...existing,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    CaseService.cases.set(existing.id, updated);
    return updated;
  }

  /**
   * Lists cases strictly scoped to the caller's verified tenantId.
   */
  public static async listCases(
    session: UserSession,
    filter?: { status?: string | undefined; priority?: string | undefined } | undefined,
  ): Promise<CaseRecord[]> {
    if (!hasPermission(session, 'case.read')) {
      assertPermission(session, 'case.read');
    }

    const tenantCases: CaseRecord[] = [];
    for (const item of CaseService.cases.values()) {
      // Strict cryptographic tenant boundary: match session.tenantId ONLY
      if (item.tenantId !== session.tenantId) {
        continue;
      }
      if (filter?.status && item.status !== filter.status) {
        continue;
      }
      if (filter?.priority && item.priority !== filter.priority) {
        continue;
      }
      tenantCases.push(item);
    }

    return tenantCases;
  }

  /**
   * Retrieves a single case by ID with cross-tenant denial enforcement.
   */
  public static async getCaseById(session: UserSession, caseId: string): Promise<CaseRecord> {
    assertPermission(session, 'case.read');

    const found = CaseService.cases.get(caseId);
    if (!found) {
      throw new CaseNotFoundError(caseId);
    }

    // Cross-tenant access denial
    if (found.tenantId !== session.tenantId) {
      throw new StorageAccessDeniedError(
        `Cross-tenant access forbidden: Case '${caseId}' belongs to tenant '${found.tenantId}', but caller is authenticated under tenant '${session.tenantId}'.`,
      );
    }

    return found;
  }

  /**
   * Updates case status with mandatory staff MFA and immutable audit logging.
   */
  public static async updateCaseStatus(
    session: UserSession,
    input: {
      caseId: string;
      newStatus: CaseStatus;
      notes?: string | undefined;
    },
  ): Promise<CaseRecord> {
    assertPermission(session, 'case.update');
    enforceMfaPolicy(session);

    const existing = await CaseService.getCaseById(session, input.caseId);
    const oldStatus = existing.status;

    const updated: CaseRecord = {
      ...existing,
      status: input.newStatus,
      updatedAt: new Date().toISOString(),
    };

    CaseService.cases.set(existing.id, updated);

    // Record immutable audit log
    await AuditService.recordLog(session, {
      action: 'case.stage_transition',
      entityType: 'Case',
      entityId: existing.id,
      oldValues: { status: oldStatus },
      newValues: { status: input.newStatus },
      details: input.notes
        ? `Status transitioned from ${oldStatus} to ${input.newStatus}: ${input.notes}`
        : `Status transitioned from ${oldStatus} to ${input.newStatus}`,
    });

    return updated;
  }

  /**
   * Assigns a specialist to a case with mandatory staff MFA and audit log.
   */
  public static async assignCaseSpecialist(
    session: UserSession,
    input: {
      caseId: string;
      specialistUserId: string;
    },
  ): Promise<CaseRecord> {
    assertPermission(session, 'case.update');
    enforceMfaPolicy(session);

    const existing = await CaseService.getCaseById(session, input.caseId);
    const previousAssignee = existing.assignedToUserId;

    const updated: CaseRecord = {
      ...existing,
      assignedToUserId: input.specialistUserId,
      updatedAt: new Date().toISOString(),
    };

    CaseService.cases.set(existing.id, updated);

    await AuditService.recordLog(session, {
      action: 'case.assign_specialist',
      entityType: 'Case',
      entityId: existing.id,
      oldValues: { assignedToUserId: previousAssignee ?? null },
      newValues: { assignedToUserId: input.specialistUserId },
      details: `Specialist assignment changed to '${input.specialistUserId}'`,
    });

    return updated;
  }
}
