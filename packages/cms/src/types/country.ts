/**
 * @visahobe/cms - Country Visa Guide & Content Schemas
 */

export type EditorialStatus = 'draft' | 'in_review' | 'published';

export type Region =
  'Asia Pacific' | 'Europe' | 'North America' | 'Middle East' | 'Oceania' | 'Global';

export type VisaCategory =
  | 'Skilled Work'
  | 'Student Visa'
  | 'Business & Investor'
  | 'Family & Dependent'
  | 'Tourist & Visit';

export type DocumentCategory = 'identity' | 'financial' | 'professional' | 'educational' | 'health';

export interface DocumentChecklistItem {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  category: DocumentCategory;
  tips?: string | undefined;
}

export interface VisaStream {
  id: string;
  name: string;
  category: VisaCategory;
  description: string;
  processingTime: string;
  minimumFunds: string;
  eligibleProfiles: string[];
  keyRequirements: string[];
  highlightTag?: string | undefined;
}

export interface OfficialFeeItem {
  streamName: string;
  governmentFee: string;
  biometricsFee?: string | undefined;
  healthcareSurcharge?: string | undefined;
  notes?: string | undefined;
}

export interface CountryVisaGuide {
  slug: string;
  countryName: string;
  countryCode: string;
  region: Region;
  flagEmoji: string;
  tagline: string;
  summary: string;
  capital: string;
  currency: string;
  officialLanguage: string;
  processingTimeRange: string;
  minimumFundsRequirement: string;
  officialPortalUrl: string;
  officialPortalName: string;
  visaStreams: VisaStream[];
  documentChecklist: DocumentChecklistItem[];
  officialFeeSummary: OfficialFeeItem[];
  lastVerifiedAt: string; // ISO 8601 date, e.g. "2026-11-01"
  editorialStatus: EditorialStatus;
  publishedAt?: string | undefined;
  reviewNotes?: string | undefined;
}
