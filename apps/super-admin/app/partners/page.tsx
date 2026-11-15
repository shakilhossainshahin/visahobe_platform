'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@visahobe/ui';

interface PartnerAgencyView {
  id: string;
  tenantId: string;
  name: string;
  tier: 'tier2_partner_agency';
  status: 'active' | 'suspended';
  customDomain: string;
  subdomainSlug: string;
  primaryColor: string;
  balance: number;
  currency: 'USD' | 'EUR';
  isLowBalance: boolean;
  supportedCountries: string[];
  contactEmail: string;
  totalCases: number;
}

interface ConnectorView {
  partnerId: string;
  partnerName: string;
  connectorType: 'direct_ai' | 'partner_agency';
  supportedCountryCodes: string[];
  supportedServiceTypes: string[];
  maskedApiKey: string;
  status: 'operational' | 'standby';
}

interface WalletTxView {
  id: string;
  agencyName: string;
  type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND';
  amount: number;
  balanceAfter: number;
  referenceId: string;
  timestamp: string;
}

const INITIAL_AGENCIES: PartnerAgencyView[] = [
  {
    id: 'agn-bengal-travel',
    tenantId: 'tenant-agency-bengal-uuid',
    name: 'Bengal Travel & Tours',
    tier: 'tier2_partner_agency',
    status: 'active',
    customDomain: 'visa.bengaltravel.com',
    subdomainSlug: 'bengaltravel',
    primaryColor: '#0A4D3C',
    balance: 4250.0,
    currency: 'USD',
    isLowBalance: false,
    supportedCountries: ['SG', 'MY', 'TH', 'AE', 'TR'],
    contactEmail: 'visas@bengaltravel.com',
    totalCases: 142,
  },
  {
    id: 'agn-eurovisa-desk',
    tenantId: 'tenant-agency-eurovisa-uuid',
    name: 'EuroVisa Desk GmbH',
    tier: 'tier2_partner_agency',
    status: 'active',
    customDomain: 'portal.eurovisadesk.de',
    subdomainSlug: 'eurovisa',
    primaryColor: '#0E3A2F',
    balance: 8900.0,
    currency: 'EUR',
    isLowBalance: false,
    supportedCountries: ['DE', 'AT', 'CH', 'GB'],
    contactEmail: 'kontakt@eurovisadesk.de',
    totalCases: 89,
  },
  {
    id: 'agn-gulf-express',
    tenantId: 'tenant-agency-gulf-uuid',
    name: 'Gulf Express Visa Services',
    tier: 'tier2_partner_agency',
    status: 'active',
    customDomain: 'visas.gulfexpress.ae',
    subdomainSlug: 'gulfexpress',
    primaryColor: '#092A21',
    balance: 350.0,
    currency: 'USD',
    isLowBalance: true, // Low balance alert!
    supportedCountries: ['AE', 'SA', 'QA', 'OM'],
    contactEmail: 'support@gulfexpress.ae',
    totalCases: 215,
  },
];

const INITIAL_CONNECTORS: ConnectorView[] = [
  {
    partnerId: 'DIRECT-AI-DEFAULT',
    partnerName: 'VisaHobe Direct Autonomous AI Processor',
    connectorType: 'direct_ai',
    supportedCountryCodes: ['SG', 'AE', 'TR', 'MY', 'VN'],
    supportedServiceTypes: ['tourist_evisa', 'business_evisa', 'arrival_card'],
    maskedApiKey: 'sec_live_ai_***8421',
    status: 'operational',
  },
  {
    partnerId: 'PARTNER-UK-LEGAL',
    partnerName: 'British Immigration Law Associates LLP',
    connectorType: 'partner_agency',
    supportedCountryCodes: ['GB', 'UK'],
    supportedServiceTypes: ['skilled_worker', 'student', 'visitor'],
    maskedApiKey: 'sec_partner_***9482',
    status: 'operational',
  },
  {
    partnerId: 'PARTNER-DE-DESK',
    partnerName: 'EuroVisa Consulting GmbH (Frankfurt)',
    connectorType: 'partner_agency',
    supportedCountryCodes: ['DE', 'AT', 'CH'],
    supportedServiceTypes: ['chancenkarte', 'blue_card', 'jobseeker'],
    maskedApiKey: 'sec_partner_***4124',
    status: 'operational',
  },
  {
    partnerId: 'PARTNER-AE-DESK',
    partnerName: 'Gulf Express Business & Tourist Visa Desk',
    connectorType: 'partner_agency',
    supportedCountryCodes: ['AE', 'SA', 'QA'],
    supportedServiceTypes: ['golden_visa', 'tourist_30', 'tourist_60'],
    maskedApiKey: 'sec_partner_***2481',
    status: 'operational',
  },
];

const INITIAL_TRANSACTIONS: WalletTxView[] = [
  {
    id: 'tx-topup-992',
    agencyName: 'Bengal Travel & Tours',
    type: 'CREDIT',
    amount: 1500.0,
    balanceAfter: 4250.0,
    referenceId: 'PAY-STATION-BD-8842',
    timestamp: 'Today at 09:15 AM',
  },
  {
    id: 'tx-case-881',
    agencyName: 'Bengal Travel & Tours',
    type: 'DEBIT',
    amount: 85.0,
    balanceAfter: 2750.0,
    referenceId: 'VH-2026-SG-4921',
    timestamp: 'Today at 08:30 AM',
  },
  {
    id: 'tx-topup-772',
    agencyName: 'EuroVisa Desk GmbH',
    type: 'CREDIT',
    amount: 5000.0,
    balanceAfter: 8900.0,
    referenceId: 'STRIPE-CH-99128',
    timestamp: 'Yesterday at 04:45 PM',
  },
  {
    id: 'tx-debit-661',
    agencyName: 'Gulf Express Visa Services',
    type: 'DEBIT',
    amount: 120.0,
    balanceAfter: 350.0,
    referenceId: 'VH-2026-AE-1092',
    timestamp: 'Yesterday at 02:10 PM',
  },
];

export default function PartnersManagementPage() {
  const [agencies, setAgencies] = useState<PartnerAgencyView[]>(INITIAL_AGENCIES);
  const [connectors] = useState<ConnectorView[]>(INITIAL_CONNECTORS);
  const [transactions, setTransactions] = useState<WalletTxView[]>(INITIAL_TRANSACTIONS);
  const [selectedAgencyForTopUp, setSelectedAgencyForTopUp] = useState<PartnerAgencyView | null>(
    null,
  );
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick Top-Up Action Simulation (ADR-010)
  const handleExecuteTopUp = () => {
    if (!selectedAgencyForTopUp) return;

    const amount = Number(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    setAgencies((prev) =>
      prev.map((a) => {
        if (a.id === selectedAgencyForTopUp.id) {
          const newBalance = Number((a.balance + amount).toFixed(2));
          return {
            ...a,
            balance: newBalance,
            isLowBalance: newBalance < 500,
          };
        }
        return a;
      }),
    );

    const newTx: WalletTxView = {
      id: `tx-admin-topup-${Date.now().toString(36)}`,
      agencyName: selectedAgencyForTopUp.name,
      type: 'CREDIT',
      amount,
      balanceAfter: Number((selectedAgencyForTopUp.balance + amount).toFixed(2)),
      referenceId: `ADMIN-CREDIT-${Date.now().toString(36).toUpperCase()}`,
      timestamp: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setFeedback(
      `Successfully credited +$${amount.toFixed(2)} to ${selectedAgencyForTopUp.name}. Wallet balance refreshed.`,
    );
    setSelectedAgencyForTopUp(null);
  };

  const totalPreFundedBalance = agencies.reduce((acc, a) => acc + a.balance, 0);
  const lowBalanceCount = agencies.filter((a) => a.isLowBalance).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#145342] uppercase tracking-wider">
              B2B2C Multi-Tenant SaaS
            </span>
            <span className="text-xs text-[#94A3B8]">•</span>
            <span className="text-xs font-mono text-[#64748B]">ADR-010 &amp; ADR-011</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E] mt-1">
            Partner Agencies &amp; Prepaid Wallet Ledger
          </h1>
          <p className="text-sm text-[#64748B]">
            Manage white-label travel agencies, inspect pre-funded prepaid wallets, and monitor
            dynamic fulfillment connectors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            <span>Tier 2 SaaS Desk Active</span>
          </Badge>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#ECFDF5] border border-[#86EFAC] text-xs font-semibold text-[#065F46] flex items-center justify-between"
        >
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-[#065F46] hover:text-[#0D3B2E]">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards — Permitted Liquid Glass per ADR-009 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Total Partner Agencies</span>
          <div className="text-2xl font-display font-bold text-[#0D3B2E] mt-1">
            {agencies.length}
          </div>
          <span className="text-[11px] text-[#15803D] font-medium">100% Active Onboarded</span>
        </div>

        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Pre-Funded Wallet Total</span>
          <div className="text-2xl font-display font-bold text-[#0D3B2E] mt-1">
            ${totalPreFundedBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#64748B]">Settled &amp; Secured Balance</span>
        </div>

        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Low Balance Warnings</span>
          <div
            className={`text-2xl font-display font-bold mt-1 ${
              lowBalanceCount > 0 ? 'text-[#B45309]' : 'text-[#15803D]'
            }`}
          >
            {lowBalanceCount} {lowBalanceCount > 0 ? 'Agency Alert' : 'None'}
          </div>
          <span className="text-[11px] text-[#64748B]">Threshold &lt; $500.00</span>
        </div>

        <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Fulfillment Connectors</span>
          <div className="text-2xl font-display font-bold text-[#0D3B2E] mt-1">
            {connectors.length} Active
          </div>
          <span className="text-[11px] text-[#145342]">1 Direct AI • 3 Partner Law Desks</span>
        </div>
      </div>

      {/* Top-Up Simulation Modal */}
      {selectedAgencyForTopUp && (
        <Card className="p-5 border border-[#86EFAC] bg-[#F0FDF4] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#0D3B2E]">
              Quick Wallet Top-Up: {selectedAgencyForTopUp.name}
            </h3>
            <button
              onClick={() => setSelectedAgencyForTopUp(null)}
              className="text-xs text-[#64748B] hover:text-[#0D3B2E]"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-[#475569]">
            Simulate an instant gateway settlement (Pay Station or Stripe) into the agency&apos;s
            prepaid balance.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Top-Up Amount ($)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                min={100}
                step={100}
                className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm font-mono text-[#0D3B2E] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>
            <div className="pt-5">
              <Button onClick={handleExecuteTopUp} variant="primary" size="sm">
                Confirm Credit Top-Up
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table 1: Partner Travel Agencies — SOLID WHITE PER ADR-009 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0D3B2E]">
            B2B Partner Travel Agencies Directory
          </h2>
          <span className="text-xs text-[#64748B]">
            Showing {agencies.length} registered agencies
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D3B2E] text-white font-semibold">
                  <th className="py-3 px-4">Agency Name</th>
                  <th className="py-3 px-4">Tenant ID / Subdomain</th>
                  <th className="py-3 px-4">Custom Domain</th>
                  <th className="py-3 px-4">Countries</th>
                  <th className="py-3 px-4 text-right">Prepaid Wallet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: agency.primaryColor }}
                        />
                        <span>{agency.name}</span>
                      </div>
                      <span className="text-[11px] text-[#64748B] block font-normal">
                        {agency.contactEmail}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#475569]">
                      <div>{agency.subdomainSlug}.visahobe.com</div>
                      <span className="text-[10px] text-[#94A3B8]">{agency.tenantId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#0D3B2E] font-medium font-mono">
                      {agency.customDomain}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <div className="flex flex-wrap gap-1">
                        {agency.supportedCountries.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] font-semibold text-[#334155]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-sm text-[#0D3B2E]">
                        $
                        {agency.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {agency.currency}
                      </div>
                      {agency.isLowBalance && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold">
                          Low Balance Alert
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAgencyForTopUp(agency)}
                        className="text-xs"
                      >
                        + Top-Up
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Table 2: Dynamic Partner Connectors Registry — SOLID WHITE PER ADR-009 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0D3B2E]">
            Dynamic Partner Connector Registry (ADR-011)
          </h2>
          <span className="text-xs text-[#64748B]">
            Hybrid Fulfillment: Direct AI vs Overseas Law Desks
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D3B2E] text-white font-semibold">
                  <th className="py-3 px-4">Connector ID</th>
                  <th className="py-3 px-4">Partner Entity</th>
                  <th className="py-3 px-4">Fulfillment Type</th>
                  <th className="py-3 px-4">Routing Countries</th>
                  <th className="py-3 px-4">Supported Services</th>
                  <th className="py-3 px-4">Credential Safety</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {connectors.map((c) => (
                  <tr key={c.partnerId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0D3B2E]">
                      {c.partnerId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0F172A]">{c.partnerName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.connectorType === 'direct_ai'
                            ? 'bg-[#ECFDF5] text-[#065F46]'
                            : 'bg-[#EFF6FF] text-[#1E40AF]'
                        }`}
                      >
                        {c.connectorType === 'direct_ai'
                          ? 'Direct Autonomous AI'
                          : 'External Law Desk'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <div className="flex flex-wrap gap-1">
                        {c.supportedCountryCodes.map((cc) => (
                          <span
                            key={cc}
                            className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] font-semibold text-[#334155]"
                          >
                            {cc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {c.supportedServiceTypes.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#475569]">
                      {c.maskedApiKey}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Table 3: Immutable Double-Entry Wallet Ledger — SOLID WHITE PER ADR-009 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0D3B2E]">
            Recent Prepaid Wallet Ledger Transactions
          </h2>
          <span className="text-xs text-[#64748B]">
            Zero-Overdraft Immutable Double-Entry Records
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D3B2E] text-white font-semibold">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Agency</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#0D3B2E] font-semibold">{tx.id}</td>
                    <td className="py-3 px-4 font-medium text-[#0F172A]">{tx.agencyName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'CREDIT'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : tx.type === 'DEBIT'
                              ? 'bg-[#FEE2E2] text-[#B91C1C]'
                              : 'bg-[#FEF3C7] text-[#B45309]'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold ${
                        tx.type === 'CREDIT' ? 'text-[#15803D]' : 'text-[#B91C1C]'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#475569]">
                      ${tx.balanceAfter.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                      {tx.referenceId}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{tx.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
