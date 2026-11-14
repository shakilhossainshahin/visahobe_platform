import type { CountryVisaGuide } from '../../types/country.js';

export const canadaGuide: CountryVisaGuide = {
  slug: 'canada',
  countryName: 'Canada',
  countryCode: 'CA',
  region: 'North America',
  flagEmoji: '🇨🇦',
  tagline: 'World-Renowned Permanent Residency and Economic Mobility via Express Entry & PNP',
  summary:
    'Immigration, Refugees and Citizenship Canada (IRCC) operates one of the world’s most transparent economic immigration frameworks. The flagship Express Entry system selects skilled candidates based on the Comprehensive Ranking System (CRS) across Federal Skilled Worker (FSW), Canadian Experience Class (CEC), and targeted category-based selections (STEM, Healthcare, Trades, French).',
  capital: 'Ottawa',
  currency: 'CAD ($)',
  officialLanguage: 'English, French',
  processingTimeRange: '6 – 20 weeks',
  minimumFundsRequirement:
    'CAD $14,690 for single applicant (scaled by family size, waived if working legally in Canada with valid job offer)',
  officialPortalUrl: 'https://www.canada.ca/en/services/immigration-citizenship.html',
  officialPortalName: 'Immigration, Refugees and Citizenship Canada (IRCC)',
  lastVerifiedAt: '2026-11-01',
  editorialStatus: 'published',
  publishedAt: '2026-11-01T00:00:00Z',
  visaStreams: [
    {
      id: 'ca-express-entry',
      name: 'Express Entry (Federal Skilled Worker / STEM Category)',
      category: 'Skilled Work',
      description:
        'Fast-track economic permanent residence for skilled professionals with foreign work experience meeting CRS point cutoffs or targeted trade category selections.',
      processingTime: '6 months standard IRCC processing target',
      minimumFunds: 'CAD $14,690 liquid settlement funds for 1 person (CAD $18,288 for 2)',
      eligibleProfiles: [
        'Software Architects',
        'Data Engineers',
        'Financial Analysts',
        'Healthcare Professionals',
      ],
      keyRequirements: [
        'At least 1 continuous year of skilled work experience in TEER category 0, 1, 2, or 3',
        'Canadian Language Benchmark (CLB) level 7+ in English (IELTS General / CELPIP) or French (TEF / TCF)',
        'Educational Credential Assessment (ECA) report from designated organization (WES, ICAS, CES)',
      ],
      highlightTag: 'Direct Permanent Residency',
    },
    {
      id: 'ca-pnp',
      name: 'Provincial Nominee Program (PNP - Tech & In-Demand)',
      category: 'Skilled Work',
      description:
        'Provinces nominate immigrants with skills tailored to local labor market demands (e.g., BC PNP Tech, Ontario Tech Draws, Alberta Advantage), awarding an instant +600 CRS points.',
      processingTime: '3 – 6 months (Express Entry aligned)',
      minimumFunds: 'Varies by province, typically aligning with LICO benchmarks',
      eligibleProfiles: [
        'IT Developers',
        'Civil Engineers',
        'Agri-Tech Specialists',
        'Trades Supervisors',
      ],
      keyRequirements: [
        'Registration with targeted Provincial Expression of Interest (EOI) stream',
        'Qualifying job offer or profile matching provincial labor market shortage targets',
      ],
      highlightTag: '+600 Points Guarantee',
    },
    {
      id: 'ca-study-permit',
      name: 'Study Permit & Post-Graduation Work Permit (PGWP)',
      category: 'Student Visa',
      description:
        'Permit for studying at a Designated Learning Institution (DLI), leading to an open PGWP of up to 3 years post-graduation with Canadian work rights.',
      processingTime: '8 – 14 weeks',
      minimumFunds: 'CAD $20,635 living cost guarantee + full first-year tuition',
      eligibleProfiles: [
        'Degree Seekers',
        'Postgraduate Certificate Students',
        'Masters & PhD Scholars',
      ],
      keyRequirements: [
        'Official Letter of Acceptance (LOA) with provincial attestation letter (PAL) from registered DLI',
        'Guaranteed Investment Certificate (GIC) or verified bank statements verifying financial capacity',
        'Clean upfront medical exam and biometric registration',
      ],
    },
  ],
  documentChecklist: [
    {
      id: 'ca-doc-1',
      title: 'Valid Passport with Minimum 6 Months Validity',
      description:
        'Clear color scan of all pages containing stamps, visas, or biographical information.',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'ca-doc-2',
      title: 'Educational Credential Assessment (ECA)',
      description: 'Official equivalency report from WES or other IRCC-designated agency.',
      mandatory: true,
      category: 'educational',
      tips: 'ECA reports are valid for 5 years from date of issuance.',
    },
    {
      id: 'ca-doc-3',
      title: 'Official Language Test Results (IELTS / CELPIP / PTE Core)',
      description:
        'General test results showing scores corresponding to CLB 7 or higher; valid for 2 years.',
      mandatory: true,
      category: 'educational',
    },
    {
      id: 'ca-doc-4',
      title: 'Detailed Employment Reference Letters',
      description:
        'Formal letters on employer letterhead indicating specific job duties matching NOC 2021 codes, hours worked, and compensation.',
      mandatory: true,
      category: 'professional',
    },
    {
      id: 'ca-doc-5',
      title: 'Police Clearance Certificates',
      description:
        'Certificates from every country where the applicant has resided for 6+ consecutive months since turning 18.',
      mandatory: true,
      category: 'identity',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'Express Entry Permanent Residence',
      governmentFee: 'CAD $950 processing fee + CAD $575 Right of Permanent Residence Fee (RPRF)',
      biometricsFee: 'CAD $85 per applicant',
      notes: 'RPRF is fully refundable if the application is refused or withdrawn before issuance.',
    },
    {
      streamName: 'Study Permit',
      governmentFee: 'CAD $150 per applicant',
      biometricsFee: 'CAD $85',
    },
  ],
};
