import { describe, expect, it, beforeEach } from 'vitest';
import { createMockAuthContext, MfaRequiredError, PermissionDeniedError } from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import { CaseNotFoundError, CaseService } from '../src/cases/case-service.js';
import { AuditService } from '../src/audit/audit-service.js';
import type { CaseRecord } from '../src/types.js';

describe('CaseService — Operations API & Tenant Isolation (TICKET-P2-002)', () => {
  const tenantA = '11111111-1111-1111-1111-111111111111';
  const tenantB = '22222222-2222-2222-2222-222222222222';

  const mockCaseA: CaseRecord = {
    id: 'case-sg-001',
    tenantId: tenantA,
    clientId: 'usr-client-001',
    caseNumber: 'VH-2026-SG-001',
    countryCode: 'SG',
    serviceType: 'Employment Pass',
    status: 'specialist_review',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockCaseB: CaseRecord = {
    id: 'case-de-002',
    tenantId: tenantB,
    clientId: 'usr-client-002',
    caseNumber: 'VH-2026-DE-002',
    countryCode: 'DE',
    serviceType: 'Opportunity Card',
    status: 'intake_submitted',
    priority: 'standard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    CaseService.clear();
    AuditService.clear();
    CaseService.seedCase(mockCaseA);
    CaseService.seedCase(mockCaseB);
  });

  it('strictly scopes listCases to the callers tenant ID', async () => {
    const sessionTenantA = createMockAuthContext({
      tenantId: tenantA,
      role: 'case_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const cases = await CaseService.listCases(sessionTenantA);
    expect(cases).toHaveLength(1);
    expect(cases[0]?.id).toBe('case-sg-001');
    expect(cases[0]?.tenantId).toBe(tenantA);
  });

  it('rejects cross-tenant getCaseById with StorageAccessDeniedError', async () => {
    const sessionTenantA = createMockAuthContext({
      tenantId: tenantA,
      role: 'case_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    // Attempting to access Tenant B's case
    await expect(CaseService.getCaseById(sessionTenantA, 'case-de-002')).rejects.toThrow(
      StorageAccessDeniedError,
    );
  });

  it('throws CaseNotFoundError for non-existent case', async () => {
    const sessionTenantA = createMockAuthContext({
      tenantId: tenantA,
      role: 'case_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    await expect(CaseService.getCaseById(sessionTenantA, 'case-nonexistent')).rejects.toThrow(
      CaseNotFoundError,
    );
  });

  it('enforces mandatory staff MFA on updateCaseStatus', async () => {
    const unverifiedStaffSession = createMockAuthContext({
      tenantId: tenantA,
      role: 'case_manager',
      isMfaVerified: false,
      aal: 'aal1',
    });

    await expect(
      CaseService.updateCaseStatus(unverifiedStaffSession, {
        caseId: 'case-sg-001',
        newStatus: 'consular_filing',
      }),
    ).rejects.toThrow(MfaRequiredError);
  });

  it('updates case status and records immutable audit log with sanitized details', async () => {
    const verifiedStaffSession = createMockAuthContext({
      userId: 'usr-sarah-jenkins',
      tenantId: tenantA,
      role: 'case_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const updated = await CaseService.updateCaseStatus(verifiedStaffSession, {
      caseId: 'case-sg-001',
      newStatus: 'consular_filing',
      notes:
        'Consular dossier verified for applicant user test@visahobe.com with passport A12345678.',
    });

    expect(updated.status).toBe('consular_filing');

    const logs = await AuditService.getLogsForTenant(verifiedStaffSession);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe('case.stage_transition');
    expect(logs[0]?.entityId).toBe('case-sg-001');

    // Verify PII redaction in audit log details
    expect(logs[0]?.details).not.toContain('test@visahobe.com');
    expect(logs[0]?.details).not.toContain('A12345678');
    expect(logs[0]?.details).toContain('[REDACTED_EMAIL]');
  });

  it('assigns specialist to case with verified staff session and emits audit log', async () => {
    const adminSession = createMockAuthContext({
      userId: 'usr-admin-ops',
      tenantId: tenantA,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const updated = await CaseService.assignCaseSpecialist(adminSession, {
      caseId: 'case-sg-001',
      specialistUserId: 'usr-specialist-42',
    });

    expect(updated.assignedToUserId).toBe('usr-specialist-42');

    const logs = await AuditService.getLogsForTenant(adminSession);
    expect(logs.some((l) => l.action === 'case.assign_specialist')).toBe(true);
  });

  it('blocks unprivileged roles lacking case.update permission', async () => {
    const clientSession = createMockAuthContext({
      tenantId: tenantA,
      role: 'client',
      isMfaVerified: false,
    });

    await expect(
      CaseService.updateCaseStatus(clientSession, {
        caseId: 'case-sg-001',
        newStatus: 'closed',
      }),
    ).rejects.toThrow(PermissionDeniedError);
  });
});
