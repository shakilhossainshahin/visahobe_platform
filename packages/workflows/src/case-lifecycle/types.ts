import type { UserSession } from '@visahobe/auth';
import type { PaymentCurrency, PaymentScheduleType } from '@visahobe/integrations';

export interface PassportInputData {
  passportNumber: string;
  surname: string;
  givenNames: string;
  nationality: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  expiryDate: string;
  issuingCountry: string;
  mrzLine1?: string | undefined;
  mrzLine2?: string | undefined;
}

export interface PaymentExecutionOptions {
  scheduleType: PaymentScheduleType;
  provider?: 'pay_station' | 'stripe' | undefined;
  payViaWallet?: boolean | undefined;
  walletTenantId?: string | undefined;
  feeAmount: number;
  currency: PaymentCurrency;
  milestones?:
    | {
        name: string;
        percentage: number;
        amount: number;
      }[]
    | undefined;
}

export interface CaseLifecycleInput {
  tenantId: string;
  callerSession: UserSession;
  clientTier?: 'b2c_retail' | 'b2b2c_partner' | 'internal_staff' | undefined;
  destinationCountry: string;
  visaCategory: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | undefined;
  passportData: PassportInputData;
  intakeAnswers: {
    yearsExperience?: number | undefined;
    salaryUsd?: number | undefined;
    degreeLevel?: string | undefined;
    hasJobOffer?: boolean | undefined;
    [key: string]: unknown;
  };
  paymentOptions: PaymentExecutionOptions;
  attemptRestrictedActions?: string[] | undefined;
}

export interface CaseLifecycleStepResult {
  stepIndex: number;
  stepName: string;
  status: 'completed' | 'gated' | 'failed';
  timestamp: string;
  details: Record<string, unknown>;
}

export interface CaseLifecycleResult {
  workflowId: string;
  caseId: string;
  caseNumber: string;
  status: string;
  autonomyLevel: string;
  confidenceScore: number;
  requiresHumanVerification: boolean;
  verificationReason?: string | undefined;
  intakeAssessment: {
    score: number;
    tier: string;
    qualified: boolean;
  };
  ocrResult: {
    valid: boolean;
    mrzValid: boolean;
    maskedPassportNumber: string;
    validUntil: string;
  };
  consularSafetyResult: {
    isAutonomousApproved: boolean;
    requiresHumanReview: boolean;
    blockedActions: string[];
    reason?: string | undefined;
  };
  paymentSettlement: {
    settled: boolean;
    method: 'wallet_debit' | 'gateway_session';
    amount: number;
    currency: string;
    referenceId: string;
    invoiceId?: string | undefined;
    scheduleType: string;
    status: 'paid' | 'pending';
  };
  dryRunTrace?:
    | {
        traceId: string;
        stepCount: number;
        checksum: string;
      }
    | undefined;
  steps: CaseLifecycleStepResult[];
  completedAt: string;
  isShielded: boolean;
}
