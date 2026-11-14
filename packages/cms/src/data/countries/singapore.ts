import type { CountryVisaGuide } from '../../types/country.js';

export const singaporeGuide: CountryVisaGuide = {
  slug: 'singapore',
  countryName: 'Singapore',
  countryCode: 'SG',
  region: 'Asia Pacific',
  flagEmoji: '🇸🇬',
  tagline: 'Asia’s Premier Global Tech and Financial Hub with COMPASS Scoring',
  summary:
    'Singapore offers merit-based employment and innovation pathways governed by the Ministry of Manpower (MOM). Candidates for the flagship Employment Pass (EP) are evaluated via the Complementarity Assessment Framework (COMPASS) points system, while tech executives and founders can access specialized ONE Pass and Tech.Pass pathways.',
  capital: 'Singapore',
  currency: 'SGD ($)',
  officialLanguage: 'English, Malay, Mandarin, Tamil',
  processingTimeRange: '3 – 8 weeks',
  minimumFundsRequirement:
    'SGD $3,000 – $10,000 liquid reserves (or valid qualifying salary of SGD $5,600+/month)',
  officialPortalUrl: 'https://www.mom.gov.sg/passes-and-permits/employment-pass',
  officialPortalName: 'Ministry of Manpower (MOM) Singapore',
  lastVerifiedAt: '2026-11-01',
  editorialStatus: 'published',
  publishedAt: '2026-11-01T00:00:00Z',
  visaStreams: [
    {
      id: 'sg-ep',
      name: 'Employment Pass (EP)',
      category: 'Skilled Work',
      description:
        'For high-earning foreign professionals, managers, and executives earning at least SGD $5,600/month (SGD $6,200 for financial services) and passing the 40-point COMPASS matrix.',
      processingTime: '3 – 5 weeks',
      minimumFunds: 'SGD $5,600/month qualifying job offer',
      eligibleProfiles: [
        'Software Engineers',
        'Finance Specialists',
        'Tech Product Managers',
        'C-Suite Executives',
      ],
      keyRequirements: [
        'Confirmed job offer from MOM-registered Singapore employer',
        'Passing score of ≥40 points on COMPASS framework (Salary, Qualifications, Diversity, Local Support)',
        'Recognized tertiary degree or accredited professional qualification',
      ],
      highlightTag: 'Most Popular',
    },
    {
      id: 'sg-one-pass',
      name: 'Overseas Networks & Expertise (ONE) Pass',
      category: 'Business & Investor',
      description:
        'A personalized 5-year work pass granting top talent across business, arts, sports, and academia unprecedented employment flexibility to start companies or work concurrently.',
      processingTime: '4 – 8 weeks',
      minimumFunds: 'Fixed monthly salary of at least SGD $30,000 from single employer',
      eligibleProfiles: [
        'Tech Founders',
        'Venture Capitalists',
        'Renowned Researchers',
        'Global Leaders',
      ],
      keyRequirements: [
        'Earn fixed salary of SGD $30,000/month or demonstrate outstanding international achievements',
        'Valid for 5 years with unrestricted multi-company employment',
      ],
      highlightTag: 'Elite Pathway',
    },
    {
      id: 'sg-student',
      name: 'Student’s Pass (Higher Education)',
      category: 'Student Visa',
      description:
        'Issued by the Immigration & Checkpoints Authority (ICA) for full-time degree programs at recognized autonomous universities and polytechnics.',
      processingTime: '2 – 4 weeks',
      minimumFunds: 'SGD $10,000 living expenses guarantee + tuition fees',
      eligibleProfiles: ['Undergraduate Students', 'Master’s Candidates', 'Doctoral Fellows'],
      keyRequirements: [
        'Official acceptance letter from EduTrust-certified Singapore Institute of Higher Learning (IHL)',
        'SOLAR registration number issued by the educational institution',
        'ICA digital medical examination clearance',
      ],
    },
  ],
  documentChecklist: [
    {
      id: 'sg-doc-1',
      title: 'Current Passport with ≥ 6 Months Validity',
      description: 'Clear color scan of biodata page and observation pages.',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'sg-doc-2',
      title: 'Authenticated Degree Certificates & Transcripts',
      description:
        'Educational credentials authenticated via MOM-approved background screening companies (e.g., DataFlow, Veremark).',
      mandatory: true,
      category: 'educational',
      tips: 'MOM strictly requires third-party credential authentication before pass submission.',
    },
    {
      id: 'sg-doc-3',
      title: 'Singapore Employment Contract / Letter of Offer',
      description:
        'Signed letter detailing monthly fixed salary, position title, and employment start date.',
      mandatory: true,
      category: 'professional',
    },
    {
      id: 'sg-doc-4',
      title: 'COMPASS Points Verification Dossier',
      description:
        'Supporting documentation for salary benchmark percentiles and university ranking tier.',
      mandatory: true,
      category: 'professional',
    },
    {
      id: 'sg-doc-5',
      title: 'Comprehensive Curriculum Vitae (CV)',
      description:
        'Detailed work history with employment dates, achievements, and company profiles.',
      mandatory: true,
      category: 'professional',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'Employment Pass (EP)',
      governmentFee: 'SGD $105 application fee + SGD $225 issuance fee',
      biometricsFee: 'SGD $30 (if card replacement needed)',
      notes:
        'Fees are paid online through MOM EP eService by employer or designated employment agency.',
    },
    {
      streamName: 'ONE Pass',
      governmentFee: 'SGD $105 application fee + SGD $225 issuance fee',
      notes: 'Renewable every 5 years subject to salary or commercial activity benchmarks.',
    },
    {
      streamName: 'Student’s Pass',
      governmentFee: 'SGD $45 application fee + SGD $60 issuance fee + SGD $30 entry visa',
      notes: 'Paid directly through ICA e-Services portal.',
    },
  ],
};
