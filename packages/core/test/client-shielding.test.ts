import { describe, expect, it } from 'vitest';
import {
  ClientShieldingService,
  RawMcpAccessForbiddenError,
  type CasePayloadInput,
  type IntakeAssessmentInput,
} from '../src/security/shielding/index.js';
import { DEFAULT_PLATFORM_BRANDING } from '../src/tenant/resolver.js';

describe('B2C Client Shielding Layer (ADR-012)', () => {
  it('resolves client tier correctly based on host, role, and white-label context', () => {
    // Internal staff
    expect(ClientShieldingService.resolveClientTier({ userRole: 'super_admin' })).toBe(
      'internal_staff',
    );
    expect(ClientShieldingService.resolveClientTier({ userRole: 'case_manager' })).toBe(
      'internal_staff',
    );

    // B2B2C Partner white-label host
    expect(
      ClientShieldingService.resolveClientTier({
        host: 'visa.bengaltravel.com',
        isWhiteLabel: true,
      }),
    ).toBe('b2b2c_partner');

    // B2C Retail platform native host
    expect(
      ClientShieldingService.resolveClientTier({
        host: 'visahobe.com',
        isWhiteLabel: false,
        userRole: 'client',
      }),
    ).toBe('b2c_retail');
  });

  it('shields case payload for B2C retail applicant: strips wholesale margin, partner ID, casework notes and agent internals', () => {
    const rawCase: CasePayloadInput = {
      id: 'case-sg-001',
      caseNumber: 'VH-2026-SG-001',
      tenantId: 'tenant-bengal-01',
      clientId: 'usr-client-01',
      countryCode: 'SG',
      serviceType: 'Employment Pass',
      status: 'specialist_review',
      wholesaleCost: 250,
      wholesaleDiscountPercentage: 15,
      agencyMarkup: 80,
      partnerAgencyId: 'agn-bengal-travel',
      partnerAgencyName: 'Bengal Travel & Tours',
      internalCaseworkNotes: 'Applicant needs to clarify job title discrepancy with MoM',
      agentConfidenceScore: 0.94,
      agentAutonomyLevel: 'level_2_semi_autonomous',
      agentAuditHash: 'a1b2c3d4e5f6',
      metadata: {
        wholesale: 250,
        discount: 15,
        internalNotes: 'Flagged for review',
        applicantPhone: '+8801700000000',
      },
    };

    const shielded = ClientShieldingService.shieldCaseRecord(rawCase, 'b2c_retail');

    expect(shielded['caseNumber']).toBe('VH-2026-SG-001');
    expect(shielded['wholesaleCost']).toBeUndefined();
    expect(shielded['wholesaleDiscountPercentage']).toBeUndefined();
    expect(shielded['agencyMarkup']).toBeUndefined();
    expect(shielded['partnerAgencyId']).toBeUndefined();
    expect(shielded['partnerAgencyName']).toBeUndefined();
    expect(shielded['internalCaseworkNotes']).toBeUndefined();
    expect(shielded['agentConfidenceScore']).toBeUndefined();
    expect(shielded['agentAutonomyLevel']).toBeUndefined();
    expect(shielded['agentAuditHash']).toBeUndefined();

    const meta = shielded['metadata'] as Record<string, unknown>;
    expect(meta['wholesale']).toBeUndefined();
    expect(meta['discount']).toBeUndefined();
    expect(meta['internalNotes']).toBeUndefined();
    expect(meta['applicantPhone']).toBe('+8801700000000');
  });

  it('shields case payload for B2B2C partner client: preserves agency context but hides platform base cost', () => {
    const rawCase: CasePayloadInput = {
      id: 'case-ae-002',
      caseNumber: 'VH-2026-AE-002',
      tenantId: 'tenant-bengal-01',
      partnerAgencyId: 'agn-bengal-travel',
      wholesaleCost: 180,
      wholesaleDiscountPercentage: 20,
      agencyMarkup: 50,
      internalCaseworkNotes: 'Internal verification note',
      agentConfidenceScore: 0.98,
    };

    const shielded = ClientShieldingService.shieldCaseRecord(rawCase, 'b2b2c_partner', {
      callerTenantId: 'tenant-bengal-01',
    });

    expect(shielded['partnerAgencyId']).toBe('agn-bengal-travel');
    expect(shielded['agencyMarkup']).toBe(50);
    expect(shielded['wholesaleCost']).toBeUndefined();
    expect(shielded['wholesaleDiscountPercentage']).toBeUndefined();
    expect(shielded['internalCaseworkNotes']).toBeUndefined();
    expect(shielded['agentConfidenceScore']).toBeUndefined();
  });

  it('shields intake assessment: strips wholesale fees and enforces default branding for retail', () => {
    const rawAssessment: IntakeAssessmentInput = {
      referenceId: 'VH-ASSESS-1234',
      destinationCountry: 'Singapore',
      visaCategory: 'Tourist',
      score: 95,
      tier: 'High Probability',
      recommendedPathways: ['Standard Tourist e-Visa'],
      retailFee: 120,
      wholesaleFee: 75,
      partnerAgencyDiscount: 20,
      internalConfidenceScore: 0.96,
      caseworkRoutingNotes: 'Automated approval route',
      branding: {
        companyName: 'Custom Partner Desk',
        logoUrl: '/partner.png',
        primaryColor: '#000000',
        accentColor: '#111111',
        supportEmail: 'partner@test.com',
      },
    };

    const shieldedRetail = ClientShieldingService.shieldIntakeAssessment(
      rawAssessment,
      'b2c_retail',
    );
    expect(shieldedRetail['wholesaleFee']).toBeUndefined();
    expect(shieldedRetail['partnerAgencyDiscount']).toBeUndefined();
    expect(shieldedRetail['internalConfidenceScore']).toBeUndefined();
    expect(shieldedRetail['caseworkRoutingNotes']).toBeUndefined();
    expect(shieldedRetail['branding']).toEqual(DEFAULT_PLATFORM_BRANDING);

    const shieldedPartner = ClientShieldingService.shieldIntakeAssessment(
      rawAssessment,
      'b2b2c_partner',
    );
    expect(shieldedPartner['wholesaleFee']).toBeUndefined();
    expect(shieldedPartner['branding']).toEqual(rawAssessment.branding);
  });

  it('asserts that retail applicants cannot access raw MCP endpoints', () => {
    expect(() => ClientShieldingService.assertNoRawMcpAccess('b2c_retail')).toThrow(
      RawMcpAccessForbiddenError,
    );
    expect(() => ClientShieldingService.assertNoRawMcpAccess('b2b2c_partner')).not.toThrow();
    expect(() => ClientShieldingService.assertNoRawMcpAccess('internal_staff')).not.toThrow();
  });
});
