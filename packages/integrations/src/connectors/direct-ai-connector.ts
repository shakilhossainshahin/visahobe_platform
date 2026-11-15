import type {
  IPartnerConnector,
  PartnerCaseSubmissionPayload,
  PartnerDocumentPayload,
  PartnerStatusUpdate,
  PartnerSubmissionResult,
  PartnerSyncResult,
  PartnerWebhookEvent,
} from './types.js';

/**
 * Direct Autonomous AI Fulfillment Connector (ADR-011)
 * Used when no specialized regional partner exists and official government e-visa portals
 * allow direct programmatic submission with confidence scoring.
 */
export class DirectAutonomousAIConnector implements IPartnerConnector {
  public readonly partnerId = 'DIRECT-AI-DEFAULT';
  public readonly partnerName = 'VisaHobe Direct Autonomous AI Processor';
  public readonly connectorType = 'direct_ai' as const;
  public readonly supportedCountryCodes = ['SG', 'AE', 'TR', 'MY', 'VN'];
  public readonly supportedServiceTypes = ['tourist_evisa', 'business_evisa', 'arrival_card'];

  private readonly modelName: string;
  private readonly internalApiKey: string;

  constructor(options?: { modelName?: string; internalApiKey?: string }) {
    this.modelName = options?.modelName ?? 'gemini-1.5-pro';
    this.internalApiKey = options?.internalApiKey ?? 'sec_live_ai_direct_9842a8b9f';
  }

  public async dispatchCase(
    payload: PartnerCaseSubmissionPayload,
  ): Promise<PartnerSubmissionResult> {
    // Confidence scoring simulation based on document readiness and extraction certainty (ADR-011)
    const hasPassport = payload.documentUrls.some(
      (d) =>
        d.category.toLowerCase().includes('identity') ||
        d.category.toLowerCase().includes('passport'),
    );
    const hasPhoto = payload.documentUrls.some((d) => d.category.toLowerCase().includes('photo'));
    const isStandardCountry = this.supportedCountryCodes.includes(
      payload.countryCode.toUpperCase(),
    );

    let confidence = 0.8;
    if (hasPassport) confidence += 0.1;
    if (hasPhoto) confidence += 0.05;
    if (isStandardCountry) confidence += 0.04;

    const roundedConfidence = Math.min(Number(confidence.toFixed(2)), 0.99);
    const autonomousEligible = roundedConfidence >= 0.95;

    const externalReference = `AI-DIR-${payload.countryCode}-${Date.now().toString(36).toUpperCase()}`;

    if (autonomousEligible) {
      return {
        success: true,
        externalReference,
        status: 'submitted',
        confidenceScore: roundedConfidence,
        requiresReview: false,
        estimatedDecisionDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString().split('T')[0],
        message:
          'Direct Autonomous AI submission executed successfully without human gate intervention.',
        trackingUrl: `https://visahobe.internal/ai-submissions/${externalReference}`,
      };
    }

    // Halts at Level 2 Verifier Review Gate
    return {
      success: true,
      externalReference,
      status: 'in_review',
      confidenceScore: roundedConfidence,
      requiresReview: true,
      message: `Confidence score (${roundedConfidence}) below autonomous threshold (0.95). Case routed to human verifier gate.`,
    };
  }

  public async fetchCaseStatus(externalReference: string): Promise<PartnerStatusUpdate> {
    return {
      externalReference,
      status: 'processing',
      normalizedStage: 'processing',
      notes: 'Direct AI portal monitor checking official government registry.',
      lastUpdated: new Date().toISOString(),
    };
  }

  public async syncDocuments(
    externalReference: string,
    documents: PartnerDocumentPayload[],
  ): Promise<PartnerSyncResult> {
    return {
      success: true,
      syncedDocumentCount: documents.length,
      externalDocumentIds: documents.map((_, idx) => `${externalReference}-DOC-${idx + 1}`),
    };
  }

  public async handleWebhook(rawBody: string, signature: string): Promise<PartnerWebhookEvent> {
    if (!signature || signature.length < 5) {
      throw new Error('Invalid AI connector webhook signature');
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      parsed = { raw: rawBody };
    }

    return {
      eventType: 'direct_ai.status_update',
      externalReference: String(parsed.externalReference || 'AI-EVENT'),
      timestamp: new Date().toISOString(),
      status: String(parsed.status || 'updated'),
      payload: parsed,
    };
  }

  public getMaskedConfig(): Record<string, unknown> {
    return {
      partnerId: this.partnerId,
      partnerName: this.partnerName,
      connectorType: this.connectorType,
      modelName: this.modelName,
      internalApiKey: 'sec_live_ai_***' + this.internalApiKey.slice(-4),
      supportedCountryCodes: this.supportedCountryCodes,
    };
  }
}
