import { describe, expect, it } from 'vitest';
import {
  MfaRequiredError,
  PermissionDeniedError,
  createMockAuthToken,
  type UserSession,
} from '@visahobe/auth';
import { ExecutiveDigestService, OperationsApiHandler } from '../src/index.js';

describe('ExecutiveDigestService & Operations API (ADR-011)', () => {
  const superAdminSession: UserSession = {
    userId: 'super-admin-01',
    email: 'executive@visahobe.com',
    tenantId: 'tenant-visahobe-platform-hq',
    role: 'super_admin',
    isMfaVerified: true,
    aal: 'aal2',
    claims: { sub: 'super-admin-01', role: 'super_admin', aal: 'aal2' },
  };

  const clientSession: UserSession = {
    userId: 'client-user-99',
    email: 'client@example.com',
    tenantId: 'tenant-client-1',
    role: 'client',
    isMfaVerified: false,
    aal: 'aal1',
    claims: { sub: 'client-user-99', role: 'client', aal: 'aal1' },
  };

  it('compiles the full daily executive digest for AAL2 super admin', async () => {
    const digest = await ExecutiveDigestService.getDailyDigest(superAdminSession);

    expect(digest).toBeDefined();
    expect(digest.digestId).toContain('digest-');
    expect(digest.totalActiveCases).toBeGreaterThan(0);

    // Autonomy metrics verification
    expect(digest.autonomyMetrics.level1AssistedDraftCount).toBeGreaterThan(0);
    expect(digest.autonomyMetrics.level2SemiAutonomousCount).toBeGreaterThan(0);
    expect(digest.autonomyMetrics.level3AutonomousSubmissionCount).toBeGreaterThan(0);
    expect(digest.autonomyMetrics.autonomyRatio).toBeGreaterThan(0);
    expect(digest.autonomyMetrics.averageConfidenceScore).toBeGreaterThanOrEqual(0.9);

    // Consular safety guard metrics verification
    expect(digest.safetyMetrics.totalBlockedActions).toBeGreaterThan(0);
    expect(digest.safetyMetrics.breakdown.portal_payment).toBeGreaterThan(0);
    expect(digest.safetyMetrics.breakdown.schedule_biometrics).toBeGreaterThan(0);
    expect(digest.safetyMetrics.breakdown.sign_perjury_affidavit).toBeGreaterThan(0);
    expect(digest.safetyMetrics.interventionsRequiringSignOff.length).toBeGreaterThan(0);

    // Low balance agencies and SLA alerts
    expect(Array.isArray(digest.lowBalanceAgencies)).toBe(true);
    expect(digest.slaBreachAlerts.length).toBeGreaterThan(0);
    expect(digest.slaBreachAlerts[0]?.severity).toBe('critical');
  });

  it('rejects access if staff session does not have AAL2 MFA verification', async () => {
    const nonMfaStaffSession: UserSession = {
      ...superAdminSession,
      isMfaVerified: false,
      aal: 'aal1',
    };

    await expect(ExecutiveDigestService.getDailyDigest(nonMfaStaffSession)).rejects.toThrow(
      MfaRequiredError,
    );
  });

  it('rejects access if user is not authorized staff member', async () => {
    await expect(ExecutiveDigestService.getDailyDigest(clientSession)).rejects.toThrow(
      MfaRequiredError,
    );

    const mfaClientSession: UserSession = {
      ...clientSession,
      isMfaVerified: true,
      aal: 'aal2',
    };

    await expect(ExecutiveDigestService.getDailyDigest(mfaClientSession)).rejects.toThrow(
      PermissionDeniedError,
    );
  });

  it('serves GET /api/v1/executive/digest via OperationsApiHandler with valid AAL2 token', async () => {
    const validToken = await createMockAuthToken({
      userId: '00000000-0000-0000-0000-000000000001',
      tenantId: '11111111-1111-1111-1111-111111111111',
      email: 'executive@visahobe.com',
      role: 'super_admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const res = await OperationsApiHandler.handleRequest('GET', '/api/v1/executive/digest', {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data as Record<string, unknown>;
    expect(data['digestId']).toBeDefined();
    expect(data['autonomyMetrics']).toBeDefined();
    expect(data['safetyMetrics']).toBeDefined();
  });
});
