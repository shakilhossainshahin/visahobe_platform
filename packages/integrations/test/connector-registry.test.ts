import * as crypto from 'node:crypto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  PartnerConnectorRegistry,
  DirectAutonomousAIConnector,
  ExternalPartnerConnector,
  type PartnerCaseSubmissionPayload,
} from '../src/index.js';

describe('Dynamic Partner Connector Registry & Autonomy Routing (ADR-011)', () => {
  let registry: PartnerConnectorRegistry;

  beforeEach(() => {
    registry = new PartnerConnectorRegistry();
  });

  const baseCasePayload: PartnerCaseSubmissionPayload = {
    caseId: 'case-sg-test-001',
    caseNumber: 'VH-2026-SG-001',
    tenantId: 'tenant-agency-bengal',
    countryCode: 'SG',
    serviceType: 'tourist_evisa',
    applicant: {
      fullName: 'Tahmid Khan',
      passportNumberRedacted: 'A0987****',
      nationality: 'Bangladesh',
      email: 'tahmid@example.com',
      phone: '+8801700000000',
    },
    documentUrls: [
      {
        category: 'identity_passport',
        fileName: 'passport.pdf',
        signedUrl: 'https://s3.internal/passport.pdf',
      },
      { category: 'photo', fileName: 'photo.jpg', signedUrl: 'https://s3.internal/photo.jpg' },
    ],
  };

  it('routes standard direct electronic visa countries to Direct Autonomous AI Connector', () => {
    const connector = registry.resolveConnectorForCase('SG', 'tourist_evisa');
    expect(connector.connectorType).toBe('direct_ai');
    expect(connector.partnerId).toBe('DIRECT-AI-DEFAULT');
  });

  it('routes specialized legal jurisdictions to External Partner Law Firm connector', () => {
    const connectorUk = registry.resolveConnectorForCase('GB', 'skilled_worker');
    expect(connectorUk.connectorType).toBe('partner_agency');
    expect(connectorUk.partnerId).toBe('PARTNER-UK-LEGAL');

    const connectorDe = registry.resolveConnectorForCase('DE', 'chancenkarte');
    expect(connectorDe.connectorType).toBe('partner_agency');
    expect(connectorDe.partnerId).toBe('PARTNER-DE-DESK');
  });

  it('evaluates Level 3 autonomous dispatch when confidence is >= 0.95 on Direct AI connector', async () => {
    const directAi = new DirectAutonomousAIConnector();
    const result = await directAi.dispatchCase(baseCasePayload);

    expect(result.success).toBe(true);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.requiresReview).toBe(false);
    expect(result.status).toBe('submitted');
    expect(result.externalReference).toContain('AI-DIR-SG');
  });

  it('halts at Level 2 Verifier Review Gate when confidence is < 0.95 due to incomplete documents', async () => {
    const directAi = new DirectAutonomousAIConnector();
    const incompletePayload: PartnerCaseSubmissionPayload = {
      ...baseCasePayload,
      documentUrls: [], // Missing passport and photo
    };

    const result = await directAi.dispatchCase(incompletePayload);
    expect(result.success).toBe(true);
    expect(result.confidenceScore).toBeLessThan(0.95);
    expect(result.requiresReview).toBe(true);
    expect(result.status).toBe('in_review');
    expect(result.message).toContain('below autonomous threshold (0.95)');
  });

  it('dispatches cases to external partner law firm and tracks partner references', async () => {
    const ukConnector = registry.getConnector('PARTNER-UK-LEGAL');
    expect(ukConnector).toBeDefined();

    const ukPayload: PartnerCaseSubmissionPayload = {
      ...baseCasePayload,
      countryCode: 'GB',
      serviceType: 'skilled_worker',
    };

    const result = await ukConnector!.dispatchCase(ukPayload);
    expect(result.success).toBe(true);
    expect(result.status).toBe('dispatched_to_partner');
    expect(result.externalReference).toContain('PARTNER-UK-LEGAL-GB');
  });

  it('verifies valid HMAC webhook signature on external partner connector and rejects tampering', async () => {
    const webhookSecret = 'test_secret_wh_123';
    const partner = new ExternalPartnerConnector({
      partnerId: 'PARTNER-TEST',
      partnerName: 'Test Partner Law LLP',
      endpointUrl: 'https://test.internal',
      apiKey: 'test_key',
      webhookSecret,
      supportedCountryCodes: ['US'],
      supportedServiceTypes: ['b1_b2'],
    });

    const body = JSON.stringify({
      eventType: 'case.status_changed',
      externalReference: 'PARTNER-TEST-US-991',
      status: 'embassy_interview_booked',
    });

    const validSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    const event = await partner.handleWebhook(body, validSignature);
    expect(event.eventType).toBe('case.status_changed');
    expect(event.externalReference).toBe('PARTNER-TEST-US-991');

    // Tampered payload
    await expect(partner.handleWebhook(body + 'tampered', validSignature)).rejects.toThrow(
      'Partner webhook signature mismatch',
    );
  });

  it('strictly masks credentials in partner configurations to prevent secret leaks', () => {
    const partner = new ExternalPartnerConnector({
      partnerId: 'PARTNER-TEST',
      partnerName: 'Test Partner Law LLP',
      endpointUrl: 'https://test.internal',
      apiKey: 'super_secret_partner_api_key_8842',
      webhookSecret: 'super_secret_webhook_key_1122',
      supportedCountryCodes: ['US'],
      supportedServiceTypes: ['b1_b2'],
    });

    const config = partner.getMaskedConfig();
    expect(config['apiKey']).toBe('sec_partner_***8842');
    expect(config['webhookSecret']).toBe('sec_wh_***1122');
    expect(JSON.stringify(config)).not.toContain('super_secret_partner_api_key_8842');
  });
});
