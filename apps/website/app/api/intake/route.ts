import crypto from 'node:crypto';
import { createLogger } from '@visahobe/core';
import {
  calculateEligibilityScore,
  type IntakePayload,
  type IntakeAssessmentResult,
} from '../../../lib/intake.js';

const logger = createLogger({ service: 'website-intake-api' });

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<IntakePayload>;

    // Field validations
    const requiredFields = [
      'destinationCountry',
      'visaCategory',
      'fullName',
      'email',
      'phone',
      'nationality',
      'educationLevel',
    ] as const;

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === '') {
        return Response.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email!)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid email address format.',
        },
        { status: 400 },
      );
    }

    const payload: IntakePayload = {
      destinationCountry: String(body.destinationCountry).trim(),
      visaCategory: String(body.visaCategory).trim(),
      fullName: String(body.fullName).trim(),
      email: String(body.email).trim(),
      phone: String(body.phone).trim(),
      nationality: String(body.nationality).trim(),
      educationLevel: String(body.educationLevel).trim(),
      yearsOfExperience: Number(body.yearsOfExperience) || 0,
      hasJobOffer: Boolean(body.hasJobOffer),
      hasProofOfFunds: Boolean(body.hasProofOfFunds),
      hasValidPassport: Boolean(body.hasValidPassport),
      englishProficiency: body.englishProficiency
        ? String(body.englishProficiency).trim()
        : undefined,
    };

    const referenceId = `VH-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const evaluation = calculateEligibilityScore(payload);

    // Defense-in-depth logging: uses @visahobe/core logger which automatically redacts PII
    logger.info('Visa intake questionnaire evaluated successfully', {
      referenceId,
      destinationCountry: payload.destinationCountry,
      visaCategory: payload.visaCategory,
      nationality: payload.nationality,
      score: evaluation.score,
      tier: evaluation.tier,
      // Metadata passed to logger - PII redactor will mask email & phone
      applicantEmail: payload.email,
      applicantPhone: payload.phone,
    });

    const result: IntakeAssessmentResult = {
      success: true,
      referenceId,
      score: evaluation.score,
      tier: evaluation.tier,
      destinationCountry: payload.destinationCountry,
      visaCategory: payload.visaCategory,
      summary: `Preliminary assessment for ${payload.destinationCountry} ${payload.visaCategory} completed. Your profile indicates a ${evaluation.tier} (${evaluation.score}/100 points).`,
      nextSteps: evaluation.nextSteps,
    };

    return Response.json(result, { status: 200 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Failed to process visa intake submission', error);

    return Response.json(
      {
        success: false,
        error: 'An unexpected internal error occurred while processing your evaluation.',
      },
      { status: 500 },
    );
  }
}
