export type FormFieldType = 'text' | 'date' | 'select' | 'checkbox' | 'radio' | 'file';

export interface ConsularFormField {
  fieldId: string;
  selector: string;
  fieldType: FormFieldType;
  label: string;
  value: string;
  isSensitive: boolean;
  required: boolean;
  validationRegex?: string | undefined;
}

export interface ConsularPortalConfig {
  countryCode: string;
  portalName: string;
  portalUrl: string;
  isEvisaSupported: boolean;
  requiresPaymentGate: boolean;
  requiresBiometrics: boolean;
  allowedDomains: string[];
}

export type StepActionType =
  | 'navigate'
  | 'verify_domain'
  | 'input_field'
  | 'select_option'
  | 'click_element'
  | 'upload_document'
  | 'safety_checkpoint'
  | 'submit_form';

export interface BrowserExecutionStep {
  stepIndex: number;
  action: StepActionType;
  description: string;
  target?: string | undefined;
  maskedValue?: string | undefined;
  isSafetyGate: boolean;
  status: 'planned' | 'verified' | 'blocked_by_safety_gate';
  metadata?: Record<string, unknown> | undefined;
}

export interface BrowserExecutionPlan {
  id: string;
  caseId: string;
  tenantId: string;
  countryCode: string;
  portalConfig: ConsularPortalConfig;
  mappedFields: ConsularFormField[];
  steps: BrowserExecutionStep[];
  isExecutionAllowed: boolean;
  safetyBlockReasons: string[];
  createdAt: string;
}

export interface DryRunTrace {
  traceId: string;
  planId: string;
  caseId: string;
  tenantId: string;
  countryCode: string;
  executedStepsCount: number;
  isCompleted: boolean;
  haltedAtStep?: number | undefined;
  safetyHaltReason?: string | undefined;
  redactedTraceSummary: string;
  traceHash: string;
  generatedAt: string;
}
