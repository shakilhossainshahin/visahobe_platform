import { describe, it, expect } from 'vitest';
import { GET as getCountries } from '../app/api/countries/route.js';
import { POST as postAssessment } from '../app/api/assessment/route.js';

describe('Website Dynamic API Routes (TICKET-P5-003)', () => {
  it('GET /api/countries returns published country guides with fees and streams', async () => {
    const response = await getCountries();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(6);
    expect(Array.isArray(data.countries)).toBe(true);

    const singapore = data.countries.find((c: { slug: string }) => c.slug === 'singapore');
    expect(singapore).toBeDefined();
    expect(singapore.flag).toBe('🇸🇬');
    expect(singapore.autonomySupport).toBe('Level 3');
    expect(singapore.baseFeeUSD).toBeGreaterThan(0);
    expect(singapore.baseFeeBDT).toBeGreaterThan(0);
  });

  it('POST /api/assessment calculates dynamic score, autonomy tier, and fee schedule', async () => {
    const payload = {
      destinationCountry: 'Singapore',
      visaCategory: 'Skilled Work',
      fullName: 'Tahmid Khan',
      email: 'tahmid@example.com',
      educationLevel: "Master's Degree",
      yearsOfExperience: 6,
      hasJobOffer: true,
      hasProofOfFunds: true,
      hasValidPassport: true,
      englishProficiency: 'fluent',
    };

    const request = new Request('http://localhost:3000/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await postAssessment(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.referenceId).toMatch(/^VH-2026-[A-F0-9]{6}$/);
    expect(data.score).toBeGreaterThanOrEqual(80);
    expect(data.autonomyTier).toBe('Level 3 (Autonomous Submission)');
    expect(data.feeSchedule.gatewayOptions).toHaveLength(2);
    expect(data.feeSchedule.gatewayOptions[0].id).toBe('paystation');
    expect(data.feeSchedule.gatewayOptions[1].id).toBe('stripe');
  });

  it('POST /api/assessment rejects missing destination country', async () => {
    const request = new Request('http://localhost:3000/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await postAssessment(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });
});
