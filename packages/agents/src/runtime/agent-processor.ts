import { createHash } from 'crypto';
import { AutonomyRouter } from '../autonomy/autonomy-router.js';
import { DocumentOcrVerifier } from '../ocr/document-ocr-verifier.js';
import type {
  AutonomousExecutionSnapshot,
  AutonomyEvaluation,
  ConsularAction,
  DocumentOcrResult,
} from '../types.js';

export interface ProcessCaseInput {
  caseId: string;
  tenantId: string;
  destinationCountry: string;
  agentId?: string | undefined;
  applicantData?:
    | {
        passportNumber?: string | undefined;
        fullName?: string | undefined;
        birthDate?: string | undefined;
        nationality?: string | undefined;
        [key: string]: unknown;
      }
    | undefined;
  ocrResult?: DocumentOcrResult | undefined;
  actions?: ConsularAction[] | undefined;
  confidenceScore?: number | undefined;
}

export interface CaseProcessingResult {
  evaluation: AutonomyEvaluation;
  snapshot: AutonomousExecutionSnapshot;
  isSubmissionExecuted: boolean;
}

export class SuperAgentProcessor {
  /**
   * Generates a deterministic SHA-256 audit digest for an autonomous execution snapshot.
   */
  public static computeAuditHash(payload: {
    caseId: string;
    tenantId: string;
    agentId: string;
    level: string;
    confidenceScore: number;
    timestamp: string;
    status: string;
    safetyTriggers: string[];
    redactedPayload: Record<string, unknown>;
  }): string {
    const rawString = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Executes full agentic evaluation and creates a cryptographic audit snapshot.
   */
  public static processCase(input: ProcessCaseInput): CaseProcessingResult {
    const agentId = input.agentId ?? 'super-agent-core-01';
    const timestamp = new Date().toISOString();

    // Determine confidence score: from OCR if available and not overridden
    let confidence = input.confidenceScore ?? 1.0;
    if (input.ocrResult) {
      confidence = Math.min(confidence, input.ocrResult.confidenceScore);
    }

    // Evaluate Autonomy Level and Consular Safety Guard
    const evaluation = AutonomyRouter.evaluateAutonomy({
      destinationCountry: input.destinationCountry,
      confidenceScore: confidence,
      actions: input.actions,
      ocrResult: input.ocrResult,
    });

    // Prepare safe redacted payload (Defense-in-depth PII scrubbing)
    const redactedPayload: Record<string, unknown> = {};

    if (input.applicantData) {
      redactedPayload.applicant = {
        ...input.applicantData,
        passportNumber: DocumentOcrVerifier.maskPassportNumber(input.applicantData.passportNumber),
        birthDate: DocumentOcrVerifier.maskBirthDate(input.applicantData.birthDate),
      };
    }

    if (input.ocrResult) {
      redactedPayload.ocr = {
        documentId: input.ocrResult.documentId,
        documentType: input.ocrResult.documentType,
        confidenceScore: input.ocrResult.confidenceScore,
        isValid: input.ocrResult.isValid,
        issues: input.ocrResult.issues,
        extractedFields: DocumentOcrVerifier.redactOcrFields(input.ocrResult.extractedFields),
      };
    }

    if (input.actions && input.actions.length > 0) {
      redactedPayload.actions = input.actions.map((act) => ({
        id: act.id,
        actionType: act.actionType,
        destinationCountry: act.destinationCountry,
        description: act.description,
      }));
    }

    // Determine execution status
    let status: 'completed' | 'halted_safety_gate' | 'draft_saved' = 'draft_saved';
    let isSubmissionExecuted = false;

    if (evaluation.blockedSafetyActions.length > 0) {
      status = 'halted_safety_gate';
    } else if (
      evaluation.level === 'level_3_autonomous_submission' &&
      !evaluation.requiresHumanVerification
    ) {
      status = 'completed';
      isSubmissionExecuted = true;
    } else {
      status = 'draft_saved';
    }

    const safetyTriggers = evaluation.blockedSafetyActions.map(
      (action) => `Blocked high-risk action: ${action}`,
    );

    // Compute cryptographic SHA-256 audit hash
    const snapshotPayload = {
      caseId: input.caseId,
      tenantId: input.tenantId,
      agentId,
      level: evaluation.level,
      confidenceScore: evaluation.confidenceScore,
      timestamp,
      status,
      safetyTriggers,
      redactedPayload,
    };

    const auditHash = SuperAgentProcessor.computeAuditHash(snapshotPayload);

    const snapshot: AutonomousExecutionSnapshot = {
      id: `snap-${createHash('md5').update(`${input.caseId}-${timestamp}`).digest('hex').slice(0, 12)}`,
      caseId: input.caseId,
      tenantId: input.tenantId,
      agentId,
      autonomyLevel: evaluation.level,
      confidenceScore: evaluation.confidenceScore,
      timestamp,
      status,
      safetyTriggers,
      redactedPayload,
      auditHash,
    };

    return {
      evaluation,
      snapshot,
      isSubmissionExecuted,
    };
  }
}
