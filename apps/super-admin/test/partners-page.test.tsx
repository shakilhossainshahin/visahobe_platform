import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PartnersManagementPage from '../app/partners/page.js';

describe('Super Admin Partner & Wallet Management UI (ADR-009, ADR-010, ADR-011)', () => {
  it('renders executive KPI summary cards with partner and balance metrics', () => {
    const html = renderToStaticMarkup(<PartnersManagementPage />);

    expect(html).toContain('Partner Agencies &amp; Prepaid Wallet Ledger');
    expect(html).toContain('Total Partner Agencies');
    expect(html).toContain('Pre-Funded Wallet Total');
    expect(html).toContain('Low Balance Warnings');
    expect(html).toContain('Fulfillment Connectors');
  });

  it('renders registered B2B partner agencies with custom domains and balances', () => {
    const html = renderToStaticMarkup(<PartnersManagementPage />);

    expect(html).toContain('Bengal Travel &amp; Tours');
    expect(html).toContain('visa.bengaltravel.com');
    expect(html).toContain('bengaltravel.visahobe.com');
    expect(html).toContain('$4,250.00');

    expect(html).toContain('EuroVisa Desk GmbH');
    expect(html).toContain('portal.eurovisadesk.de');
    expect(html).toContain('$8,900.00');

    expect(html).toContain('Gulf Express Visa Services');
    expect(html).toContain('visas.gulfexpress.ae');
    expect(html).toContain('$350.00');
    expect(html).toContain('Low Balance Alert'); // Under $500 threshold
  });

  it('renders dynamic partner connector registry with masked credentials', () => {
    const html = renderToStaticMarkup(<PartnersManagementPage />);

    expect(html).toContain('DIRECT-AI-DEFAULT');
    expect(html).toContain('VisaHobe Direct Autonomous AI Processor');
    expect(html).toContain('Direct Autonomous AI');
    expect(html).toContain('sec_live_ai_***8421'); // Zero secret leak check

    expect(html).toContain('PARTNER-UK-LEGAL');
    expect(html).toContain('British Immigration Law Associates LLP');
    expect(html).toContain('External Law Desk');
    expect(html).toContain('sec_partner_***9482'); // Zero secret leak check
  });

  it('renders immutable double-entry wallet ledger with transactions', () => {
    const html = renderToStaticMarkup(<PartnersManagementPage />);

    expect(html).toContain('Recent Prepaid Wallet Ledger Transactions');
    expect(html).toContain('PAY-STATION-BD-8842');
    expect(html).toContain('CREDIT');
    expect(html).toContain('+$1500.00');
    expect(html).toContain('DEBIT');
    expect(html).toContain('-$85.00');
  });

  it('strictly adheres to ADR-009 with solid white table surfaces and 1px borders', () => {
    const html = renderToStaticMarkup(<PartnersManagementPage />);

    expect(html).toContain('bg-white rounded-xl border border-[#E2E8F0]');
    expect(html).toContain('bg-[#0D3B2E] text-white font-semibold');
  });
});
