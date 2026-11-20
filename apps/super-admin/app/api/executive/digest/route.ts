export async function GET(): Promise<Response> {
  const todayDateStr = new Date().toISOString().slice(0, 10);

  const digest = {
    digestId: `digest-${todayDateStr.replace(/-/g, '')}`,
    generatedAt: new Date().toISOString(),
    reportingPeriod: `${todayDateStr} 00:00:00 UTC to ${new Date().toISOString()}`,
    totalActiveCases: 82,
    casesByStatus: {
      draft: 14,
      intake_submitted: 18,
      specialist_review: 28,
      consular_filing: 22,
      decision_issued: 35,
      closed: 51,
    },
    autonomyMetrics: {
      level1AssistedDraftCount: 14,
      level2SemiAutonomousCount: 28,
      level3AutonomousSubmissionCount: 19,
      autonomyRatio: 0.311,
      averageConfidenceScore: 0.924,
    },
    safetyMetrics: {
      totalBlockedActions: 7,
      breakdown: {
        portal_payment: 3,
        schedule_biometrics: 3,
        sign_perjury_affidavit: 1,
      },
      interventionsRequiringSignOff: [
        {
          caseId: 'case-ae-4091',
          caseNumber: 'VH-2026-AE-4091',
          destinationCountry: 'AE',
          blockedAction: 'portal_payment',
          reason: 'Autonomous live fee payment blocked; requires human financial authorization.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          caseId: 'case-gb-1082',
          caseNumber: 'VH-2026-GB-1082',
          destinationCountry: 'GB',
          blockedAction: 'schedule_biometrics',
          reason: 'Biometric VAC booking blocked; requires human staff appointment verification.',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          caseId: 'case-us-8831',
          caseNumber: 'VH-2026-US-8831',
          destinationCountry: 'US',
          blockedAction: 'sign_perjury_affidavit',
          reason:
            'Statutory DS-160 perjury declaration blocked; requires applicant direct signature.',
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        },
      ],
    },
    lowBalanceAgencies: [
      {
        tenantId: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
        agencyName: 'Bengal Travel & Tours',
        contactEmail: 'agent@bengaltravel.com',
        balance: 420.0,
        currency: 'USD',
        threshold: 500.0,
        isCritical: false,
      },
    ],
    slaBreachAlerts: [
      {
        caseId: 'case-de-2041',
        caseNumber: 'VH-2026-DE-2041',
        destinationCountry: 'DE',
        status: 'specialist_review',
        hoursInCurrentStatus: 52,
        slaLimitHours: 48,
        severity: 'critical',
      },
      {
        caseId: 'case-ca-9102',
        caseNumber: 'VH-2026-CA-9102',
        destinationCountry: 'CA',
        status: 'intake_submitted',
        hoursInCurrentStatus: 44,
        slaLimitHours: 48,
        severity: 'warning',
      },
    ],
  };

  return Response.json({
    success: true,
    data: digest,
  });
}
