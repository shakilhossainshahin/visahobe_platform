export interface GlobeDestination {
  id: string;
  name: string;
  countryCode: string;
  flag: string;
  slug: string;
  lat: number;
  lng: number;
  category: string;
  processingTime: string;
  approvalRate: string;
  autonomyLevel:
    'Level 1: Assisted Draft' | 'Level 2: Semi-Autonomous' | 'Level 3: Autonomous e-Visa';
  govFee: string;
  serviceFee: string;
  fastestRoute: string;
  requirementsSummary: string;
}

export interface GlobeOriginCity {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

export const DEFAULT_ORIGIN_CITY: GlobeOriginCity = {
  name: 'Dhaka',
  code: 'DAC',
  lat: 23.8103,
  lng: 90.4125,
};

export const STANDARD_GLOBE_DESTINATIONS: GlobeDestination[] = [
  {
    id: 'singapore',
    name: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    slug: 'singapore',
    lat: 1.3521,
    lng: 103.8198,
    category: 'Employment Pass (COMPASS)',
    processingTime: '3-8 Weeks',
    approvalRate: '99.4%',
    autonomyLevel: 'Level 3: Autonomous e-Visa',
    govFee: 'S$360 MOM Lodgment',
    serviceFee: '$290 Platform',
    fastestRoute: 'Direct MOM EP eService Submission',
    requirementsSummary: 'Degree + S$5,600+ Salary + COMPASS 40 Points',
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    slug: 'uae',
    lat: 23.4241,
    lng: 53.8478,
    category: '10-Year Golden Visa',
    processingTime: '2-4 Weeks',
    approvalRate: '99.6%',
    autonomyLevel: 'Level 3: Autonomous e-Visa',
    govFee: 'AED 3,700 ICP Fee',
    serviceFee: '$260 Platform',
    fastestRoute: 'ICP Direct Electronic Fast-Track',
    requirementsSummary: 'Executive, Specialized Talent or Property Investor',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    slug: 'united-kingdom',
    lat: 55.3781,
    lng: -3.436,
    category: 'Skilled Worker & Global Talent',
    processingTime: '4-8 Weeks',
    approvalRate: '99.1%',
    autonomyLevel: 'Level 2: Semi-Autonomous',
    govFee: '£719 UKVI + IHS',
    serviceFee: '$320 Platform',
    fastestRoute: 'UKVI Priority Decision Pathway',
    requirementsSummary: 'Approved Sponsor CoS + B2 English + Salary Threshold',
  },
  {
    id: 'germany',
    name: 'Germany / Schengen',
    countryCode: 'DE',
    flag: '🇩🇪',
    slug: 'germany',
    lat: 51.1657,
    lng: 10.4515,
    category: 'EU Blue Card & Opportunity Card',
    processingTime: '6-12 Weeks',
    approvalRate: '98.8%',
    autonomyLevel: 'Level 2: Semi-Autonomous',
    govFee: '€100 Embassy Fee',
    serviceFee: '$340 Platform',
    fastestRoute: 'Anabin H+ Pre-Verified Fast-Track',
    requirementsSummary: 'Recognized Degree + Verified Job Offer / Opportunity Card',
  },
  {
    id: 'canada',
    name: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    slug: 'canada',
    lat: 56.1304,
    lng: -106.3468,
    category: 'Express Entry (FSW) & PNP',
    processingTime: '12-24 Weeks',
    approvalRate: '98.3%',
    autonomyLevel: 'Level 1: Assisted Draft',
    govFee: 'C$1,525 IRCC Fee',
    serviceFee: '$450 Platform',
    fastestRoute: 'CRS Optimized Category-Based Draw',
    requirementsSummary: 'ECA Assessment + IELTS 7+ + Comprehensive CRS Points',
  },
  {
    id: 'australia',
    name: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    slug: 'australia',
    lat: -25.2744,
    lng: 133.7751,
    category: 'Subclass 189 / 190 / 482',
    processingTime: '8-20 Weeks',
    approvalRate: '98.6%',
    autonomyLevel: 'Level 1: Assisted Draft',
    govFee: 'A$4,770 DHA Fee',
    serviceFee: '$420 Platform',
    fastestRoute: 'SkillSelect EOI State Nomination',
    requirementsSummary: 'Positive Skills Assessment + 65+ Points Criteria',
  },
  {
    id: 'usa',
    name: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    slug: 'usa',
    lat: 37.0902,
    lng: -95.7129,
    category: 'B1/B2, F-1 & H-1B Consular Filing',
    processingTime: '4-12 Weeks',
    approvalRate: '97.9%',
    autonomyLevel: 'Level 2: Semi-Autonomous',
    govFee: '$185 DS-160 MRV Fee',
    serviceFee: '$280 Platform',
    fastestRoute: 'DS-160 AI Form Pre-Fill + Slot Monitor',
    requirementsSummary: 'Valid Passport + Strong Ties Evidence + Financial Solvency',
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    countryCode: 'MY',
    flag: '🇲🇾',
    slug: 'malaysia',
    lat: 4.2105,
    lng: 101.9758,
    category: 'Malaysia Digital Nomad (DE Rantau)',
    processingTime: '2-4 Weeks',
    approvalRate: '99.5%',
    autonomyLevel: 'Level 3: Autonomous e-Visa',
    govFee: 'MYR 1,000 MDEC Fee',
    serviceFee: '$220 Platform',
    fastestRoute: 'MDEC Direct Digital Pass Portal',
    requirementsSummary: 'Remote Work Contract + $24,000 Annual Proof of Income',
  },
  {
    id: 'thailand',
    name: 'Thailand',
    countryCode: 'TH',
    flag: '🇹🇭',
    slug: 'thailand',
    lat: 15.87,
    lng: 100.9925,
    category: 'Destination Thailand Visa (DTV)',
    processingTime: '1-3 Weeks',
    approvalRate: '99.7%',
    autonomyLevel: 'Level 3: Autonomous e-Visa',
    govFee: 'THB 10,000 Consular Fee',
    serviceFee: '$190 Platform',
    fastestRoute: 'Thai e-Visa Official Portal Lodgment',
    requirementsSummary: '500,000 THB Financial Asset Proof + Remote Employment',
  },
  {
    id: 'turkey',
    name: 'Turkey',
    countryCode: 'TR',
    flag: '🇹🇷',
    slug: 'turkey',
    lat: 38.9637,
    lng: 35.2433,
    category: 'Electronic Visa (e-Visa)',
    processingTime: '24-48 Hours',
    approvalRate: '99.8%',
    autonomyLevel: 'Level 3: Autonomous e-Visa',
    govFee: '$50 MoFA e-Visa Fee',
    serviceFee: '$75 Platform',
    fastestRoute: 'Turkish MoFA Automated Instant Dispatch',
    requirementsSummary: 'Valid Supporting Visa / Schengen / UK / US Entry Proof',
  },
];

export interface InteractiveVisaGlobeProps {
  destinations?: GlobeDestination[];
  selectedDestinationId?: string;
  onSelectDestination?: (destination: GlobeDestination) => void;
  className?: string;
  enableInteractiveSearch?: boolean;
  originCity?: GlobeOriginCity;
  showIntelligenceCard?: boolean;
}
