import { ConsularSafetyGuard } from '../safety/consular-safety-guard.js';
import type {
  AutonomyEvaluation,
  AutonomyLevel,
  ConsularAction,
  DocumentOcrResult,
} from '../types.js';

export interface EvaluateAutonomyInput {
  destinationCountry: string;
  confidenceScore: number;
  actions?: ConsularAction[] | undefined;
  ocrResult?: DocumentOcrResult | undefined;
}

export class AutonomyRouter {
  /**
   * Countries supporting Level 3 direct autonomous electronic visa/entry card submission (ADR-011 §2).
   */
  public static readonly STANDARD_EVISA_COUNTRIES: readonly string[] = [
    'SG', // Singapore SG Arrival Card / e-Visa
    'AE', // UAE / Dubai e-Visa
    'TR', // Turkey e-Visa
    'MY', // Malaysia Digital Arrival Card (MDAC)
    'VN', // Vietnam e-Visa
  ] as const;

  /**
   * Countries strictly requiring human consular interview or complex verifier review (ADR-011 §2).
   */
  public static readonly CONSULAR_JURISDICTIONS: readonly string[] = [
    'US', // United States DS-160
    'GB', // United Kingdom Visas & Immigration
    'CA', // Canada IRCC Portal
    'DE', // Germany Schengen National Visa
    'AU', // Australia ImmiAccount
  ] as const;

  /**
   * Evaluates case context, destination country, confidence score, and proposed actions
   * to determine the exact autonomy level and safety gates (ADR-011).
   */
  public static evaluateAutonomy(input: EvaluateAutonomyInput): AutonomyEvaluation {
    const countryCode = input.destinationCountry.trim().toUpperCase();
    const confidenceScore = Math.max(0.0, Math.min(1.0, input.confidenceScore));
    const actions = input.actions ?? [];

    // 1. Evaluate Consular Safety boundaries
    const safetyEval = ConsularSafetyGuard.evaluateActions(actions);
    const hasSafetyBlock = safetyEval.hasBlockedActions;

    // 2. Base Autonomy classification based on confidence score & jurisdiction
    let level: AutonomyLevel;
    let isAutonomousEligible = false;
    let requiresHumanVerification = true;
    let recommendedStatus: 'draft' | 'in_review' | 'submitted' = 'in_review';
    let reason = '';

    const isStandardEVisa = AutonomyRouter.STANDARD_EVISA_COUNTRIES.includes(countryCode);
    const isConsularJurisdiction = AutonomyRouter.CONSULAR_JURISDICTIONS.includes(countryCode);

    if (hasSafetyBlock) {
      // Hard Consular Safety override: always forces human verification gate regardless of confidence
      requiresHumanVerification = true;
      recommendedStatus = 'in_review';
      isAutonomousEligible = false;
      level = confidenceScore < 0.8 ? 'level_1_assisted_draft' : 'level_2_semi_autonomous';
      reason = `Consular Safety Guard halted autonomous submission: restricted action(s) detected (${safetyEval.blockedActionTypes.join(
        ', ',
      )}). Case routed to verifier review ('in_review').`;
    } else if (confidenceScore < 0.8) {
      // Level 1: Assisted Draft
      level = 'level_1_assisted_draft';
      isAutonomousEligible = false;
      requiresHumanVerification = true;
      recommendedStatus = 'draft';
      reason = `Confidence score (${confidenceScore.toFixed(
        2,
      )}) is below 0.80 threshold. AI drafted application; requires human staff inspection before saving.`;
    } else if (confidenceScore < 0.95) {
      // Level 2: Semi-Autonomous
      level = 'level_2_semi_autonomous';
      isAutonomousEligible = false;
      requiresHumanVerification = true;
      recommendedStatus = 'in_review';
      reason = `Confidence score (${confidenceScore.toFixed(
        2,
      )}) is between 0.80 and 0.94. Pre-submission checklists prepared; halted at verifier sign-off gate.`;
    } else {
      // Confidence >= 0.95: Check destination jurisdiction
      if (isStandardEVisa) {
        // Level 3: Autonomous Submission
        level = 'level_3_autonomous_submission';
        isAutonomousEligible = true;
        requiresHumanVerification = false;
        recommendedStatus = 'submitted';
        reason = `Confidence score (${confidenceScore.toFixed(
          2,
        )}) meets >= 0.95 threshold for standard e-visa jurisdiction (${countryCode}). Qualified for autonomous submission.`;
      } else {
        // Consular jurisdiction requires human sign-off even at high confidence
        level = 'level_2_semi_autonomous';
        isAutonomousEligible = false;
        requiresHumanVerification = true;
        recommendedStatus = 'in_review';
        reason = isConsularJurisdiction
          ? `Destination country (${countryCode}) is a complex consular jurisdiction requiring mandatory human verifier sign-off.`
          : `Destination country (${countryCode}) is not on standard e-visa allowlist. Downgraded to semi-autonomous review.`;
      }
    }

    // OCR issue check if provided
    if (input.ocrResult && !input.ocrResult.isValid && level === 'level_3_autonomous_submission') {
      level = 'level_2_semi_autonomous';
      isAutonomousEligible = false;
      requiresHumanVerification = true;
      recommendedStatus = 'in_review';
      reason = `OCR document verification failed or has pending validation issues (${input.ocrResult.issues.join(
        ', ',
      )}). Downgraded to semi-autonomous verifier review.`;
    }

    const redactedSummary = `Autonomy Evaluation [${level}] - Country: ${countryCode}, Confidence: ${(
      confidenceScore * 100
    ).toFixed(1)}%, Status: ${recommendedStatus}, Safety Blocks: ${
      safetyEval.blockedActionTypes.length > 0 ? safetyEval.blockedActionTypes.join(', ') : 'None'
    }`;

    return {
      level,
      confidenceScore,
      destinationCountry: countryCode,
      isAutonomousEligible,
      reason,
      requiresHumanVerification,
      blockedSafetyActions: safetyEval.blockedActionTypes,
      recommendedStatus,
      redactedSummary,
    };
  }
}
