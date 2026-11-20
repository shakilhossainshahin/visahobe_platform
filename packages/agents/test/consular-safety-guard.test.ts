import { describe, expect, it } from 'vitest';
import {
  ConsularSafetyGuard,
  ConsularSafetyViolationError,
} from '../src/safety/consular-safety-guard.js';
import type { ConsularAction } from '../src/types.js';

describe('ConsularSafetyGuard', () => {
  it('identifies restricted actions strictly defined in ADR-011', () => {
    expect(ConsularSafetyGuard.isRestrictedAction('portal_payment')).toBe(true);
    expect(ConsularSafetyGuard.isRestrictedAction('schedule_biometrics')).toBe(true);
    expect(ConsularSafetyGuard.isRestrictedAction('sign_perjury_affidavit')).toBe(true);

    expect(ConsularSafetyGuard.isRestrictedAction('prepare_draft')).toBe(false);
    expect(ConsularSafetyGuard.isRestrictedAction('validate_checklist')).toBe(false);
    expect(ConsularSafetyGuard.isRestrictedAction('direct_portal_dispatch')).toBe(false);
  });

  it('allows safe consular actions through the evaluation gate', () => {
    const action: ConsularAction = {
      id: 'act-1',
      actionType: 'prepare_draft',
      destinationCountry: 'SG',
      description: 'Prepare Singapore SGAC form fields',
    };

    const evalResult = ConsularSafetyGuard.evaluateAction(action);
    expect(evalResult.isAllowed).toBe(true);
    expect(evalResult.reason).toBeUndefined();
  });

  it('blocks portal payment and requires human authorization', () => {
    const action: ConsularAction = {
      id: 'act-2',
      actionType: 'portal_payment',
      destinationCountry: 'AE',
      description: 'Trigger 350 AED government visa payment',
      estimatedFee: 350,
      currency: 'AED',
    };

    const evalResult = ConsularSafetyGuard.evaluateAction(action);
    expect(evalResult.isAllowed).toBe(false);
    expect(evalResult.reason).toContain(
      'Autonomous execution of live government/consular portal payments is strictly forbidden',
    );
  });

  it('evaluates a batch of actions and identifies blocked safety triggers', () => {
    const actions: ConsularAction[] = [
      {
        id: '1',
        actionType: 'validate_checklist',
        destinationCountry: 'TR',
        description: 'Validate docs',
      },
      {
        id: '2',
        actionType: 'schedule_biometrics',
        destinationCountry: 'US',
        description: 'Book VAC appointment',
      },
      {
        id: '3',
        actionType: 'sign_perjury_affidavit',
        destinationCountry: 'GB',
        description: 'Sign declaration',
      },
    ];

    const result = ConsularSafetyGuard.evaluateActions(actions);
    expect(result.allowedActions).toHaveLength(1);
    expect(result.blockedActions).toHaveLength(2);
    expect(result.hasBlockedActions).toBe(true);
    expect(result.blockedActionTypes).toContain('schedule_biometrics');
    expect(result.blockedActionTypes).toContain('sign_perjury_affidavit');
    expect(result.summary).toContain('Safety gate triggered: 2 action(s) blocked');
  });

  it('throws ConsularSafetyViolationError on assertSafeExecution when restricted action is present', () => {
    const actions: ConsularAction[] = [
      {
        id: '1',
        actionType: 'portal_payment',
        destinationCountry: 'SG',
        description: 'Pay entry fee',
      },
    ];

    expect(() => ConsularSafetyGuard.assertSafeExecution(actions)).toThrow(
      ConsularSafetyViolationError,
    );

    try {
      ConsularSafetyGuard.assertSafeExecution(actions);
    } catch (err) {
      const error = err as ConsularSafetyViolationError;
      expect(error.code).toBe('CONSULAR_SAFETY_VIOLATION');
      expect(error.statusCode).toBe(403);
      expect(error.blockedActionTypes).toEqual(['portal_payment']);
    }
  });
});
