import { describe, expect, it } from 'vitest';
import { AutonomyRouter } from '../src/autonomy/autonomy-router.js';
import type { ConsularAction } from '../src/types.js';

describe('AutonomyRouter', () => {
  it('routes confidence < 0.80 to level_1_assisted_draft', () => {
    const res = AutonomyRouter.evaluateAutonomy({
      destinationCountry: 'SG',
      confidenceScore: 0.75,
    });

    expect(res.level).toBe('level_1_assisted_draft');
    expect(res.isAutonomousEligible).toBe(false);
    expect(res.requiresHumanVerification).toBe(true);
    expect(res.recommendedStatus).toBe('draft');
    expect(res.reason).toContain('below 0.80 threshold');
  });

  it('routes confidence between 0.80 and 0.94 to level_2_semi_autonomous', () => {
    const res = AutonomyRouter.evaluateAutonomy({
      destinationCountry: 'SG',
      confidenceScore: 0.92,
    });

    expect(res.level).toBe('level_2_semi_autonomous');
    expect(res.isAutonomousEligible).toBe(false);
    expect(res.requiresHumanVerification).toBe(true);
    expect(res.recommendedStatus).toBe('in_review');
    expect(res.reason).toContain('between 0.80 and 0.94');
  });

  it('qualifies standard e-visa countries with confidence >= 0.95 for level_3_autonomous_submission', () => {
    for (const country of ['SG', 'AE', 'TR', 'MY', 'VN']) {
      const res = AutonomyRouter.evaluateAutonomy({
        destinationCountry: country,
        confidenceScore: 0.98,
      });

      expect(res.level).toBe('level_3_autonomous_submission');
      expect(res.isAutonomousEligible).toBe(true);
      expect(res.requiresHumanVerification).toBe(false);
      expect(res.recommendedStatus).toBe('submitted');
      expect(res.reason).toContain('Qualified for autonomous submission');
    }
  });

  it('downgrades consular jurisdictions (US, GB, CA, DE, AU) to level_2 even with 1.0 confidence', () => {
    for (const country of ['US', 'GB', 'CA', 'DE', 'AU']) {
      const res = AutonomyRouter.evaluateAutonomy({
        destinationCountry: country,
        confidenceScore: 1.0,
      });

      expect(res.level).toBe('level_2_semi_autonomous');
      expect(res.isAutonomousEligible).toBe(false);
      expect(res.requiresHumanVerification).toBe(true);
      expect(res.recommendedStatus).toBe('in_review');
      expect(res.reason).toContain(
        'complex consular jurisdiction requiring mandatory human verifier sign-off',
      );
    }
  });

  it('forces human verification gate when restricted consular actions are present', () => {
    const actions: ConsularAction[] = [
      {
        id: 'act-1',
        actionType: 'portal_payment',
        destinationCountry: 'SG',
        description: 'Automatic portal card payment',
      },
    ];

    const res = AutonomyRouter.evaluateAutonomy({
      destinationCountry: 'SG',
      confidenceScore: 0.99,
      actions,
    });

    expect(res.level).toBe('level_2_semi_autonomous');
    expect(res.isAutonomousEligible).toBe(false);
    expect(res.requiresHumanVerification).toBe(true);
    expect(res.recommendedStatus).toBe('in_review');
    expect(res.blockedSafetyActions).toEqual(['portal_payment']);
    expect(res.reason).toContain('Consular Safety Guard halted autonomous submission');
  });
});
