import { describe, expect, it } from 'vitest';
import { SuperAgentProcessor } from '../src/runtime/agent-processor.js';
import type { ConsularAction } from '../src/types.js';

describe('SuperAgentProcessor', () => {
  it('processes autonomous submission for standard e-visa with high confidence', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);

    const result = SuperAgentProcessor.processCase({
      caseId: 'case-sg-001',
      tenantId: 'tenant-demo-1',
      destinationCountry: 'SG',
      confidenceScore: 0.98,
      applicantData: {
        passportNumber: 'A12345678',
        fullName: 'Test Applicant',
        birthDate: '1990-01-01',
        nationality: 'BGD',
      },
    });

    expect(result.evaluation.level).toBe('level_3_autonomous_submission');
    expect(result.isSubmissionExecuted).toBe(true);
    expect(result.snapshot.status).toBe('completed');
    expect(result.snapshot.auditHash).toBeDefined();
    expect(result.snapshot.auditHash).toHaveLength(64); // SHA-256 hex length
    expect(result.snapshot.redactedPayload.applicant).toBeDefined();
    expect(
      (result.snapshot.redactedPayload.applicant as { passportNumber: string }).passportNumber,
    ).toBe('A1*****78');
  });

  it('halts execution when consular safety violation occurs and logs audit hash', () => {
    const actions: ConsularAction[] = [
      {
        id: 'act-pay',
        actionType: 'portal_payment',
        destinationCountry: 'AE',
        description: 'Auto pay e-Visa fee',
      },
    ];

    const result = SuperAgentProcessor.processCase({
      caseId: 'case-ae-halt',
      tenantId: 'tenant-demo-1',
      destinationCountry: 'AE',
      confidenceScore: 0.99,
      actions,
    });

    expect(result.evaluation.level).toBe('level_2_semi_autonomous');
    expect(result.isSubmissionExecuted).toBe(false);
    expect(result.snapshot.status).toBe('halted_safety_gate');
    expect(result.snapshot.safetyTriggers).toContain('Blocked high-risk action: portal_payment');
    expect(result.snapshot.auditHash).toBeDefined();
  });
});
