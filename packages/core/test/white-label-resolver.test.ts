import { describe, it, expect } from 'vitest';
import {
  resolveTenantByHost,
  DEFAULT_PLATFORM_BRANDING,
  DEFAULT_PLATFORM_TENANT_ID,
  type PartnerAgencyProfile,
} from '../src/index.js';

describe('White-Label & Custom Domain Tenant Resolver (ADR-010)', () => {
  const mockAgencies: PartnerAgencyProfile[] = [
    {
      id: 'agency-bengal',
      tenantId: 'tenant-agency-bengal-uuid',
      name: 'Bengal Travel & Tours',
      tier: 'tier2_partner_agency',
      status: 'active',
      customDomain: 'visa.bengaltravel.com',
      subdomainSlug: 'bengaltravel',
      branding: {
        companyName: 'Bengal Travel Visa Desk',
        logoUrl: '/agencies/bengal-logo.png',
        primaryColor: '#0A4D3C',
        accentColor: '#126852',
        supportEmail: 'visas@bengaltravel.com',
        supportPhone: '+880 1711 000000',
        customDomain: 'visa.bengaltravel.com',
        subdomainSlug: 'bengaltravel',
      },
      wholesaleDiscountPercentage: 15,
      contactPerson: {
        name: 'Kamal Ahmed',
        email: 'kamal@bengaltravel.com',
        phone: '+880 1711 000000',
      },
      supportedCountries: ['SG', 'MY', 'TH', 'AE'],
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
    },
    {
      id: 'agency-eurovisa',
      tenantId: 'tenant-agency-eurovisa-uuid',
      name: 'EuroVisa Desk GmbH',
      tier: 'tier2_partner_agency',
      status: 'active',
      customDomain: 'portal.eurovisadesk.de',
      subdomainSlug: 'eurovisa',
      branding: {
        companyName: 'EuroVisa Desk Germany',
        logoUrl: '/agencies/eurovisa-logo.png',
        primaryColor: '#0E3A2F',
        accentColor: '#1A5A4A',
        supportEmail: 'kontakt@eurovisadesk.de',
        customDomain: 'portal.eurovisadesk.de',
        subdomainSlug: 'eurovisa',
      },
      wholesaleDiscountPercentage: 20,
      contactPerson: {
        name: 'Klaus Schmidt',
        email: 'schmidt@eurovisadesk.de',
      },
      supportedCountries: ['DE', 'AT', 'CH'],
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
    },
    {
      id: 'agency-suspended',
      tenantId: 'tenant-agency-suspended-uuid',
      name: 'Suspended Travel Agency',
      tier: 'tier2_partner_agency',
      status: 'suspended',
      customDomain: 'visa.suspended.com',
      subdomainSlug: 'suspended',
      branding: {
        companyName: 'Suspended Agency',
        logoUrl: '/agencies/suspended.png',
        primaryColor: '#990000',
        accentColor: '#CC0000',
        supportEmail: 'help@suspended.com',
      },
      wholesaleDiscountPercentage: 0,
      contactPerson: {
        name: 'John Doe',
        email: 'john@suspended.com',
      },
      supportedCountries: ['US'],
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
    },
  ];

  it('resolves active partner agency by exact custom domain (case-insensitive and stripping port)', () => {
    const res = resolveTenantByHost('VISA.BENGALTRAVEL.COM:3000', mockAgencies);
    expect(res.resolved).toBe(true);
    expect(res.isWhiteLabel).toBe(true);
    expect(res.tenantType).toBe('tier2_partner_agency');
    expect(res.tenantId).toBe('tenant-agency-bengal-uuid');
    expect(res.branding.companyName).toBe('Bengal Travel Visa Desk');
    expect(res.branding.primaryColor).toBe('#0A4D3C');
    expect(res.matchedHost).toBe('visa.bengaltravel.com');
  });

  it('resolves active partner agency by platform subdomain slug', () => {
    const res = resolveTenantByHost('eurovisa.visahobe.com', mockAgencies);
    expect(res.resolved).toBe(true);
    expect(res.isWhiteLabel).toBe(true);
    expect(res.tenantType).toBe('tier2_partner_agency');
    expect(res.tenantId).toBe('tenant-agency-eurovisa-uuid');
    expect(res.branding.companyName).toBe('EuroVisa Desk Germany');
  });

  it('falls back to Platform HQ default tenant for standard domains', () => {
    const res = resolveTenantByHost('visahobe.com', mockAgencies);
    expect(res.resolved).toBe(true);
    expect(res.isWhiteLabel).toBe(false);
    expect(res.tenantType).toBe('tier1_platform');
    expect(res.tenantId).toBe(DEFAULT_PLATFORM_TENANT_ID);
    expect(res.branding.primaryColor).toBe(DEFAULT_PLATFORM_BRANDING.primaryColor);
  });

  it('ignores suspended agency domains and falls back to platform default', () => {
    const res = resolveTenantByHost('visa.suspended.com', mockAgencies);
    expect(res.resolved).toBe(true);
    expect(res.isWhiteLabel).toBe(false);
    expect(res.tenantId).toBe(DEFAULT_PLATFORM_TENANT_ID);
  });

  it('gracefully handles missing or empty host header', () => {
    const res = resolveTenantByHost(null, mockAgencies);
    expect(res.resolved).toBe(true);
    expect(res.isWhiteLabel).toBe(false);
    expect(res.tenantId).toBe(DEFAULT_PLATFORM_TENANT_ID);
  });
});
