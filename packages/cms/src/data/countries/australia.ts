import type { CountryVisaGuide } from '../../types/country.js';

export const australiaGuide: CountryVisaGuide = {
  slug: 'australia',
  countryName: 'Australia',
  countryCode: 'AU',
  region: 'Oceania',
  flagEmoji: '🇦🇺',
  tagline: 'High Quality of Life and Points-Tested General Skilled Migration (GSM)',
  summary:
    'The Department of Home Affairs manages Australia’s General Skilled Migration (GSM) program, granting direct permanent residence through Subclass 189 (Independent) and Subclass 190 (Nominated). In addition, the Employer Nomination Scheme (Subclass 186) and Temporary Skill Shortage (Subclass 482 / Skills in Demand) provide robust corporate sponsorship routes.',
  capital: 'Canberra',
  currency: 'AUD ($)',
  officialLanguage: 'English',
  processingTimeRange: '3 – 9 months',
  minimumFundsRequirement:
    'AUD $5,000 – $20,000 settlement liquidity (higher for state nomination requirements)',
  officialPortalUrl: 'https://immi.homeaffairs.gov.au/',
  officialPortalName: 'Department of Home Affairs Australia',
  lastVerifiedAt: '2026-11-01',
  editorialStatus: 'published',
  publishedAt: '2026-11-01T00:00:00Z',
  visaStreams: [
    {
      id: 'au-subclass-189',
      name: 'Skilled Independent Visa (Subclass 189)',
      category: 'Skilled Work',
      description:
        'A points-tested permanent visa for skilled workers who are not sponsored by an employer, a state or territory, or a family member. Grants unconditional work and residence rights.',
      processingTime: '5 – 9 months',
      minimumFunds: 'Sufficient funds to cover relocation and initial living expenses',
      eligibleProfiles: [
        'Software Engineers',
        'Cyber Security Experts',
        'Civil Engineers',
        'Registered Nurses',
      ],
      keyRequirements: [
        'Occupation on Medium and Long-term Strategic Skills List (MLTSSL)',
        'Positive skills assessment from designated authority (ACS, Engineers Australia, VETASSESS)',
        'Score at least 65 points on points test (age, English, qualifications, Australian/overseas work)',
        'Competent English (IELTS 6.0 minimum across each band, Proficient English grants +10 points)',
      ],
      highlightTag: 'Direct Unconditional PR',
    },
    {
      id: 'au-subclass-190',
      name: 'Skilled Nominated Visa (Subclass 190)',
      category: 'Skilled Work',
      description:
        'State or territory nominated permanent visa awarding an extra 5 points toward your GSM points test score, in exchange for a commitment to live and work in the nominating state for 2 years.',
      processingTime: '6 – 10 months',
      minimumFunds: 'State-dependent (e.g. AUD $10,000 – $35,000 liquidity for onshore/offshore)',
      eligibleProfiles: [
        'Biomedical Scientists',
        'Construction Managers',
        'Teachers',
        'IT Business Analysts',
      ],
      keyRequirements: [
        'Nomination by an Australian state or territory government agency',
        'Submission of Expression of Interest (EOI) through SkillSelect',
        'Commitment to reside in the nominating state for first 2 years of PR',
      ],
      highlightTag: '+5 Points State Boost',
    },
    {
      id: 'au-subclass-500',
      name: 'Student Visa (Subclass 500)',
      category: 'Student Visa',
      description:
        'Allows international students to participate in an eligible course of study in Australia, with 48 hours per fortnight work rights during study sessions.',
      processingTime: '4 – 8 weeks',
      minimumFunds: 'AUD $29,710/year living cost proof + 1 year tuition fees + return airfare',
      eligibleProfiles: [
        'Undergraduate Students',
        'Masters Candidates',
        'Research Higher Degree Fellows',
      ],
      keyRequirements: [
        'Confirmation of Enrolment (CoE) from CRICOS-registered Australian university or college',
        'Genuine Student (GS) criterion assessment satisfaction',
        'Overseas Student Health Cover (OSHC) valid for intended period of stay',
      ],
    },
  ],
  documentChecklist: [
    {
      id: 'au-doc-1',
      title: 'Current Passport with Valid Bio-Data',
      description: 'Clear color copy of passport identification page.',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'au-doc-2',
      title: 'Positive Skills Assessment Outcome Letter',
      description:
        'Formal outcome letter from authorized skills assessing body (e.g. Australian Computer Society, Engineers Australia).',
      mandatory: true,
      category: 'professional',
      tips: 'Skills assessments typically take 8-12 weeks and are valid for 3 years.',
    },
    {
      id: 'au-doc-3',
      title: 'English Language Test Results',
      description:
        'PTE Academic or IELTS test report form dated within 3 years of invitation to apply.',
      mandatory: true,
      category: 'educational',
    },
    {
      id: 'au-doc-4',
      title: 'Australian & Overseas Police Clearances',
      description:
        'National Police Certificate (AFP) and overseas penal clearances for all countries lived in for 12+ months.',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'au-doc-5',
      title: 'Department Panel Physician Health Examination',
      description:
        'Bupa Medical Visa Services (eMedical) clearance (chest x-ray, medical check, HIV/Hepatitis screening).',
      mandatory: true,
      category: 'health',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'General Skilled Migration (Subclass 189 / 190)',
      governmentFee: 'AUD $4,770 main applicant fee + AUD $2,385 adult dependent fee',
      biometricsFee: 'AUD $50 – $100 per applicant where required',
      notes:
        'Fee is paid via ImmiAccount upon lodgement of the formal visa application after invitation.',
    },
    {
      streamName: 'Student Visa (Subclass 500)',
      governmentFee: 'AUD $1,600 main applicant fee',
    },
  ],
};
