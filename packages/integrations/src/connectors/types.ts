export type ConnectorType = 'direct_ai' | 'partner_agency' | 'consular_portal';

export interface PartnerApplicantPayload {
  fullName: string;
  passportNumberRedacted: string;
  nationality: string;
  email: string;
  phone?: string | undefined;
}

export interface PartnerDocumentPayload {
  category: string;
  fileName: string;
  signedUrl: string;
}

export interface PartnerCaseSubmissionPayload {
  caseId: string;
  caseNumber: string;
  tenantId: string;
  countryCode: string;
  serviceType: string;
  applicant: PartnerApplicantPayload;
  documentUrls: PartnerDocumentPayload[];
  metadata?: Record<string, unknown> | undefined;
}

export interface PartnerSubmissionResult {
  success: boolean;
  externalReference: string;
  status: string;
  confidenceScore?: number | undefined;
  requiresReview?: boolean | undefined;
  estimatedDecisionDate?: string | undefined;
  message?: string | undefined;
  trackingUrl?: string | undefined;
  rawResponse?: Record<string, unknown> | undefined;
}

export interface PartnerStatusUpdate {
  externalReference: string;
  status: string;
  normalizedStage: 'intake' | 'review' | 'processing' | 'submitted' | 'decided';
  notes?: string | undefined;
  lastUpdated: string;
}

export interface PartnerSyncResult {
  success: boolean;
  syncedDocumentCount: number;
  externalDocumentIds: string[];
}

export interface PartnerWebhookEvent {
  eventType: string;
  externalReference: string;
  timestamp: string;
  status: string;
  payload: Record<string, unknown>;
}

export interface IPartnerConnector {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly connectorType: ConnectorType;
  readonly supportedCountryCodes: string[];
  readonly supportedServiceTypes: string[];

  /** Dispatch case package to external partner or internal AI execution engine */
  dispatchCase(payload: PartnerCaseSubmissionPayload): Promise<PartnerSubmissionResult>;

  /** Fetch latest status and tracking updates from partner */
  fetchCaseStatus(externalReference: string): Promise<PartnerStatusUpdate>;

  /** Securely transmit supplementary documents */
  syncDocuments(
    externalReference: string,
    documents: PartnerDocumentPayload[],
  ): Promise<PartnerSyncResult>;

  /** Handle and verify incoming partner webhook callbacks */
  handleWebhook(rawBody: string, signature: string): Promise<PartnerWebhookEvent>;

  /** Return configuration with secrets and API keys safely masked */
  getMaskedConfig(): Record<string, unknown>;
}
