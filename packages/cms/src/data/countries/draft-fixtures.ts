import type { CountryVisaGuide } from '../../types/country.js';

export const newZealandDraftGuide: CountryVisaGuide = {
  slug: 'new-zealand',
  countryName: 'New Zealand',
  countryCode: 'NZ',
  region: 'Oceania',
  flagEmoji: '🇳🇿',
  tagline: 'Skilled Migrant Category (SMC) Points System and Green List Pathways',
  summary:
    'Draft policy overview for New Zealand immigration. Currently undergoing internal legal and consular review.',
  capital: 'Wellington',
  currency: 'NZD ($)',
  officialLanguage: 'English, Māori',
  processingTimeRange: '4 – 8 months',
  minimumFundsRequirement: 'NZD $15,000 settlement liquidity',
  officialPortalUrl: 'https://www.immigration.govt.nz/',
  officialPortalName: 'Immigration New Zealand (INZ)',
  lastVerifiedAt: '2026-11-10',
  editorialStatus: 'draft',
  reviewNotes: 'Awaiting updated Green List Tier 1 fast-track salary verification for 2027.',
  visaStreams: [
    {
      id: 'nz-smc',
      name: 'Skilled Migrant Category Resident Visa (SMC)',
      category: 'Skilled Work',
      description: 'Points-based resident visa for skilled workers.',
      processingTime: '6 – 9 months',
      minimumFunds: 'Job offer with median wage NZD $31.61/hr',
      eligibleProfiles: ['Civil Engineers', 'Software Developers'],
      keyRequirements: ['6 points from qualification, registered occupation, or high income'],
    },
  ],
  documentChecklist: [
    {
      id: 'nz-doc-1',
      title: 'Valid Passport',
      description: 'Bio-data page scan',
      mandatory: true,
      category: 'identity',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'SMC Resident Visa',
      governmentFee: 'NZD $4,290',
    },
  ],
};

export const japanInReviewGuide: CountryVisaGuide = {
  slug: 'japan',
  countryName: 'Japan',
  countryCode: 'JP',
  region: 'Asia Pacific',
  flagEmoji: '🇯🇵',
  tagline: 'Highly Skilled Professional (HSP) and Specially Designated Skilled Worker (SSW)',
  summary: 'Japan policy pack currently undergoing final editorial and consular sign-off.',
  capital: 'Tokyo',
  currency: 'JPY (¥)',
  officialLanguage: 'Japanese',
  processingTimeRange: '1 – 3 months',
  minimumFundsRequirement: 'Annual qualifying salary of ¥3,000,000+ for Engineer status',
  officialPortalUrl: 'https://www.isa.go.jp/en/',
  officialPortalName: 'Immigration Services Agency of Japan',
  lastVerifiedAt: '2026-11-12',
  editorialStatus: 'in_review',
  reviewNotes: 'Pending review by licensed Japanese administrative scrivener (Gyoseishoshi).',
  visaStreams: [
    {
      id: 'jp-hsp',
      name: 'Highly Skilled Professional (HSP (i)(b))',
      category: 'Skilled Work',
      description:
        'Points-based preferential immigration treatment for advanced tech and business talent.',
      processingTime: '1 – 2 months',
      minimumFunds: '¥4,000,000+ guaranteed salary for technical specialists',
      eligibleProfiles: ['AI Researchers', 'Software Engineers'],
      keyRequirements: ['70+ points on points matrix (academic, professional, salary)'],
    },
  ],
  documentChecklist: [
    {
      id: 'jp-doc-1',
      title: 'Certificate of Eligibility (COE)',
      description: 'COE issued by Regional Immigration Bureau in Japan.',
      mandatory: true,
      category: 'professional',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'Work Visa (Single Entry)',
      governmentFee: '¥3,000 consular issuance fee',
    },
  ],
};
