import type { CountryVisaGuide } from '../../types/country.js';

export const unitedKingdomGuide: CountryVisaGuide = {
  slug: 'united-kingdom',
  countryName: 'United Kingdom',
  countryCode: 'GB',
  region: 'Europe',
  flagEmoji: '🇬🇧',
  tagline: 'Global Leader in Financial Services, Research, and Tech with Points-Based Immigration',
  summary:
    'The UK Points-Based Immigration System allows skilled workers with an approved Home Office sponsor to secure residence and work permits. Applicants require 70 points across job offer sponsorship, skill level (RQF 3+), English fluency (CEFR B1), and relevant salary thresholds (£38,700 standard, or discounted for shortage lists and new entrants).',
  capital: 'London',
  currency: 'GBP (£)',
  officialLanguage: 'English',
  processingTimeRange: '3 – 8 weeks',
  minimumFundsRequirement:
    '£1,270 in personal bank account for 28 consecutive days (unless A-rated sponsor certifies maintenance)',
  officialPortalUrl: 'https://www.gov.uk/skilled-worker-visa',
  officialPortalName: 'GOV.UK Visas and Immigration (UKVI)',
  lastVerifiedAt: '2026-11-01',
  editorialStatus: 'published',
  publishedAt: '2026-11-01T00:00:00Z',
  visaStreams: [
    {
      id: 'uk-skilled-worker',
      name: 'Skilled Worker Visa',
      category: 'Skilled Work',
      description:
        'The primary work visa for international specialists with an eligible job offer from a Home Office licensed sponsor, qualifying salary, and English proficiency.',
      processingTime: '3 weeks (priority 5 working days available)',
      minimumFunds:
        '£38,700/year minimum salary (or going rate for occupation code, with new entrant discounts down to £30,960)',
      eligibleProfiles: [
        'Cloud Engineers',
        'Physicians & Healthcare Specialists',
        'Actuaries',
        'Product Leaders',
      ],
      keyRequirements: [
        'Valid Certificate of Sponsorship (CoS) reference number from an approved licensed sponsor',
        'Job role on eligible Standard Occupational Classification (SOC) list at RQF level 3 or above',
        'English language proficiency at level B1 on CEFR scale (via SELT exam or Ecctis degree verification)',
      ],
      highlightTag: 'Path to Settlement (ILR) in 5 Years',
    },
    {
      id: 'uk-global-talent',
      name: 'Global Talent Visa',
      category: 'Business & Investor',
      description:
        'For leaders or potential leaders in academia or research, arts and culture, or digital technology, offering complete employer independence.',
      processingTime: '3 – 8 weeks',
      minimumFunds: 'No specific minimum salary or maintenance funds threshold',
      eligibleProfiles: [
        'Senior Tech Leaders',
        'Pioneering AI Researchers',
        'Founders',
        'Fellowship Recipients',
      ],
      keyRequirements: [
        'Endorsement from an approved endorsing body (Tech Nation / Founders Forum, The Royal Society, British Academy)',
        'Demonstrated track record of innovation or breakthrough commercial/academic impact',
      ],
      highlightTag: 'No Job Offer / Fast Track ILR in 3 Years',
    },
    {
      id: 'uk-student',
      name: 'Student Visa (formerly Tier 4)',
      category: 'Student Visa',
      description:
        'For individuals aged 16+ accepted on a course of higher education by a licensed student sponsor, granting up to 20 hours/week term-time work rights and Graduate route eligibility.',
      processingTime: '3 weeks',
      minimumFunds:
        'Tuition fees + £1,334/month (inside London) or £1,023/month (outside London) for up to 9 months',
      eligibleProfiles: ['University Undergraduates', 'Taught Master’s Students', 'PhD Candidates'],
      keyRequirements: [
        'Confirmation of Acceptance for Studies (CAS) issued by UK sponsor institution',
        'SELT or institution-assessed CEFR B2 English certificate',
        'Proof of financial capability held for 28 consecutive days',
      ],
    },
  ],
  documentChecklist: [
    {
      id: 'uk-doc-1',
      title: 'Valid Passport with Blank Visa Page',
      description:
        'Original passport with at least one blank page on both sides for visa vignette (or digital immigration status via UK Immigration ID Check app).',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'uk-doc-2',
      title: 'Certificate of Sponsorship (CoS)',
      description:
        'Electronic CoS reference provided by UK employer detailing salary, SOC code, and role duration.',
      mandatory: true,
      category: 'professional',
    },
    {
      id: 'uk-doc-3',
      title: 'English Language Test Results (SELT / Ecctis)',
      description:
        'Secure English Language Test (IELTS for UKVI, PTE Academic UKVI) or Ecctis verification of English-taught degree.',
      mandatory: true,
      category: 'educational',
    },
    {
      id: 'uk-doc-4',
      title: 'Tuberculosis (TB) Test Certificate',
      description:
        'Medical certificate from an approved clinic for applicants from designated countries applying for stays longer than 6 months.',
      mandatory: true,
      category: 'health',
    },
    {
      id: 'uk-doc-5',
      title: 'Criminal Record Certificate',
      description:
        'Police clearance certificate for specific sensitive occupation codes (healthcare, education, social care).',
      mandatory: false,
      category: 'identity',
      tips: 'Required only for specified occupation codes worked in the last 10 years.',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'Skilled Worker Visa (Up to 3 Years)',
      governmentFee: '£719 per applicant (or £551 for Immigration Salary List roles)',
      biometricsFee: '£19.20 (if appointment needed at VFS/TLS)',
      healthcareSurcharge: '£1,035 per year (Immigration Health Surcharge - IHS)',
      notes: 'IHS provides full access to the UK National Health Service (NHS).',
    },
    {
      streamName: 'Student Visa',
      governmentFee: '£490 per applicant',
      healthcareSurcharge: '£776 per year of study (discounted student IHS rate)',
    },
  ],
};
