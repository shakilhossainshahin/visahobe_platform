import type { ConsularAction, ConsularActionType } from '../types.js';

export class ConsularSafetyViolationError extends Error {
  readonly code = 'CONSULAR_SAFETY_VIOLATION';
  readonly statusCode = 403;
  readonly blockedActionTypes: ConsularActionType[];

  constructor(blockedActions: ConsularActionType[], message?: string) {
    super(
      message ??
        `Consular Safety Gate blocked autonomous execution of high-risk actions: ${blockedActions.join(
          ', ',
        )}. Mandatory human review ('in_review') required.`,
    );
    this.name = 'ConsularSafetyViolationError';
    this.blockedActionTypes = blockedActions;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConsularSafetyGuard {
  /**
   * Non-negotiable strictly blocked actions for autonomous AI execution (ADR-011 §3.2).
   * These actions strictly require human authorization under all circumstances.
   */
  public static readonly RESTRICTED_ACTIONS: readonly ConsularActionType[] = [
    'portal_payment',
    'schedule_biometrics',
    'sign_perjury_affidavit',
  ] as const;

  /**
   * Checks whether an action type is strictly restricted from autonomous execution.
   */
  public static isRestrictedAction(actionType: ConsularActionType): boolean {
    return ConsularSafetyGuard.RESTRICTED_ACTIONS.includes(actionType);
  }

  /**
   * Evaluates a single action against consular safety boundaries.
   */
  public static evaluateAction(action: ConsularAction): {
    isAllowed: boolean;
    reason?: string | undefined;
  } {
    if (ConsularSafetyGuard.isRestrictedAction(action.actionType)) {
      let specificReason = 'High-risk consular action requires human authorization.';
      if (action.actionType === 'portal_payment') {
        specificReason =
          'Autonomous execution of live government/consular portal payments is strictly forbidden. Human financial authorization required.';
      } else if (action.actionType === 'schedule_biometrics') {
        specificReason =
          'Autonomous irreversible scheduling of consular biometrics or interviews is strictly forbidden. Human staff inspection required.';
      } else if (action.actionType === 'sign_perjury_affidavit') {
        specificReason =
          'Autonomous execution of statutory affidavits under penalty of perjury is strictly forbidden. Human applicant/agent signature required.';
      }

      return {
        isAllowed: false,
        reason: specificReason,
      };
    }

    return { isAllowed: true };
  }

  /**
   * Evaluates a list of actions and partitions them into allowed vs blocked.
   */
  public static evaluateActions(actions: ConsularAction[]): {
    allowedActions: ConsularAction[];
    blockedActions: ConsularAction[];
    hasBlockedActions: boolean;
    blockedActionTypes: ConsularActionType[];
    summary: string;
  } {
    const allowedActions: ConsularAction[] = [];
    const blockedActions: ConsularAction[] = [];
    const blockedActionTypes: ConsularActionType[] = [];

    for (const action of actions) {
      const evaluation = ConsularSafetyGuard.evaluateAction(action);
      if (!evaluation.isAllowed) {
        blockedActions.push(action);
        if (!blockedActionTypes.includes(action.actionType)) {
          blockedActionTypes.push(action.actionType);
        }
      } else {
        allowedActions.push(action);
      }
    }

    const hasBlockedActions = blockedActions.length > 0;
    const summary = hasBlockedActions
      ? `Safety gate triggered: ${blockedActions.length} action(s) blocked (${blockedActionTypes.join(', ')}). Execution halted at 'in_review'.`
      : `Safety verification clean: all ${actions.length} action(s) approved for autonomous processing.`;

    return {
      allowedActions,
      blockedActions,
      hasBlockedActions,
      blockedActionTypes,
      summary,
    };
  }

  /**
   * Asserts that no restricted actions exist in the plan. Throws ConsularSafetyViolationError if violated.
   */
  public static assertSafeExecution(actions: ConsularAction[]): void {
    const evaluation = ConsularSafetyGuard.evaluateActions(actions);
    if (evaluation.hasBlockedActions) {
      throw new ConsularSafetyViolationError(
        evaluation.blockedActionTypes,
        `Autonomous execution halted: ${evaluation.summary}`,
      );
    }
  }
}
