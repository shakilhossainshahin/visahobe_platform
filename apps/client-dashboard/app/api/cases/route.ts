import { createLogger } from '@visahobe/core';

const logger = createLogger({ service: 'client-dashboard-cases-api' });

export async function GET(): Promise<Response> {
  try {
    const activeCase = {
      caseId: 'VH-2026-SG-4921',
      country: 'Singapore',
      stream: 'Employment Pass (COMPASS Tier 1)',
      countryCode: 'SG',
      status: 'in_progress',
      currentStage: 2,
      totalStages: 5,
      currentStageTitle: 'AI & Specialist Document Audit',
      applicant: {
        fullName: 'Tanvir Ahmed',
        nationality: 'Bangladesh',
        role: 'Senior Software Architect',
      },
      assignedSpecialist: {
        name: 'Sarah Jenkins',
        title: 'Senior Immigration Specialist',
        registration: 'MOM Registered #EP-8842',
      },
      compassScoring: {
        pointsAchieved: 50,
        passMark: 40,
        criteria: [
          { name: 'C1 Salary Benchmark', points: 20, status: 'verified' },
          { name: 'C2 Qualifications (BSc CS)', points: 20, status: 'verified' },
          { name: 'C3 Diversity', points: 10, status: 'verified' },
          { name: 'C4 Support for Local Employment', points: 0, status: 'neutral' },
        ],
      },
      targetSubmissionDate: '2026-12-15',
      requiredActions: [
        {
          id: 'action-bank-statement',
          title: 'Upload Recent Bank Statement (Last 6 Months)',
          dueDate: '2026-11-22',
          urgency: 'high',
          status: 'pending_upload',
        },
      ],
      milestones: [
        { id: 1, title: 'Intake Submitted', status: 'completed', date: '2026-11-02' },
        { id: 2, title: 'AI & Specialist Document Audit', status: 'current', date: '2026-11-20' },
        { id: 3, title: 'Embassy File Preparation', status: 'upcoming', date: '2026-11-28' },
        {
          id: 4,
          title: 'Biometrics & Consular Submission',
          status: 'upcoming',
          date: '2026-12-05',
        },
        { id: 5, title: 'Decision & Pass Issuance', status: 'upcoming', date: '2026-12-15' },
      ],
    };

    logger.info('Active client case fetched', {
      caseId: activeCase.caseId,
      currentStage: activeCase.currentStage,
    });

    return Response.json(
      {
        success: true,
        case: activeCase,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    logger.error(
      'Failed to retrieve active client case',
      error instanceof Error ? error : new Error(String(error)),
    );
    return Response.json(
      {
        success: false,
        error: 'Failed to retrieve active applicant case details',
      },
      { status: 500 },
    );
  }
}
