import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/intake/route.js';
import { calculateEligibilityScore, type IntakePayload } from '../lib/intake.js';

describe('/api/intake Route & Scoring Engine', () => {
  it('should calculate high probability score for senior profile with job offer', () => {
    const payload: IntakePayload = {
      destinationCountry: 'Singapore',
      visaCategory: 'Skilled Work',
      fullName: 'Dr. Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+8801700000000',
      nationality: 'Bangladesh',
      educationLevel: 'Doctorate / PhD',
      yearsOfExperience: 6,
      hasJobOffer: true,
      hasProofOfFunds: true,
      hasValidPassport: true,
      englishProficiency: 'ielts_7_plus',
    };

    const evaluation = calculateEligibilityScore(payload);
    expect(evaluation.score).toBeGreaterThanOrEqual(80);
    expect(evaluation.tier).toBe('High Probability');
    expect(evaluation.nextSteps.length).toBeGreaterThan(0);
  });

  it('should calculate moderate probability score for mid-level profile', () => {
    const payload: IntakePayload = {
      destinationCountry: 'Germany',
      visaCategory: 'Skilled Migration',
      fullName: 'John Smith',
      email: 'john@example.com',
      phone: '+8801711111111',
      nationality: 'Bangladesh',
      educationLevel: 'Bachelor Degree',
      yearsOfExperience: 3,
      hasJobOffer: false,
      hasProofOfFunds: true,
      hasValidPassport: true,
      englishProficiency: 'ielts_6',
    };

    const evaluation = calculateEligibilityScore(payload);
    expect(evaluation.score).toBeGreaterThanOrEqual(60);
    expect(evaluation.score).toBeLessThan(80);
    expect(evaluation.tier).toBe('Moderate Probability');
  });

  it('should calculate baseline tier when critical qualifications are pending', () => {
    const payload: IntakePayload = {
      destinationCountry: 'Canada',
      visaCategory: 'Student Visa',
      fullName: 'Alex Student',
      email: 'alex@example.com',
      phone: '+8801722222222',
      nationality: 'Bangladesh',
      educationLevel: 'High School',
      yearsOfExperience: 0,
      hasJobOffer: false,
      hasProofOfFunds: false,
      hasValidPassport: false,
      englishProficiency: 'basic',
    };

    const evaluation = calculateEligibilityScore(payload);
    expect(evaluation.score).toBeLessThan(60);
    expect(evaluation.tier).toBe('Requires Supplemental Documentation');
  });

  it('should handle POST request with valid payload and return HTTP 200 with reference ID', async () => {
    const validBody: IntakePayload = {
      destinationCountry: 'United Kingdom',
      visaCategory: 'Skilled Work',
      fullName: 'Shakil Hossain',
      email: 'shakil@example.com',
      phone: '+8801712345678',
      nationality: 'Bangladesh',
      educationLevel: 'Master Degree',
      yearsOfExperience: 5,
      hasJobOffer: true,
      hasProofOfFunds: true,
      hasValidPassport: true,
      englishProficiency: 'ielts_7_plus',
    };

    const request = new Request('https://visahobe.com/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.referenceId).toMatch(/^VH-2026-[A-F0-9]{6}$/);
    expect(data.tier).toBe('High Probability');
    expect(data.destinationCountry).toBe('United Kingdom');
  });

  it('should reject POST request when required fields are missing with HTTP 400', async () => {
    const invalidBody = {
      destinationCountry: 'Singapore',
      // Missing fullName, email, phone, etc.
    };

    const request = new Request('https://visahobe.com/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required field');
  });

  it('should reject invalid email format with HTTP 400', async () => {
    const badEmailBody = {
      destinationCountry: 'Singapore',
      visaCategory: 'Skilled Work',
      fullName: 'Test User',
      email: 'not-an-email',
      phone: '+8801700000000',
      nationality: 'Bangladesh',
      educationLevel: 'Bachelor Degree',
      yearsOfExperience: 2,
    };

    const request = new Request('https://visahobe.com/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badEmailBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email address format.');
  });
});
