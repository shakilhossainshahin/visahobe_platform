import type { CountryVisaGuide } from '../../types/country.js';

export const uaeGuide: CountryVisaGuide = {
  slug: 'uae',
  countryName: 'United Arab Emirates',
  countryCode: 'AE',
  region: 'Middle East',
  flagEmoji: '🇦🇪',
  tagline: 'Tax-Free Global Crossroads with 10-Year Golden Visa & Green Residence',
  summary:
    'The Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) and Dubai’s General Directorate of Residency and Foreigners Affairs (GDRFA) issue long-term self-sponsored residency. High earners, tech talent, and investors can obtain 10-year Golden Visas or 5-year Green Visas without local corporate sponsor constraints.',
  capital: 'Abu Dhabi',
  currency: 'AED (د.إ)',
  officialLanguage: 'Arabic (English universally used in commerce)',
  processingTimeRange: '1 – 4 weeks',
  minimumFundsRequirement:
    'AED 30,000/month basic salary for Golden Visa or AED 15,000/month for Green Residence',
  officialPortalUrl: 'https://smartservices.icp.gov.ae/',
  officialPortalName: 'ICP Smart Services UAE / GDRFA Dubai',
  lastVerifiedAt: '2026-11-01',
  editorialStatus: 'published',
  publishedAt: '2026-11-01T00:00:00Z',
  visaStreams: [
    {
      id: 'uae-golden-visa-specialists',
      name: '10-Year Golden Visa (Skilled Professionals & Coders)',
      category: 'Skilled Work',
      description:
        'A long-term renewable 10-year residency for top professionals earning at least AED 30,000/month, as well as AI/software coders recognized under the National Program for Coders.',
      processingTime: '1 – 3 weeks',
      minimumFunds: 'AED 30,000/month basic salary or verified professional portfolio',
      eligibleProfiles: [
        'Lead Software Engineers',
        'Physicians',
        'Fintech Specialists',
        'University Professors',
      ],
      keyRequirements: [
        'Valid employment contract in UAE classified at occupational level 1 or 2 by MOHRE',
        'Bachelor’s degree or higher attested by UAE Ministry of Foreign Affairs (MOFA)',
        'Salary certificate showing monthly salary of at least AED 30,000, supported by 6 months bank statements',
      ],
      highlightTag: '10-Year Self-Sponsored',
    },
    {
      id: 'uae-green-visa',
      name: '5-Year Green Visa (Skilled Employees & Freelancers)',
      category: 'Skilled Work',
      description:
        'A 5-year residency pass for freelancers and skilled employees that operates without employer sponsorship, providing up to a 6-month grace period after permit expiry.',
      processingTime: '1 – 2 weeks',
      minimumFunds: 'AED 15,000/month monthly salary or annual freelance earnings equivalent',
      eligibleProfiles: [
        'Consultants',
        'Independent Developers',
        'Digital Media Creators',
        'Specialized Contractors',
      ],
      keyRequirements: [
        'Freelance / self-employment permit from MOHRE or local free zone authority',
        'Bachelor’s degree or specialized diploma attested by UAE authorities',
      ],
      highlightTag: '5-Year Independent',
    },
    {
      id: 'uae-golden-investor',
      name: '10-Year Golden Visa (Real Estate & Business Investors)',
      category: 'Business & Investor',
      description:
        'For investors purchasing real estate worth at least AED 2,000,000 (including mortgaged properties with local bank approval) or establishing a business with equivalent capital.',
      processingTime: '2 – 4 weeks',
      minimumFunds: 'AED 2,000,000 equity in property or commercial investment',
      eligibleProfiles: ['Property Investors', 'Venture Capitalists', 'Business Founders'],
      keyRequirements: [
        'Title deed issued by Dubai Land Department (DLD) or respective emirate land authority for AED 2M+ valuation',
        'Valid UAE health insurance plan',
      ],
      highlightTag: 'Zero Personal Tax',
    },
  ],
  documentChecklist: [
    {
      id: 'ae-doc-1',
      title: 'Valid Passport with Minimum 6 Months Validity',
      description: 'Clear color copy of passport information page.',
      mandatory: true,
      category: 'identity',
    },
    {
      id: 'ae-doc-2',
      title: 'MOFA-Attested Educational Credentials',
      description:
        'Degree certificate verified by home country foreign affairs and attested by UAE Embassy + UAE Ministry of Foreign Affairs.',
      mandatory: true,
      category: 'educational',
      tips: 'Attestation process can be expedited through authorized consular legalisation agencies.',
    },
    {
      id: 'ae-doc-3',
      title: 'MOHRE Employment Contract & Salary Certificate',
      description:
        'Official Ministry of Human Resources and Emiratisation contract verifying job title classification and compensation.',
      mandatory: true,
      category: 'professional',
    },
    {
      id: 'ae-doc-4',
      title: 'Six Months Bank Statements with Salary Transfer (WPS)',
      description:
        'Stamped official bank statements demonstrating regular deposit of qualifying salary.',
      mandatory: true,
      category: 'financial',
    },
    {
      id: 'ae-doc-5',
      title: 'UAE Medical Fitness Test & Emirates ID Biometrics',
      description:
        'Blood test and chest X-ray completed at an accredited UAE preventive health center.',
      mandatory: true,
      category: 'health',
    },
  ],
  officialFeeSummary: [
    {
      streamName: '10-Year Golden Visa',
      governmentFee:
        'AED 2,800 – AED 3,800 (including entry permit, medical test, and Emirates ID)',
      notes:
        'Issued directly through ICP / GDRFA with zero annual renewal fees during the 10-year term.',
    },
    {
      streamName: '5-Year Green Visa',
      governmentFee: 'AED 2,280 total governmental issuance fee',
    },
  ],
};
