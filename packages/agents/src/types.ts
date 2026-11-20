export type AutonomyLevel =
  'level_1_assisted_draft' | 'level_2_semi_autonomous' | 'level_3_autonomous_submission';

export type ConsularActionType =
  | 'prepare_draft'
  | 'validate_checklist'
  | 'direct_portal_dispatch'
  | 'portal_payment'
  | 'schedule_biometrics'
  | 'sign_perjury_affidavit';

export interface ConsularAction {
  id: string;
  actionType: ConsularActionType;
  destinationCountry: string;
  description: string;
  targetPortal?: string | undefined;
  estimatedFee?: number | undefined;
  currency?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface DocumentOcrFieldResult {
  passportNumber?: string | undefined;
  fullName?: string | undefined;
  nationality?: string | undefined;
  birthDate?: string | undefined;
  expiryDate?: string | undefined;
  sex?: string | undefined;
  mrzLine1?: string | undefined;
  mrzLine2?: string | undefined;
  mrzValid?: boolean | undefined;
  issuingCountry?: string | undefined;
  [key: string]: unknown;
}

export interface DocumentOcrResult {
  documentId: string;
  documentType: 'passport' | 'bank_statement' | 'employment_letter' | 'invitation' | 'other';
  extractedFields: DocumentOcrFieldResult;
  confidenceScore: number; // 0.0 to 1.0
  isValid: boolean;
  issues: string[];
  verifiedAt: string;
}

export interface AutonomyEvaluation {
  level: AutonomyLevel;
  confidenceScore: number;
  destinationCountry: string;
  isAutonomousEligible: boolean;
  reason: string;
  requiresHumanVerification: boolean;
  blockedSafetyActions: ConsularActionType[];
  recommendedStatus: 'draft' | 'in_review' | 'submitted';
  redactedSummary: string;
}

export interface AutonomousExecutionSnapshot {
  id: string;
  caseId: string;
  tenantId: string;
  agentId: string;
  autonomyLevel: AutonomyLevel;
  confidenceScore: number;
  timestamp: string;
  status: 'completed' | 'halted_safety_gate' | 'draft_saved';
  safetyTriggers: string[];
  redactedPayload: Record<string, unknown>;
  auditHash: string;
}
