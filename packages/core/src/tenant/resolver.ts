import type { PartnerAgencyProfile, TenantResolutionResult, WhiteLabelBranding } from './types.js';

export const DEFAULT_PLATFORM_BRANDING: WhiteLabelBranding = {
  companyName: 'VisaHobe',
  logoUrl: '/images/visahobe-logo.svg',
  primaryColor: '#0D3B2E',
  accentColor: '#145342',
  supportEmail: 'support@visahobe.com',
  supportPhone: '+880 1800 000 000',
  customDomain: undefined,
  subdomainSlug: undefined,
};

export const DEFAULT_PLATFORM_TENANT_ID = 'tenant-visahobe-platform-hq';

/**
 * Resolves tenant identity and dynamic branding tokens based on incoming HTTP Host header.
 * Conforms to ADR-010 for white-label custom domain and subdomain routing.
 */
export function resolveTenantByHost(
  hostHeader: string | undefined | null,
  agencies: PartnerAgencyProfile[],
  defaultTenantId: string = DEFAULT_PLATFORM_TENANT_ID,
): TenantResolutionResult {
  if (!hostHeader || typeof hostHeader !== 'string') {
    return {
      resolved: true,
      tenantId: defaultTenantId,
      tenantType: 'tier1_platform',
      isWhiteLabel: false,
      branding: DEFAULT_PLATFORM_BRANDING,
      matchedHost: 'localhost',
    };
  }

  // Strip port and normalize
  const normalizedHost = hostHeader.trim().toLowerCase().split(':')[0] ?? '';

  // 1. Exact match against customDomain (e.g. visa.bengaltravel.com)
  for (const agency of agencies) {
    if (agency.status !== 'active') {
      continue;
    }

    if (agency.customDomain && agency.customDomain.toLowerCase() === normalizedHost) {
      return {
        resolved: true,
        tenantId: agency.tenantId,
        tenantType: 'tier2_partner_agency',
        isWhiteLabel: true,
        branding: agency.branding,
        matchedHost: normalizedHost,
        agencyProfile: agency,
      };
    }
  }

  // 2. Subdomain match against subdomainSlug (e.g. bengaltravel.visahobe.com or bengaltravel.localhost)
  const hostParts = normalizedHost.split('.');
  if (hostParts.length >= 2) {
    const candidateSlug = hostParts[0];
    for (const agency of agencies) {
      if (agency.status !== 'active') {
        continue;
      }

      if (agency.subdomainSlug.toLowerCase() === candidateSlug) {
        return {
          resolved: true,
          tenantId: agency.tenantId,
          tenantType: 'tier2_partner_agency',
          isWhiteLabel: true,
          branding: agency.branding,
          matchedHost: normalizedHost,
          agencyProfile: agency,
        };
      }
    }
  }

  // 3. Fallback to Platform HQ Default Tenant
  return {
    resolved: true,
    tenantId: defaultTenantId,
    tenantType: 'tier1_platform',
    isWhiteLabel: false,
    branding: DEFAULT_PLATFORM_BRANDING,
    matchedHost: normalizedHost,
  };
}
