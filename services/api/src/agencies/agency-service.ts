import { assertPermission, type UserSession } from '@visahobe/auth';
import {
  resolveTenantByHost as coreResolveTenantByHost,
  type PartnerAgencyProfile,
  type TenantResolutionResult,
  type WhiteLabelBranding,
} from '@visahobe/core';
import { AuditService } from '../audit/audit-service.js';
import { WalletService, type WalletCurrency } from '../wallet/wallet-service.js';

export interface CreateAgencyInput {
  name: string;
  subdomainSlug: string;
  customDomain?: string | undefined;
  wholesaleDiscountPercentage?: number | undefined;
  contactPerson: {
    name: string;
    email: string;
    phone?: string | undefined;
  };
  supportedCountries: string[];
  initialBalance?: number | undefined;
  currency?: WalletCurrency | undefined;
  branding?: Partial<WhiteLabelBranding> | undefined;
}

export const BENGAL_AGENCY_TENANT_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
export const EUROVISA_AGENCY_TENANT_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
export const GULF_AGENCY_TENANT_ID = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';

export class AgencyNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'AGENCY_NOT_FOUND';

  constructor(agencyId: string) {
    super(`Partner agency with identifier '${agencyId}' was not found.`);
    this.name = 'AgencyNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AgencyConflictError extends Error {
  readonly statusCode = 409;
  readonly code = 'AGENCY_SLUG_CONFLICT';

  constructor(slug: string) {
    super(`An agency with subdomain slug '${slug}' already exists.`);
    this.name = 'AgencyConflictError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AgencyService {
  private static agencies: Map<string, PartnerAgencyProfile> = new Map();

  constructor() {
    AgencyService.ensureDefaultAgencies();
  }

  public static seedAgency(agency: PartnerAgencyProfile): void {
    AgencyService.agencies.set(agency.id, agency);
  }

  public static clear(): void {
    AgencyService.agencies.clear();
    AgencyService.ensureDefaultAgencies();
  }

  /**
   * Onboards a new B2B Partner Travel Agency (Tier 2 SaaS Tenant)
   */
  public static async onboardAgency(
    session: UserSession,
    input: CreateAgencyInput,
  ): Promise<{ agency: PartnerAgencyProfile; walletId: string }> {
    // Only staff / platform administrators can onboard new partner travel agencies
    if (!['owner', 'admin', 'case_manager'].includes(session.role)) {
      assertPermission(session, 'case.update');
    }

    const normalizedSlug = input.subdomainSlug.trim().toLowerCase();

    // Check slug collision
    for (const a of AgencyService.agencies.values()) {
      if (a.subdomainSlug === normalizedSlug) {
        throw new AgencyConflictError(normalizedSlug);
      }
    }

    const tenantId = `tenant-agency-${normalizedSlug}-${Date.now().toString(36)}`;
    const agencyId = `agn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const branding: WhiteLabelBranding = {
      companyName: input.branding?.companyName || input.name,
      logoUrl: input.branding?.logoUrl || '/agencies/default-logo.svg',
      primaryColor: input.branding?.primaryColor || '#0D3B2E',
      accentColor: input.branding?.accentColor || '#145342',
      supportEmail: input.branding?.supportEmail || input.contactPerson.email,
      supportPhone: input.branding?.supportPhone || input.contactPerson.phone,
      customDomain: input.customDomain,
      subdomainSlug: normalizedSlug,
    };

    const agency: PartnerAgencyProfile = {
      id: agencyId,
      tenantId,
      name: input.name,
      tier: 'tier2_partner_agency',
      status: 'active',
      customDomain: input.customDomain,
      subdomainSlug: normalizedSlug,
      branding,
      wholesaleDiscountPercentage: input.wholesaleDiscountPercentage ?? 10,
      contactPerson: input.contactPerson,
      supportedCountries: input.supportedCountries,
      createdAt: now,
      updatedAt: now,
    };

    AgencyService.agencies.set(agencyId, agency);

    // Initialize partner agency prepaid wallet
    const wallet = await WalletService.createWallet(
      tenantId,
      input.currency ?? 'USD',
      input.initialBalance ?? 0,
    );

    // Audit log
    await AuditService.recordLog(session, {
      action: 'agency.onboard',
      entityType: 'partner_agency',
      entityId: agencyId,
      newValues: {
        name: input.name,
        tenantId,
        customDomain: input.customDomain,
        initialBalance: input.initialBalance ?? 0,
      },
      details: `New B2B Partner Agency onboarded: ${input.name} (${normalizedSlug})`,
    });

    return { agency, walletId: wallet.id };
  }

  /**
   * Retrieves an agency profile by ID or tenantId.
   */
  public static async getAgency(
    session: UserSession,
    identifier: string,
  ): Promise<PartnerAgencyProfile> {
    AgencyService.ensureDefaultAgencies();
    for (const a of AgencyService.agencies.values()) {
      if (a.id === identifier || a.tenantId === identifier) {
        // Enforce tenant boundary: agency staff can only inspect their own agency
        const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
        if (!isStaff && a.tenantId !== session.tenantId) {
          throw new AgencyNotFoundError(identifier);
        }
        return a;
      }
    }
    throw new AgencyNotFoundError(identifier);
  }

  /**
   * Lists all registered partner travel agencies.
   */
  public static async listAgencies(session: UserSession): Promise<PartnerAgencyProfile[]> {
    AgencyService.ensureDefaultAgencies();
    const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
    if (!isStaff) {
      // Non-staff returns only their own agency
      const agency = Array.from(AgencyService.agencies.values()).find(
        (a) => a.tenantId === session.tenantId,
      );
      return agency ? [agency] : [];
    }

    return Array.from(AgencyService.agencies.values());
  }

  /**
   * Resolves tenant and white-label branding from host header.
   */
  public static resolveTenantByHost(host: string | undefined | null): TenantResolutionResult {
    AgencyService.ensureDefaultAgencies();
    const agencyList = Array.from(AgencyService.agencies.values());
    return coreResolveTenantByHost(host, agencyList);
  }

  /**
   * Seeds realistic launch partner agencies.
   */
  public static ensureDefaultAgencies(): void {
    if (AgencyService.agencies.size > 0) {
      return;
    }

    const defaults: PartnerAgencyProfile[] = [
      {
        id: 'agn-bengal-travel',
        tenantId: BENGAL_AGENCY_TENANT_ID,
        name: 'Bengal Travel & Tours',
        tier: 'tier2_partner_agency',
        status: 'active',
        customDomain: 'visa.bengaltravel.com',
        subdomainSlug: 'bengaltravel',
        branding: {
          companyName: 'Bengal Travel Visa Desk',
          logoUrl: '/agencies/bengal-logo.svg',
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
        supportedCountries: ['SG', 'MY', 'TH', 'AE', 'TR'],
        createdAt: '2026-11-15T00:00:00.000Z',
        updatedAt: '2026-11-15T00:00:00.000Z',
      },
      {
        id: 'agn-eurovisa-desk',
        tenantId: EUROVISA_AGENCY_TENANT_ID,
        name: 'EuroVisa Desk GmbH',
        tier: 'tier2_partner_agency',
        status: 'active',
        customDomain: 'portal.eurovisadesk.de',
        subdomainSlug: 'eurovisa',
        branding: {
          companyName: 'EuroVisa Desk Germany',
          logoUrl: '/agencies/eurovisa-logo.svg',
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
        supportedCountries: ['DE', 'AT', 'CH', 'GB'],
        createdAt: '2026-11-15T00:00:00.000Z',
        updatedAt: '2026-11-15T00:00:00.000Z',
      },
      {
        id: 'agn-gulf-express',
        tenantId: GULF_AGENCY_TENANT_ID,
        name: 'Gulf Express Visa Services',
        tier: 'tier2_partner_agency',
        status: 'active',
        customDomain: 'visas.gulfexpress.ae',
        subdomainSlug: 'gulfexpress',
        branding: {
          companyName: 'Gulf Express Visa Services (Dubai)',
          logoUrl: '/agencies/gulf-logo.svg',
          primaryColor: '#092A21',
          accentColor: '#145342',
          supportEmail: 'support@gulfexpress.ae',
          customDomain: 'visas.gulfexpress.ae',
          subdomainSlug: 'gulfexpress',
        },
        wholesaleDiscountPercentage: 12,
        contactPerson: {
          name: 'Tariq Al-Mansoor',
          email: 'tariq@gulfexpress.ae',
          phone: '+971 4 000 0000',
        },
        supportedCountries: ['AE', 'SA', 'QA', 'OM'],
        createdAt: '2026-11-15T00:00:00.000Z',
        updatedAt: '2026-11-15T00:00:00.000Z',
      },
    ];

    for (const a of defaults) {
      AgencyService.agencies.set(a.id, a);
    }

    // Seed corresponding agency wallets
    WalletService.seedWallet({
      id: 'wal-bengal-001',
      tenantId: BENGAL_AGENCY_TENANT_ID,
      currency: 'USD',
      balance: 4250.0,
      lockedBalance: 0,
      isLowBalance: false,
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
    });

    WalletService.seedWallet({
      id: 'wal-eurovisa-002',
      tenantId: EUROVISA_AGENCY_TENANT_ID,
      currency: 'EUR',
      balance: 8900.0,
      lockedBalance: 350.0,
      isLowBalance: false,
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
    });

    // Low balance agency ($350 < $500 threshold)
    WalletService.seedWallet({
      id: 'wal-gulf-003',
      tenantId: GULF_AGENCY_TENANT_ID,
      currency: 'USD',
      balance: 350.0,
      lockedBalance: 0,
      isLowBalance: true,
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
    });
  }
}
