import crypto from 'node:crypto';
import { createLogger } from '@visahobe/core';
import { calculateEligibilityScore, type IntakePayload } from '../../../lib/intake.js';

const logger = createLogger({ service: 'website-assessment-api' });

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<IntakePayload & { preferredCurrency?: string }>;

    if (!body.destinationCountry || !body.visaCategory) {
      return Response.json(
        {
          success: false,
          error: 'Destination country and visa category are required for assessment.',
        },
        { status: 400 },
      );
    }

    const payload: IntakePayload = {
      destinationCountry: String(body.destinationCountry).trim(),
      visaCategory: String(body.visaCategory).trim(),
      fullName: String(body.fullName || 'Prospective Applicant').trim(),
      email: String(body.email || 'assessment-lead@visahobe.internal').trim(),
      phone: String(body.phone || '+8801700000000').trim(),
      nationality: String(body.nationality || 'Bangladesh').trim(),
      educationLevel: String(body.educationLevel || "Bachelor's Degree").trim(),
      yearsOfExperience: Number(body.yearsOfExperience) || 3,
      hasJobOffer: Boolean(body.hasJobOffer),
      hasProofOfFunds: Boolean(body.hasProofOfFunds ?? true),
      hasValidPassport: Boolean(body.hasValidPassport ?? true),
      englishProficiency: body.englishProficiency
        ? String(body.englishProficiency).trim()
        : 'intermediate',
    };

    const evaluation = calculateEligibilityScore(payload);
    const referenceId = `VH-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Determine ADR-011 Autonomy Tier
    let autonomyTier:
      'Level 1 (Assisted Draft)' | 'Level 2 (Semi-Autonomous)' | 'Level 3 (Autonomous Submission)';
    const countryLower = payload.destinationCountry.toLowerCase();
    const isStandardElectronic = countryLower.includes('singapore') || countryLower.includes('uae');

    if (isStandardElectronic && evaluation.score >= 80) {
      autonomyTier = 'Level 3 (Autonomous Submission)';
    } else if (evaluation.score >= 60) {
      autonomyTier = 'Level 2 (Semi-Autonomous)';
    } else {
      autonomyTier = 'Level 1 (Assisted Draft)';
    }

    // Dynamic Tariff Schedule (BDT & USD)
    const baseFeeUSD = countryLower.includes('singapore')
      ? 290
      : countryLower.includes('germany')
        ? 340
        : countryLower.includes('uk')
          ? 320
          : countryLower.includes('canada')
            ? 450
            : countryLower.includes('australia')
              ? 420
              : 260;

    const bdtRate = 122;
    const feeSchedule = {
      serviceFeeUSD: baseFeeUSD,
      serviceFeeBDT: Math.round(baseFeeUSD * bdtRate),
      gatewayOptions: [
        {
          id: 'paystation',
          name: 'Pay Station (bKash / Nagad / Cards)',
          currency: 'BDT',
          amount: Math.round(baseFeeUSD * bdtRate),
          badge: 'Zero FX Fees for Bangladesh Applicants',
        },
        {
          id: 'stripe',
          name: 'Stripe International Card Checkout',
          currency: 'USD',
          amount: baseFeeUSD,
          badge: 'Instant Global Currency Settlement',
        },
      ],
    };

    logger.info('Interactive assessment computed', {
      referenceId,
      destinationCountry: payload.destinationCountry,
      visaCategory: payload.visaCategory,
      score: evaluation.score,
      autonomyTier,
    });

    return Response.json(
      {
        success: true,
        referenceId,
        score: evaluation.score,
        tier: evaluation.tier,
        autonomyTier,
        destinationCountry: payload.destinationCountry,
        visaCategory: payload.visaCategory,
        summary: `Preliminary assessment for ${payload.destinationCountry} (${payload.visaCategory}): Score ${evaluation.score}/100. Classified under ${autonomyTier}.`,
        nextSteps: evaluation.nextSteps,
        feeSchedule,
        estimatedProcessingDays: countryLower.includes('uae')
          ? 14
          : countryLower.includes('singapore')
            ? 28
            : 60,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Failed to process assessment', error);
    return Response.json(
      {
        success: false,
        error: 'Assessment processing encountered an unexpected internal error.',
      },
      { status: 500 },
    );
  }
}
