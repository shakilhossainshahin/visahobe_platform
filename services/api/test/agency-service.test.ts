import { describe, it, expect, beforeEach } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import {
  AgencyService,
  AgencyConflictError,
  AgencyNotFoundError,
  BENGAL_AGENCY_TENANT_ID,
  EUROVISA_AGENCY_TENANT_ID,
  type CreateAgencyInput,
} from '../src/agencies/agency-service.js';
import { WalletService } from '../src/wallet/wallet-service.js';

describe('B2B Partner Agency Onboarding & White-Label Service (ADR-010)', () => {
  const staffSession: UserSession = {
    userId: 'staff-admin-01',
    email: 'admin@visahobe.com',
    tenantId: 'tenant-visahobe-platform-hq',
    role: 'admin',
    isMfaVerified: true,
    aal: 'aal2',
    claims: { sub: 'staff-admin-01', role: 'admin', aal: 'aal2' },
  };

  const agencySession: UserSession = {
    userId: 'agency-user-bengal',
    email: 'agent@bengaltravel.com',
    tenantId: BENGAL_AGENCY_TENANT_ID,
    role: 'agency_manager',
    isMfaVerified: true,
    aal: 'aal2',
    claims: {
      sub: 'agency-user-bengal',
      tenant_id: BENGAL_AGENCY_TENANT_ID,
      role: 'agency_manager',
    },
  };

  beforeEach(() => {
    AgencyService.clear();
  });

  it('onboards a new B2B Partner Agency and automatically provisions a prepaid wallet', async () => {
    const input: CreateAgencyInput = {
      name: 'Pacific Sky Tours',
      subdomainSlug: 'pacificsky',
      customDomain: 'visa.pacificsky.com',
      wholesaleDiscountPercentage: 18,
      contactPerson: {
        name: 'Rashid Chowdhury',
        email: 'rashid@pacificsky.com',
        phone: '+880 1819 000000',
      },
      supportedCountries: ['SG', 'MY', 'TH'],
      initialBalance: 2500,
      currency: 'USD',
      branding: {
        companyName: 'Pacific Sky Visa Center',
        logoUrl: '/agencies/pacific-logo.png',
        primaryColor: '#0C4A34',
        accentColor: '#165B43',
        supportEmail: 'visas@pacificsky.com',
      },
    };

    const res = await AgencyService.onboardAgency(staffSession, input);
    expect(res.agency.name).toBe('Pacific Sky Tours');
    expect(res.agency.subdomainSlug).toBe('pacificsky');
    expect(res.agency.tier).toBe('tier2_partner_agency');
    expect(res.agency.branding.primaryColor).toBe('#0C4A34');

    // Wallet provisioned with initial balance
    const wallet = await WalletService.getWallet(staffSession, res.agency.tenantId);
    expect(wallet.id).toBe(res.walletId);
    expect(wallet.balance).toBe(2500);
    expect(wallet.isLowBalance).toBe(false);
  });

  it('prevents onboarding when subdomain slug conflicts with existing agency', async () => {
    const input: CreateAgencyInput = {
      name: 'Bengal Duplicate',
      subdomainSlug: 'bengaltravel', // Conflict with default seeded agency
      contactPerson: { name: 'Test', email: 'test@test.com' },
      supportedCountries: ['SG'],
    };

    await expect(AgencyService.onboardAgency(staffSession, input)).rejects.toThrow(
      AgencyConflictError,
    );
  });

  it('resolves white-label tenant and dynamic branding tokens by custom domain and subdomain', () => {
    // 1. Exact custom domain
    const domainMatch = AgencyService.resolveTenantByHost('visa.bengaltravel.com');
    expect(domainMatch.isWhiteLabel).toBe(true);
    expect(domainMatch.tenantId).toBe(BENGAL_AGENCY_TENANT_ID);
    expect(domainMatch.branding.companyName).toBe('Bengal Travel Visa Desk');

    // 2. Subdomain
    const subMatch = AgencyService.resolveTenantByHost('eurovisa.visahobe.com');
    expect(subMatch.isWhiteLabel).toBe(true);
    expect(subMatch.tenantId).toBe(EUROVISA_AGENCY_TENANT_ID);

    // 3. Fallback
    const fallback = AgencyService.resolveTenantByHost('visahobe.com');
    expect(fallback.isWhiteLabel).toBe(false);
    expect(fallback.tenantId).toBe('tenant-visahobe-platform-hq');
  });

  it('restricts non-staff users from viewing other partner agencies', async () => {
    // Bengal agency staff querying EuroVisa agency
    await expect(AgencyService.getAgency(agencySession, 'agn-eurovisa-desk')).rejects.toThrow(
      AgencyNotFoundError,
    );

    // Bengal agency staff querying own agency succeeds
    const ownAgency = await AgencyService.getAgency(agencySession, 'agn-bengal-travel');
    expect(ownAgency.name).toBe('Bengal Travel & Tours');
  });
});
