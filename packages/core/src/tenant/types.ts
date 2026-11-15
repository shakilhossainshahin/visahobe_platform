export type TenantTier = 'tier1_platform' | 'tier2_partner_agency' | 'tier3_end_applicant';

export interface WhiteLabelBranding {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone?: string | undefined;
  customDomain?: string | undefined;
  subdomainSlug?: string | undefined;
}

export interface PartnerAgencyContact {
  name: string;
  email: string;
  phone?: string | undefined;
}

export interface PartnerAgencyProfile {
  id: string;
  tenantId: string;
  name: string;
  tier: 'tier2_partner_agency';
  status: 'active' | 'suspended' | 'pending_verification';
  customDomain?: string | undefined;
  subdomainSlug: string;
  branding: WhiteLabelBranding;
  wholesaleDiscountPercentage: number;
  contactPerson: PartnerAgencyContact;
  supportedCountries: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TenantResolutionResult {
  resolved: boolean;
  tenantId: string;
  tenantType: TenantTier;
  isWhiteLabel: boolean;
  branding: WhiteLabelBranding;
  matchedHost: string;
  agencyProfile?: PartnerAgencyProfile | undefined;
}
