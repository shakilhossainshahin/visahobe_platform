import type { CountryVisaGuide } from '../../types/country.js';

export const germanyGuide: CountryVisaGuide = {
  slug: 'germany',
  countryName: 'Germany',
  countryCode: 'DE',
  region: 'Europe',
  flagEmoji: '🇩🇪',
  tagline: 'Europe’s Industrial & Technological Engine with EU Blue Card & Chancenkarte',
  summary:
    'Germany’s Skilled Immigration Act provides fast-track settlement for university graduates and qualified professionals. The EU Blue Card offers minimum salary thresholds (€45,300, or €41,041 for shortage occupations), while the Opportunity Card (Chancenkarte) enables job-seekers to enter Germany on a points-based system without a prior job contract.',
  capital: 'Berlin',
  currency: 'EUR (€)',
  officialLanguage: 'German',
  processingTimeRange: '4 – 12 weeks',
  minimumFundsRequirement:
    '€1,027/month in a German Blocked Account (Sperrkonto) or qualifying German job offer',
  officialPortalUrl: 'https://www.make-it-in-germany.com/en/',
  officialPortalName: 'Make it in Germany (Federal Government Portal)',
  lastVerifiedAt: '2026-11-01',
  editorialStatus: 'published',
  publishedAt: '2026-11-01T00:00:00Z',
  visaStreams: [
    {
      id: 'de-blue-card',
      name: 'EU Blue Card (Blaue Karte EU)',
      category: 'Skilled Work',
      description:
        'Streamlined work and residence permit for academics and IT specialists with a binding job offer meeting statutory gross annual income thresholds.',
      processingTime: '4 – 8 weeks',
      minimumFunds: 'Gross annual salary of €41,041 (MINT / STEM shortage) or €45,300 (general)',
      eligibleProfiles: [
        'Software Architects',
        'Data Scientists',
        'Mechanical Engineers',
        'Biochemists',
      ],
      keyRequirements: [
        'Recognized higher education degree (verified via anabin database or ZAB Statement of Comparability)',
        'Binding German employment contract for at least 6 months duration',
        'Statutory minimum gross salary requirement satisfied',
      ],
      highlightTag: 'Fast-Track PR in 21 Months',
    },
    {
      id: 'de-chancenkarte',
      name: 'Opportunity Card (Chancenkarte)',
      category: 'Skilled Work',
      description:
        'Points-based job search opportunity card allowing candidates with at least 6 points to live in Germany for up to 1 year while seeking qualified employment.',
      processingTime: '6 – 10 weeks',
      minimumFunds:
        '€12,324 in a recognized blocked account (€1,027/month) or secondary employment contract',
      eligibleProfiles: [
        'Young Professionals',
        'Skilled Tradespeople',
        'Polytechnic Diploma Holders',
      ],
      keyRequirements: [
        'Recognized vocational qualification or university degree',
        'Basic German language skills (A1) or English proficiency (B2)',
        'Minimum 6 points achieved across qualification, age, language, and German ties',
      ],
      highlightTag: 'No Job Offer Required',
    },
    {
      id: 'de-student',
      name: 'National Visa for Study (Visum zur Studienaufnahme)',
      category: 'Student Visa',
      description:
        'For students admitted to a German public or state-recognized university, offering full university access with 140 full or 280 half days per year work allowance.',
      processingTime: '6 – 12 weeks',
      minimumFunds: '€11,904 in a German blocked account (Sperrkonto)',
      eligibleProfiles: ['Bachelor Students', 'Master Candidates', 'Doctoral Researchers'],
      keyRequirements: [
        'Unconditional admission letter (Zulassungsbescheid) from a German institution of higher learning',
        'Proof of financial resources via blocked account (e.g. Expatrio, Fintiba, Coracle)',
        'Statutory or comprehensive incoming travel health insurance coverage',
      ],
    },
  ],
  documentChecklist: [
    {
      id: 'de-doc-1',
      title: 'Valid Passport & Biometric Passport Photos',
      description:
        'Passport valid for at least 12 months beyond intended stay, issued within the last 10 years, and biometric photos meeting ICAO standards.',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'de-doc-2',
      title: 'Anabin / ZAB Degree Recognition Statement',
      description:
        'Printout from the German Anabin database proving university status H+ and degree equivalence, or official ZAB Statement of Comparability.',
      mandatory: true,
      category: 'educational',
      tips: 'Ensure both the university and the specific degree program are listed as equivalent.',
    },
    {
      id: 'de-doc-3',
      title: 'Declaration of Employment (Erklärung zum Beschäftigungsverhältnis)',
      description:
        'Standardized Federal Employment Agency (Bundesagentur für Arbeit) form completed and signed by German employer.',
      mandatory: true,
      category: 'professional',
    },
    {
      id: 'de-doc-4',
      title: 'Proof of Blocked Account (Sperrkonto)',
      description:
        'Official confirmation letter from a licensed provider holding the required maintenance reserve.',
      mandatory: true,
      category: 'financial',
    },
    {
      id: 'de-doc-5',
      title: 'Incoming Health Insurance Coverage',
      description:
        'Travel health insurance valid until enrollment in statutory German statutory sickness fund (GKV).',
      mandatory: true,
      category: 'health',
    },
  ],
  officialFeeSummary: [
    {
      streamName: 'National Long-Stay Visa (Type D)',
      governmentFee: '€75 standard consular fee (adults)',
      notes:
        'Payable at German Embassy / VFS Global Visa Application Centre during biometrics appointment.',
    },
    {
      streamName: 'Foreigners Authority (Ausländerbehörde) Residence Permit',
      governmentFee: '€100 – €110 on local issuance in Germany',
      notes: 'Paid locally at municipal foreign registration bureau upon arrival.',
    },
  ],
};
