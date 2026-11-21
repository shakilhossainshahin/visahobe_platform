'use client';

import React, { useState } from 'react';
import { Button, LuxuryButton, Badge, EmeraldBadge, StatKpiCard } from '@visahobe/ui';
import { AutonomyRouter, type ConsularAction, type AutonomyEvaluation } from '@visahobe/agents';

interface CaseItem {
  id: string;
  caseNumber: string;
  applicantRef: string;
  destination: string;
  visaStream: string;
  countryCode: string;
  stage: 'intake' | 'audit' | 'embassy_prep' | 'consular_submission' | 'decision';
  stageLabel: string;
  priority: 'urgent' | 'high' | 'standard';
  assignedTo: string;
  lastUpdated: string;
  actionRequired: boolean;
}

const MOCK_CASES: CaseItem[] = [
  {
    id: 'case-sg-4921',
    caseNumber: 'VH-2026-SG-4921',
    applicantRef: 'Tanvir A. (CL-8821)',
    destination: 'Singapore',
    visaStream: 'Employment Pass (EP)',
    countryCode: 'SG',
    stage: 'audit',
    stageLabel: 'Specialist Audit',
    priority: 'urgent',
    assignedTo: 'Sarah Jenkins',
    lastUpdated: '10 mins ago',
    actionRequired: true,
  },
  {
    id: 'case-de-1082',
    caseNumber: 'VH-2026-DE-1082',
    applicantRef: 'Ananya R. (CL-3392)',
    destination: 'Germany',
    visaStream: 'EU Blue Card',
    countryCode: 'DE',
    stage: 'embassy_prep',
    stageLabel: 'Embassy File Prep',
    priority: 'high',
    assignedTo: 'Michael Chen',
    lastUpdated: '42 mins ago',
    actionRequired: false,
  },
  {
    id: 'case-uk-9921',
    caseNumber: 'VH-2026-UK-9921',
    applicantRef: 'Kazi M. (CL-7712)',
    destination: 'United Kingdom',
    visaStream: 'Skilled Worker Visa',
    countryCode: 'GB',
    stage: 'intake',
    stageLabel: 'Intake Submitted',
    priority: 'standard',
    assignedTo: 'Unassigned',
    lastUpdated: '2 hours ago',
    actionRequired: true,
  },
  {
    id: 'case-au-4011',
    caseNumber: 'VH-2026-AU-4011',
    applicantRef: 'Farhana S. (CL-6104)',
    destination: 'Australia',
    visaStream: 'Subclass 189 Skilled',
    countryCode: 'AU',
    stage: 'consular_submission',
    stageLabel: 'Consular Submission',
    priority: 'standard',
    assignedTo: 'David Miller',
    lastUpdated: '4 hours ago',
    actionRequired: false,
  },
  {
    id: 'case-ca-5510',
    caseNumber: 'VH-2026-CA-5510',
    applicantRef: 'Rafiqul I. (CL-9014)',
    destination: 'Canada',
    visaStream: 'Express Entry (FSW)',
    countryCode: 'CA',
    stage: 'decision',
    stageLabel: 'Decision & Pass',
    priority: 'standard',
    assignedTo: 'Sarah Jenkins',
    lastUpdated: 'Yesterday',
    actionRequired: false,
  },
  {
    id: 'case-ae-2104',
    caseNumber: 'VH-2026-AE-2104',
    applicantRef: 'Zubaida K. (CL-4108)',
    destination: 'UAE',
    visaStream: '10-Year Golden Visa',
    countryCode: 'AE',
    stage: 'audit',
    stageLabel: 'Specialist Audit',
    priority: 'high',
    assignedTo: 'Michael Chen',
    lastUpdated: 'Yesterday',
    actionRequired: true,
  },
];

export default function SuperAdminDashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Agent Simulator State
  const [simCountry, setSimCountry] = useState<string>('SG');
  const [simConfidence, setSimConfidence] = useState<number>(0.98);
  const [simPaymentAction, setSimPaymentAction] = useState<boolean>(false);
  const [simBiometricsAction, setSimBiometricsAction] = useState<boolean>(false);
  const [simPerjuryAction, setSimPerjuryAction] = useState<boolean>(false);
  const [simEvaluation, setSimEvaluation] = useState<AutonomyEvaluation | null>(null);

  const handleRunSimulation = () => {
    const actions: ConsularAction[] = [
      {
        id: 'sim-act-1',
        actionType: 'prepare_draft',
        destinationCountry: simCountry,
        description: 'Draft electronic visa form',
      },
    ];

    if (simPaymentAction) {
      actions.push({
        id: 'sim-act-pay',
        actionType: 'portal_payment',
        destinationCountry: simCountry,
        description: 'Automatic portal fee payment',
      });
    }

    if (simBiometricsAction) {
      actions.push({
        id: 'sim-act-bio',
        actionType: 'schedule_biometrics',
        destinationCountry: simCountry,
        description: 'Book biometrics interview',
      });
    }

    if (simPerjuryAction) {
      actions.push({
        id: 'sim-act-perjury',
        actionType: 'sign_perjury_affidavit',
        destinationCountry: simCountry,
        description: 'Sign statutory declaration',
      });
    }

    const evaluation = AutonomyRouter.evaluateAutonomy({
      destinationCountry: simCountry,
      confidenceScore: simConfidence,
      actions,
    });

    setSimEvaluation(evaluation);
  };

  const filteredCases = MOCK_CASES.filter((c) => {
    if (selectedFilter !== 'all' && c.stage !== selectedFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.caseNumber.toLowerCase().includes(q) ||
        c.applicantRef.toLowerCase().includes(q) ||
        c.destination.toLowerCase().includes(q) ||
        c.visaStream.toLowerCase().includes(q) ||
        c.assignedTo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Cases', count: MOCK_CASES.length },
    {
      id: 'intake',
      label: 'Intake Queue',
      count: MOCK_CASES.filter((c) => c.stage === 'intake').length,
    },
    {
      id: 'audit',
      label: 'Specialist Audit',
      count: MOCK_CASES.filter((c) => c.stage === 'audit').length,
    },
    {
      id: 'embassy_prep',
      label: 'Embassy Prep',
      count: MOCK_CASES.filter((c) => c.stage === 'embassy_prep').length,
    },
    {
      id: 'consular_submission',
      label: 'Consular Submission',
      count: MOCK_CASES.filter((c) => c.stage === 'consular_submission').length,
    },
    {
      id: 'decision',
      label: 'Decision & Pass',
      count: MOCK_CASES.filter((c) => c.stage === 'decision').length,
    },
  ];

  return (
    <div className="space-y-8 text-[#111827]">
      {/* Operations Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <EmeraldBadge variant="brand" size="sm">
              Executive Operations Desk
            </EmeraldBadge>
            <Badge variant="gold" size="sm">
              AAL2 MFA Enforced • ADR-009 Compliant
            </Badge>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E] tracking-tight">
            Case Operations Command Center
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Global consular filing queues, SLA monitors, and real-time document verification
            pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/partners">
            <Button variant="outline" size="sm">
              Partner Wallets
            </Button>
          </a>
          <a href="/audit">
            <LuxuryButton size="sm">Launch Document Verifier</LuxuryButton>
          </a>
        </div>
      </div>

      {/* Luxury Dark-Glass Mission Control Command Center (ADR-009 / TICKET-P5-001) */}
      <div
        className="rounded-2xl bg-gradient-to-r from-[#0D3B2E] via-[#092A21] to-[#041611] text-white p-6 shadow-xl border border-[#C8A951]/40 space-y-6"
        data-testid="mission-control-deck"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8A951]">
                Mission Control • Live Consular Operations Deck
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-1">
              Autonomous AI vs Human Intervention Telemetry
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-semibold text-[#C8A951] border border-white/15">
              Live Edge Sync • 0.2s
            </span>
            <a href="/browser">
              <Button variant="gold" size="sm" className="shadow-xs">
                Launch Live Browser Console →
              </Button>
            </a>
          </div>
        </div>

        {/* 3 Telemetry Pillars: Autonomy Ratio Gauge, Country Pipeline, Wallet Liquidity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pillar 1: Autonomous AI vs Human Intervention Ratio Gauge */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Autonomy Distribution Ratio</span>
                <span className="text-[#C8A951] font-mono">78% Autonomous</span>
              </div>
              <p className="text-[11px] text-white/70 mt-1">
                Level 3 electronic visas processed autonomously vs Human specialist review gates.
              </p>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all"
                  style={{ width: '78%' }}
                  title="78% Autonomous (Level 3)"
                />
                <div
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] transition-all"
                  style={{ width: '22%' }}
                  title="22% Human Review Gate"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#10B981] font-bold">78% Level 3 Autonomous</span>
                <span className="text-[#F59E0B] font-bold">22% Human Intervention Gate</span>
              </div>
            </div>

            <div className="text-[11px] text-white/60 border-t border-white/10 pt-2 flex items-center justify-between">
              <span>Trend: +4.2% AI efficiency this month</span>
              <span className="text-emerald-400 font-semibold">Zero Gate Breaches</span>
            </div>
          </div>

          {/* Pillar 2: Country Pipeline Distribution */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Country Pipeline Distribution</span>
              <span className="text-[#64748B] font-mono text-[11px] text-white/70">142 Cases</span>
            </div>

            <div className="space-y-2">
              {[
                { name: '🇸🇬 Singapore', cases: 54, pct: '38%', sla: '99.4%' },
                { name: '🇦🇪 UAE Golden', cases: 38, pct: '27%', sla: '99.6%' },
                { name: '🇬🇧 UK Skilled', cases: 22, pct: '15%', sla: '98.9%' },
                { name: '🇩🇪 Germany', cases: 16, pct: '11%', sla: '98.5%' },
                { name: '🇨🇦 Canada PR', cases: 12, pct: '9%', sla: '98.1%' },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/90">{c.name}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-white/80">{c.cases} cases</span>
                    <span className="text-[#C8A951] font-semibold">{c.pct}</span>
                    <span className="text-emerald-400 text-[10px]">{c.sla}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-white/60 border-t border-white/10 pt-2">
              All 6 launch jurisdictions operating within standard statutory SLAs.
            </div>
          </div>

          {/* Pillar 3: Agency Prepaid Wallet Liquidity Overview */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Prepaid Wallet Liquidity (ADR-010)</span>
              <span className="text-[#C8A951] font-mono font-bold">$148,500.00</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-white/80">Active Partner Wallets</span>
                <span className="font-mono font-bold text-white">14 Agencies</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-900/30 border border-amber-500/30 flex items-center justify-between">
                <span className="text-amber-300">Low Balance Alerts (&lt; $500)</span>
                <span className="font-mono font-bold text-amber-300">2 Agencies</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-white/80">24h Case Fee Deductions</span>
                <span className="font-mono font-bold text-emerald-400">$12,450.00</span>
              </div>
            </div>

            <div className="text-[11px] text-white/60 border-t border-white/10 pt-2 flex items-center justify-between">
              <span>Zero-Overdraft Invariant Enforced</span>
              <a href="/partners" className="text-[#C8A951] hover:underline font-semibold">
                Manage Ledgers →
              </a>
            </div>
          </div>
        </div>

        {/* Prioritized Consular Safety Gate & Live Browser Takeover Deck */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Prioritized Consular Safety Gate &amp; Live Browser Takeover Queue
              </h3>
            </div>
            <span className="text-[11px] text-amber-400 font-mono font-semibold">
              3 Sessions Paused at Safety Checkpoint • Staff Authorization Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                caseNumber: 'VH-2026-SG-4921',
                country: '🇸🇬 Singapore MOM',
                checkpoint: 'portal_payment (S$360 Lodgment Fee)',
                timestamp: '12 mins ago',
                sessionId: 'sess-brw-sg-4921',
              },
              {
                caseNumber: 'VH-2026-AE-2104',
                country: '🇦🇪 UAE ICP Portal',
                checkpoint: 'captcha_detected (Cloudflare Turnstile)',
                timestamp: '24 mins ago',
                sessionId: 'sess-brw-ae-2104',
              },
              {
                caseNumber: 'VH-2026-TR-8812',
                country: '🇹🇷 Turkey e-Visa',
                checkpoint: 'sign_perjury_affidavit (Consular Sign-off)',
                timestamp: '38 mins ago',
                sessionId: 'sess-brw-tr-8812',
              },
            ].map((item) => (
              <div
                key={item.caseNumber}
                className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="text-[#C8A951] font-mono">{item.caseNumber}</span>
                    <span className="text-[10px] text-white/60">{item.timestamp}</span>
                  </div>
                  <span className="text-[11px] text-white/90 font-medium block mt-0.5">
                    {item.country}
                  </span>
                  <span className="text-[10px] text-red-300 font-mono block mt-1">
                    Gate: {item.checkpoint}
                  </span>
                </div>

                <a
                  href={`/browser?sessionId=${item.sessionId}`}
                  className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-[#C8A951] hover:bg-[#b09340] text-[#0D3B2E] font-bold text-[11px] text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Take Over in Live Browser</span>
                  <span>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatKpiCard
          variant="solid"
          label="Active Cases"
          value="142"
          subvalue="Across 6 launch destinations"
          trend={{ label: '+8 this week', direction: 'up' }}
        />
        <StatKpiCard
          variant="solid"
          label="Pending Verification"
          value="18"
          subvalue="Passports, bank statements, OCR"
          trend={{ label: 'Needs Review', direction: 'neutral' }}
        />
        <StatKpiCard
          variant="solid"
          label="SLA Critical Alerts"
          value="3"
          subvalue="Filing submission deadline"
          trend={{ label: '< 4h remaining', direction: 'down' }}
        />
        <StatKpiCard
          variant="solid"
          label="Approved Today"
          value="12"
          subvalue="Statutory files certified"
          trend={{ label: '100% SLA met', direction: 'up' }}
        />
      </div>

      {/* Super AI Agent Autonomy & Daily Executive Digest Section (ADR-011) */}
      <div
        className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-5"
        data-testid="executive-digest-panel"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#15803D]"></span>
              </span>
              <h2 className="text-lg font-display font-bold text-[#0D3B2E]">
                Super AI Agent Autonomy &amp; Daily Executive Digest
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              3-tier confidence router, Consular Safety Review Gates (ADR-011), and daily platform
              metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
              Autonomy Ratio: 31.1%
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              7 Safety Intercepts
            </span>
          </div>
        </div>

        {/* 3 Executive Digest KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Autonomy Level Distribution */}
          <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#0D3B2E]">
              <span>Autonomy Levels (ADR-011)</span>
              <span className="text-[#64748B] font-mono font-normal">61 Evaluated</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Level 1 (Assisted Draft, &lt; 0.80):</span>
                <span className="font-semibold text-[#111827]">14 cases (23%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Level 2 (Semi-Autonomous, 0.80-0.94):</span>
                <span className="font-semibold text-[#111827]">28 cases (46%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#15803D] font-medium">
                  Level 3 (Autonomous, &gt;= 0.95):
                </span>
                <span className="font-bold text-[#15803D]">19 cases (31%)</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
              Standard e-Visas (SG, AE, TR, MY, VN) qualified for autonomous filing.
            </div>
          </div>

          {/* Consular Safety Guard Intercepts */}
          <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#0D3B2E]">
              <span>Consular Safety Intercepts</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                100% Enforced
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Live Portal Payments:</span>
                <span className="font-semibold text-[#B91C1C]">3 blocked</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Biometric / VAC Schedulers:</span>
                <span className="font-semibold text-[#B91C1C]">3 blocked</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Perjury Statutory Affidavits:</span>
                <span className="font-semibold text-[#B91C1C]">1 blocked</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
              All high-risk actions halted at human verifier gate (
              <code className="text-[#0D3B2E]">in_review</code>).
            </div>
          </div>

          {/* Financial & SLA Watchlist */}
          <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#0D3B2E]">
              <span>Partner Wallet &amp; SLA Alerts</span>
              <span className="text-[#B45309] font-mono font-bold">2 Actions</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Low Balance (&lt; $500):</span>
                <span className="font-semibold text-[#B45309]">1 Agency ($420.00)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">Critical SLA (&gt; 48h in review):</span>
                <span className="font-semibold text-[#B91C1C]">VH-2026-DE-2041 (52h)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">SLA Warning (&gt; 40h intake):</span>
                <span className="font-semibold text-[#B45309]">VH-2026-CA-9102 (44h)</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
              Automated wallet top-up reminder dispatched to partner agency.
            </div>
          </div>
        </div>

        {/* Interactive Super AI Agent Evaluation Simulator */}
        <div className="p-4 rounded-lg border border-[#C8A951]/40 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
              Interactive Super AI Agent Evaluation Simulator (Live ADR-011 Engine)
            </h3>
            <span className="text-[11px] text-[#64748B]">
              Test confidence thresholds &amp; safety barriers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="sim-country-select"
                className="block text-[11px] font-semibold text-[#475569] mb-1"
              >
                Destination Jurisdiction
              </label>
              <select
                id="sim-country-select"
                aria-label="Destination Jurisdiction"
                value={simCountry}
                onChange={(e) => setSimCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md text-xs border border-[#E2E8F0] bg-white text-[#111827] focus:ring-2 focus:ring-[#0D3B2E]"
                data-testid="sim-country-select"
              >
                <option value="SG">Singapore (SG - e-Visa Allowlist)</option>
                <option value="AE">UAE (AE - e-Visa Allowlist)</option>
                <option value="TR">Turkey (TR - e-Visa Allowlist)</option>
                <option value="US">United States (US - Consular Interview Gate)</option>
                <option value="GB">United Kingdom (GB - Consular Biometrics Gate)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sim-confidence-select"
                className="block text-[11px] font-semibold text-[#475569] mb-1"
              >
                OCR &amp; Extraction Confidence
              </label>
              <select
                id="sim-confidence-select"
                aria-label="OCR and Extraction Confidence"
                value={simConfidence.toString()}
                onChange={(e) => setSimConfidence(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md text-xs border border-[#E2E8F0] bg-white text-[#111827] focus:ring-2 focus:ring-[#0D3B2E]"
                data-testid="sim-confidence-select"
              >
                <option value="0.98">0.98 (High Confidence &ge; 0.95)</option>
                <option value="0.90">0.90 (Semi-Autonomous 0.80 - 0.94)</option>
                <option value="0.75">0.75 (Assisted Draft &lt; 0.80)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold text-[#475569]">
                Simulate Restricted Actions (ADR-011)
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simPaymentAction}
                    onChange={(e) => setSimPaymentAction(e.target.checked)}
                    className="rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                    data-testid="sim-action-payment"
                  />
                  <span>Portal Payment</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simBiometricsAction}
                    onChange={(e) => setSimBiometricsAction(e.target.checked)}
                    className="rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                    data-testid="sim-action-biometrics"
                  />
                  <span>Biometrics Booking</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simPerjuryAction}
                    onChange={(e) => setSimPerjuryAction(e.target.checked)}
                    className="rounded text-[#0D3B2E] focus:ring-[#0D3B2E]"
                    data-testid="sim-action-perjury"
                  />
                  <span>Perjury Affidavit</span>
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunSimulation}
                className="w-full text-xs font-semibold"
                data-testid="sim-evaluate-btn"
              >
                Run Super Agent Evaluation
              </Button>
            </div>
          </div>

          {/* Simulation Output Result Box */}
          {simEvaluation && (
            <div
              className="mt-3 p-3 rounded-lg border border-[#0D3B2E]/20 bg-[#F8FAFC] space-y-2"
              data-testid="sim-evaluation-result"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0D3B2E]">Evaluation Result:</span>
                  <Badge
                    variant={
                      simEvaluation.level === 'level_3_autonomous_submission'
                        ? 'success'
                        : simEvaluation.level === 'level_2_semi_autonomous'
                          ? 'warning'
                          : 'neutral'
                    }
                    size="sm"
                  >
                    {simEvaluation.level.toUpperCase()}
                  </Badge>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      simEvaluation.recommendedStatus === 'submitted'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : simEvaluation.recommendedStatus === 'in_review'
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#F1F5F9] text-[#475569]'
                    }`}
                  >
                    Status: {simEvaluation.recommendedStatus.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#64748B]">
                  Human Gate:{' '}
                  {simEvaluation.requiresHumanVerification
                    ? 'MANDATORY REVIEW'
                    : 'BYPASSED (AUTONOMOUS)'}
                </div>
              </div>

              <p className="text-xs text-[#334155]">{simEvaluation.reason}</p>

              {simEvaluation.blockedSafetyActions.length > 0 && (
                <div className="p-2 rounded bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
                  <span className="font-bold">Consular Safety Barrier:</span>
                  <span>
                    Blocked restricted actions: {simEvaluation.blockedSafetyActions.join(', ')}.
                    Autonomous submission prohibited.
                  </span>
                </div>
              )}

              <div className="text-[11px] font-mono text-[#64748B]">
                Masked PII Sample: Passport{' '}
                <span className="font-semibold text-[#111827]">A1*****78</span> | DOB{' '}
                <span className="font-semibold text-[#111827]">1990-**-**</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Case Operations Queue Section */}
      <div className="space-y-4">
        {/* Interactive Stage Filter Tabs, Priority Filter & Live Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#0D3B2E] text-white border border-[#C8A951]/60 shadow-xs'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0D3B2E] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedFilter === tab.id
                      ? 'bg-[#C8A951] text-[#111827] font-bold'
                      : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              aria-label="Filter by SLA Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs border border-[#E2E8F0] bg-white text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
            >
              <option value="all">All SLA Priorities</option>
              <option value="urgent">Urgent SLA Only</option>
              <option value="high">High Priority</option>
              <option value="standard">Standard Priority</option>
            </select>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by case #, client ref, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-[#E2E8F0] bg-white text-[#111827] placeholder-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Strict ADR-009 Compliant Solid High-Contrast Table (Zero Blur on Data Tables, Crisp #0D3B2E Header) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-gradient-to-r from-[#0D3B2E] via-[#C8A951] to-[#0D3B2E]"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="case-queue-table">
              <thead>
                <tr className="bg-[#0D3B2E] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Case Number</th>
                  <th className="py-3.5 px-4">Applicant Ref</th>
                  <th className="py-3.5 px-4">Destination &amp; Stream</th>
                  <th className="py-3.5 px-4">Filing Stage</th>
                  <th className="py-3.5 px-4">SLA Priority</th>
                  <th className="py-3.5 px-4">Assigned Verifier</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs bg-white">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#64748B]">
                      No cases matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                      data-testid={`case-row-${item.caseNumber}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0D3B2E]">
                        {item.caseNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#111827]">
                        {item.applicantRef}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#111827]">{item.destination}</div>
                        <div className="text-[11px] text-[#64748B]">{item.visaStream}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            item.stage === 'decision'
                              ? 'success'
                              : item.stage === 'audit'
                                ? 'warning'
                                : 'neutral'
                          }
                          size="sm"
                        >
                          {item.stageLabel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.priority === 'urgent' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]"
                            data-testid="priority-badge-urgent"
                          >
                            URGENT
                          </span>
                        )}
                        {item.priority === 'high' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                            data-testid="priority-badge-high"
                          >
                            HIGH
                          </span>
                        )}
                        {item.priority === 'standard' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                            data-testid="priority-badge-standard"
                          >
                            STANDARD
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        {item.assignedTo === 'Unassigned' ? (
                          <span className="text-[#B45309] font-medium">Unassigned</span>
                        ) : (
                          item.assignedTo
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.lastUpdated}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a href={`/audit?case=${item.caseNumber}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-semibold text-[#0D3B2E] border border-[#0D3B2E]/20 hover:bg-[#0D3B2E]/5"
                          >
                            Review File
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {filteredCases.length} of {MOCK_CASES.length} cases
            </span>
            <span className="font-mono text-[11px]">
              Compliance: ADR-009 Solid High-Contrast Table Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
