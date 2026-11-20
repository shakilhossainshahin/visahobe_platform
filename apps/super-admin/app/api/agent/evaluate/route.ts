import { SuperAgentProcessor, type ConsularAction } from '@visahobe/agents';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      countryCode?: string;
      confidenceScore?: number;
      applicantData?: {
        fullName?: string;
        passportNumber?: string;
        birthDate?: string;
        nationality?: string;
      };
      actions?: ConsularAction[];
    };

    const countryCode = body.countryCode || 'SG';
    const confidenceScore = typeof body.confidenceScore === 'number' ? body.confidenceScore : 0.98;

    const result = SuperAgentProcessor.processCase({
      caseId: `case-${countryCode.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      tenantId: 'tenant-visahobe-platform-hq',
      destinationCountry: countryCode,
      confidenceScore,
      applicantData: body.applicantData ?? {
        fullName: 'Simulator Applicant',
        passportNumber: 'A12345678',
        birthDate: '1990-01-01',
        nationality: 'BGD',
      },
      actions: body.actions ?? [
        {
          id: 'sim-act-1',
          actionType: 'prepare_draft',
          destinationCountry: countryCode,
          description: 'Draft electronic visa filing',
        },
      ],
    });

    return Response.json({
      success: true,
      evaluation: result.evaluation,
      snapshot: result.snapshot,
      isSubmissionExecuted: result.isSubmissionExecuted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Evaluation error';
    return Response.json({ success: false, error: { message } }, { status: 500 });
  }
}
