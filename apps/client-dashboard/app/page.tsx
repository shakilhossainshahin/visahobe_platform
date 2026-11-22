'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  GlassCard,
  Badge,
  EmeraldBadge,
  Button,
  LuxuryButton,
  StatKpiCard,
  DataTableShell,
  AuroraParallaxBackdrop,
  Glass3DCard,
  FloatingGlassDock,
} from '@visahobe/ui';
import { GamifiedJourneyTracker } from '../components/GamifiedJourneyTracker.js';

interface MilestoneStep {
  id: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string;
  slaTarget: string;
  consularGate: string;
  deliverables: string[];
}

const MILESTONE_STEPS: MilestoneStep[] = [
  {
    id: 1,
    title: 'Intake Submitted',
    subtitle: 'Eligibility criteria evaluated & dossier initialized',
    status: 'completed',
    date: 'Nov 02, 2026',
    slaTarget: 'Completed in 4 mins',
    consularGate: 'Automated COMPASS & Tenant RLS Provisioning',
    deliverables: [
      'COMPASS Preliminary Score (50/40 Points Verified)',
      'PostgreSQL Kernel RLS Tenant Context Locked',
      'Primary Verifier Assigned (Sarah Jenkins)',
    ],
  },
  {
    id: 2,
    title: 'AI & Specialist Document Audit',
    subtitle: 'OCR check, degree credentialing & specialist verification',
    status: 'current',
    date: 'In Progress • Est. Nov 20',
    slaTarget: '48h Specialist Turnaround',
    consularGate: 'Dual AI OCR (99.8%) + Licensed Specialist Review',
    deliverables: [
      'Passport MRZ & Bio-data OCR Verified (99.8% Confidence)',
      'BSc Computer Science DataFlow Authentication Completed',
      'Pending: 6-Month Stamped Bank Statement Upload',
    ],
  },
  {
    id: 3,
    title: 'Embassy File Preparation',
    subtitle: 'MOM Form 8 digital dossier & employer submission pack',
    status: 'upcoming',
    date: 'Est. Nov 28, 2026',
    slaTarget: '5 Business Days',
    consularGate: 'Mandatory Human Counsel Sign-Off Gate (ADR-011)',
    deliverables: [
      'MOM Form 8 Statutory Declaration Assembly',
      'Sponsoring Employer ACRA & Fair Consideration Check',
      'Final Legal Compliance Sign-Off by Lead Verifier',
    ],
  },
  {
    id: 4,
    title: 'Biometrics & Consular Submission',
    subtitle: 'IPA issuance & biometric registration appointment',
    status: 'upcoming',
    date: 'Est. Dec 05, 2026',
    slaTarget: '10–14 Business Days',
    consularGate: 'Official MOM EP eService Portal Lodgment',
    deliverables: [
      'Official MOM Lodgment Receipt & Reference Number',
      'In-Principle Approval (IPA) Letter Monitoring',
      'EPSC Biometric & Fingerprint Slot Scheduling',
    ],
  },
  {
    id: 5,
    title: 'Decision & Pass Issuance',
    subtitle: 'Official MOM digital Employment Pass delivery',
    status: 'upcoming',
    date: 'Est. Dec 15, 2026',
    slaTarget: 'Immediate Digital Issuance',
    consularGate: 'Singpass Digital Pass & Notification Letter',
    deliverables: [
      'In-Principle Approval (IPA) Travel Clearance',
      'Digital Employment Pass (SGWorkPass) Activation',
      'Post-Arrival Relocation & Dependant Pass Advisory',
    ],
  },
];

const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Degree Certificate Verified',
    description: 'Educational credentials authenticated via MOM-approved screening partner.',
    actor: 'Sarah J. (Lead Verifier)',
    timestamp: '2 hours ago',
    type: 'success',
  },
  {
    id: 'act-2',
    title: 'Automated OCR Check Passed',
    description: 'Passport bio-data extracted and validated with 99.8% confidence score.',
    actor: 'VisaHobe AI Engine',
    timestamp: '1 day ago',
    type: 'info',
  },
  {
    id: 'act-3',
    title: 'COMPASS Benchmark Calculation',
    description: 'Salary benchmark percentiles confirmed (50 points achieved vs 40 required).',
    actor: 'Sarah J. (Lead Verifier)',
    timestamp: '2 days ago',
    type: 'info',
  },
  {
    id: 'act-4',
    title: 'Application Dossier Initialized',
    description: 'Intake questionnaire evaluated and tenant isolation context verified.',
    actor: 'System Automation',
    timestamp: '5 days ago',
    type: 'neutral',
  },
];

const B2B_AGENCY_CASES = [
  {
    caseId: 'VH-2026-SG-4921',
    applicant: 'Tanvir Ahmed',
    corridor: '🇸🇬 Singapore EP (COMPASS)',
    stage: 'Stage 2: Document Audit',
    autonomy: 'Level 2 Semi-Autonomous',
    walletDebit: '$195.00 USD (Locked)',
    status: 'Pending Bank Statement',
  },
  {
    caseId: 'VH-2026-AE-8814',
    applicant: 'Nusrat Jahan',
    corridor: '🇦🇪 UAE Golden Visa (10Y)',
    stage: 'Stage 4: Consular Dispatch',
    autonomy: 'Level 3 Autonomous (99.1%)',
    walletDebit: '$175.00 USD (Settled)',
    status: 'Verified Ready',
  },
  {
    caseId: 'VH-2026-DE-3309',
    applicant: 'Mahmudul Hasan',
    corridor: '🇩🇪 Germany EU Blue Card',
    stage: 'Stage 3: ZAB & Anabin Check',
    autonomy: 'Level 2 Semi-Autonomous',
    walletDebit: '$230.00 USD (Settled)',
    status: 'In Specialist Review',
  },
];

interface ConciergeMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

const INITIAL_CONCIERGE_MESSAGES: ConciergeMessage[] = [
  {
    id: 'c-1',
    role: 'assistant',
    text: 'Welcome to your VisaHobe AI Concierge. I have real-time context on Case VH-2026-SG-4921 (Singapore Employment Pass). How can I assist with your COMPASS points, document checklist, or consular timeline today?',
    timestamp: 'Live Context • COMPASS 50/40 pts',
  },
];

export default function ClientDashboardOverviewPage() {
  const [workspaceMode, setWorkspaceMode] = useState<'b2c' | 'b2b'>('b2c');
  const [selectedStepId, setSelectedStepId] = useState<number>(2);
  const [isConciergeOpen, setIsConciergeOpen] = useState<boolean>(false);
  const [conciergeMessages, setConciergeMessages] = useState<ConciergeMessage[]>(
    INITIAL_CONCIERGE_MESSAGES,
  );
  const [conciergeInput, setConciergeInput] = useState<string>('');

  const activeMilestone =
    MILESTONE_STEPS.find((s) => s.id === selectedStepId) ?? MILESTONE_STEPS[1]!;

  const handleConciergePrompt = (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    const userMsg: ConciergeMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: 'Just now',
    };

    let replyText =
      'Your dossier is currently in Stage 2 (AI & Specialist Document Audit). Once your 6-month stamped bank statement is uploaded, Lead Verifier Sarah Jenkins will finalize MOM Form 8 within 24 hours.';
    if (trimmed.toLowerCase().includes('compass') || trimmed.toLowerCase().includes('score')) {
      replyText =
        'Your COMPASS score is verified at 50 points (10 points above the 40-point MOM statutory pass mark): C1 Salary Benchmark (20 pts), C2 Qualifications (20 pts — BSc CS verified), and C3 Diversity (10 pts).';
    } else if (trimmed.toLowerCase().includes('bank')) {
      replyText =
        'For Singapore EP lodgment, your bank statement must cover the most recent 6 consecutive months, display official bank seal or e-statement cryptographic verification, and match your monthly salary credits.';
    }

    const botMsg: ConciergeMessage = {
      id: `b-${Date.now() + 1}`,
      role: 'assistant',
      text: replyText,
      timestamp: 'Verified Policy Engine',
    };

    setConciergeMessages((prev) => [...prev, userMsg, botMsg]);
    setConciergeInput('');
  };

  const dashboardDockItems = [
    { id: 'overview', label: 'Overview', href: '/', active: true },
    { id: 'journey', label: '5-Stage Journey', href: '/#journey' },
    { id: 'vault', label: 'Document Vault', href: '/documents', badge: '1 Required' },
    { id: 'live-stream', label: 'Live Stream', href: '/live-stream' },
    { id: 'messages', label: 'Messages', href: '/messages' },
  ];

  return (
    <AuroraParallaxBackdrop
      intensity="deep"
      className="py-8 md:py-10 flex flex-col gap-8 text-white"
    >
      {/* Interactive Role / Mode Switcher Bar (B2C Applicant Mode vs B2B Partner Agency Workspace) */}
      <Container size="2xl">
        <Glass3DCard
          glowColor="emerald"
          tiltIntensity={5}
          specular={true}
          className="rounded-2xl p-4 sm:px-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-[#C8A951]/50 text-[#C8A951] font-bold text-xs shrink-0">
              {workspaceMode === 'b2c' ? 'B2C' : 'B2B'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C8A951]">
                  Interactive Workspace Mode Switcher
                </span>
                <span className="text-[11px] text-[#E3EFEA]/80 font-mono">
                  • Tenant RLS Isolated
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                {workspaceMode === 'b2c'
                  ? 'Viewing Direct Retail Applicant Portal (Personal Dossier, Milestone Tracker & Document Vault)'
                  : 'Viewing B2B Partner Agency Workspace (Bengal Global Travels • Prepaid Wallet & Sub-Client Roster)'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Workspace Mode Switcher"
              className="inline-flex rounded-xl bg-black/25 p-1 border border-white/15"
            >
              <button
                type="button"
                onClick={() => setWorkspaceMode('b2c')}
                aria-pressed={workspaceMode === 'b2c'}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  workspaceMode === 'b2c'
                    ? 'bg-[#C8A951] text-[#111827] shadow-xs'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                B2C Applicant Mode
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('b2b')}
                aria-pressed={workspaceMode === 'b2b'}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  workspaceMode === 'b2b'
                    ? 'bg-[#C8A951] text-[#111827] shadow-xs'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                B2B Partner Agency Workspace
              </button>
            </div>

            <Button variant="gold" size="sm" onClick={() => setIsConciergeOpen((prev) => !prev)}>
              {isConciergeOpen ? 'Hide AI Concierge' : '✦ Built-in AI Concierge'}
            </Button>
          </div>
        </Glass3DCard>
      </Container>

      {/* Conditional B2B Partner Agency Command Strip when switched to B2B Mode */}
      {workspaceMode === 'b2b' && (
        <Container size="2xl">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatKpiCard
                label="Prepaid Agency Wallet"
                value="$4,850.00"
                subvalue="Atomic FOR UPDATE Ledger Active"
                trend={{ label: '+$2,000 Top-Up Cleared', direction: 'up' }}
              />
              <StatKpiCard
                label="Active Sub-Client Cases"
                value="28 Dossiers"
                subvalue="19 Level 3 Autonomous • 9 Specialist Review"
                trend={{ label: '99.3% SLA Compliance', direction: 'up' }}
              />
              <StatKpiCard
                label="White-Label Custom Domain"
                value="visas.bengalglobal.com"
                subvalue="TLS Edge Verified • Tenant #AG-402"
                trend={{ label: 'Active CNAME', direction: 'neutral' }}
              />
              <StatKpiCard
                label="Wholesale B2B Tariff"
                value="32% Margin"
                subvalue="Automated per-case fee deduction"
                trend={{ label: 'Tier 1 Partner', direction: 'up' }}
              />
            </div>

            <DataTableShell
              title="B2B Partner Agency Sub-Client Dossier Roster"
              description="Scoped strictly to agency tenant_id via PostgreSQL 16 Kernel RLS"
              toolbar={
                <div className="flex items-center gap-2">
                  <EmeraldBadge variant="brand" size="sm">
                    Partner MCP Ready
                  </EmeraldBadge>
                  <a href="/documents">
                    <LuxuryButton size="sm">+ Batch Sub-Client Intake</LuxuryButton>
                  </a>
                </div>
              }
            >
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D3B2E] text-white uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Case Reference</th>
                    <th className="py-3.5 px-4">Applicant Name</th>
                    <th className="py-3.5 px-4">Consular Corridor</th>
                    <th className="py-3.5 px-4">Current Milestone</th>
                    <th className="py-3.5 px-4">AI Autonomy Tier</th>
                    <th className="py-3.5 px-4">Prepaid Wallet Debit</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#111827]">
                  {B2B_AGENCY_CASES.map((row) => (
                    <tr key={row.caseId} className="hover:bg-[#F8FAFC]">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0D3B2E]">
                        {row.caseId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{row.applicant}</td>
                      <td className="py-3.5 px-4">{row.corridor}</td>
                      <td className="py-3.5 px-4 text-[#475569]">{row.stage}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="brand" size="sm">
                          {row.autonomy}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#0D3B2E]">
                        {row.walletDebit}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Badge
                          variant={
                            row.status === 'Verified Ready'
                              ? 'success'
                              : row.status.includes('Pending')
                                ? 'warning'
                                : 'info'
                          }
                          size="sm"
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableShell>
          </div>
        </Container>
      )}

      {/* Top Header Card */}
      <Container size="2xl">
        <Glass3DCard
          glowColor="gold"
          tiltIntensity={6}
          specular={true}
          className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <EmeraldBadge variant="brand" size="md">
                Active Application
              </EmeraldBadge>
              <Badge variant="gold" size="sm">
                Case ID: VH-2026-SG-4921
              </Badge>
              <span className="text-xs text-slate-300 font-medium">
                • Target Submission: Dec 15, 2026
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
              Singapore Employment Pass (COMPASS Tier 1)
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Assigned Specialist:{' '}
              <span className="font-semibold text-[#C8A951]">
                Sarah Jenkins (Senior Immigration Specialist)
              </span>{' '}
              • Ministry of Manpower Registered
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <a href="/documents">
              <LuxuryButton size="md" className="w-full sm:w-auto">
                Open Document Vault
              </LuxuryButton>
            </a>
            <a href="/messages">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Message Specialist
              </Button>
            </a>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsConciergeOpen(true)}
              className="w-full sm:w-auto border-[#C8A951]/50"
            >
              Ask AI Concierge
            </Button>
          </div>
        </Glass3DCard>
      </Container>

      {/* Gamified Visa Journey Tracker */}
      <Container size="2xl" id="journey">
        <GamifiedJourneyTracker
          caseNumber="VH-2026-SG-4921"
          destinationCountry="Singapore"
          visaStream="Employment Pass (COMPASS Tier 1)"
        />
      </Container>

      {/* Interactive 5-Stage Visa Application Progress Tracker */}
      <Container size="2xl">
        <Card variant="luxury" goldDivider className="p-6 md:p-8 bg-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                Live Milestone Tracking • Click Any Stage to Inspect Deliverables
              </span>
              <h2 className="text-xl font-bold text-[#0D3B2E]">Application Progression Status</h2>
            </div>
            <EmeraldBadge variant="brand" size="md">
              Stage 2 of 5: Document Audit (80% Ready)
            </EmeraldBadge>
          </div>

          {/* Interactive 5-Stage Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {MILESTONE_STEPS.map((step) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isSelected = selectedStepId === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelectedStepId(step.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all relative cursor-pointer ${
                    isCurrent
                      ? 'border-[#0D3B2E] bg-[#E3EFEA]/40 shadow-xs ring-2 ring-[#C8A951]'
                      : isCompleted
                        ? 'border-[#86EFAC] bg-[#F0FDF4]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#C8A951]'
                  } ${isSelected && !isCurrent ? 'ring-2 ring-[#0D3B2E]' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-[#15803D] text-white'
                          : isCurrent
                            ? 'bg-[#0D3B2E] text-[#C8A951] ring-1 ring-[#C8A951]'
                            : 'bg-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      {isCompleted ? '✓' : step.id}
                    </span>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                      {step.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-bold text-[#0D3B2E]">{step.title}</h3>
                    <p className="text-[11px] text-[#475569] leading-relaxed">{step.subtitle}</p>
                  </div>

                  <div className="pt-2 border-t border-black/5 text-[10px] font-medium text-[#64748B] w-full">
                    {step.date}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Selected Milestone Detail Inspection Bar */}
          <div className="mt-6 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand" size="sm">
                  Stage {activeMilestone.id}: {activeMilestone.title}
                </Badge>
                <span className="text-xs font-mono font-semibold text-[#0D3B2E]">
                  SLA Target: {activeMilestone.slaTarget}
                </span>
                <span className="text-xs text-[#64748B]">
                  • Gate: {activeMilestone.consularGate}
                </span>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-1.5 mt-1 text-xs text-[#111827]">
                {activeMilestone.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#0D3B2E] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href="/documents" className="shrink-0">
              <Button variant="outline" size="sm">
                Inspect Stage Dossier →
              </Button>
            </a>
          </div>
        </Card>
      </Container>

      {/* Main Grid: Urgent Action Required & Recent Activity */}
      <Container size="2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Urgent Actions Column (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-[#0D3B2E]">Urgent Action Required</h2>

            {/* Missing Bank Statement Card */}
            <Card
              variant="default"
              className="border-l-4 border-l-[#B91C1C] border-[#E2E8F0] bg-white p-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">
                      Action Required
                    </Badge>
                    <span className="text-xs text-[#B91C1C] font-semibold">
                      Due by Nov 22, 2026
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    Upload Recent Bank Statement (Last 6 Months)
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    MOM consular guidelines require proof of fixed monthly salary credits. Please
                    upload an official stamped e-statement showing October deposits.
                  </p>
                </div>
                <a href="/documents" className="shrink-0">
                  <LuxuryButton size="sm">Upload File →</LuxuryButton>
                </a>
              </div>
            </Card>

            {/* Educational Credential Progress */}
            <Card
              variant="default"
              className="border-l-4 border-l-[#15803D] border-[#E2E8F0] bg-white p-6 shadow-xs"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                  <span className="text-xs text-[#15803D] font-semibold">Credential Cleared</span>
                </div>
                <h3 className="text-base font-bold text-[#111827]">
                  Degree Certificate Authentication Completed
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  BSc in Computer Science has been authenticated via DataFlow and confirmed on the
                  Ministry of Manpower institution registry. (Points Awarded: 20/20).
                </p>
              </div>
            </Card>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <StatKpiCard
                label="Document Readiness"
                value="4 of 6 (67%)"
                subvalue="1 item pending upload"
                trend={{ label: 'Action Needed', direction: 'neutral' }}
              />
              <StatKpiCard
                label="COMPASS Score"
                value="50 / 40 Points"
                subvalue="Passing Threshold Exceeded"
                trend={{ label: '+10 Bonus Pts', direction: 'up' }}
              />
              <StatKpiCard
                label="Processing Window"
                value="3 – 5 Weeks"
                subvalue="MOM Standard Speed"
                trend={{ label: 'On Track', direction: 'up' }}
              />
            </div>
          </div>

          {/* Activity Column (1 Col) */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-[#0D3B2E]">Case Audit Log</h2>
            <Card variant="luxury" goldDivider className="p-5 bg-white flex flex-col gap-4">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Recent Verified Events
              </span>
              <div className="flex flex-col gap-4 divide-y divide-[#F1F5F9]">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="pt-3 first:pt-0 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0D3B2E]">{act.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#475569] leading-relaxed">{act.description}</p>
                    <span className="text-[10px] text-[#64748B] italic">By {act.actor}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {/* Built-in AI Concierge Drawer (Always rendered as interactive panel or expandable drawer) */}
      <Container size="2xl">
        <GlassCard
          intensity="luxury"
          goldAccent
          className="p-6 bg-white/90 border border-[#C8A951]/45"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-[#0D3B2E] text-[#C8A951] font-bold text-sm flex items-center justify-center border border-[#C8A951]/50">
                AI
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#0D3B2E]">
                    Built-in AI Visa Concierge Drawer
                  </h2>
                  <EmeraldBadge variant="gold" size="sm" dot={false}>
                    Scoped Case Context • ADR-012 Shielded
                  </EmeraldBadge>
                </div>
                <p className="text-xs text-[#475569]">
                  Instant answers calibrated to Case VH-2026-SG-4921 & MOM COMPASS rules.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Explain my COMPASS Score (50/40)',
                'Bank Statement Stamping Rules',
                'When is my IPA expected?',
              ].map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  type="button"
                  onClick={() => handleConciergePrompt(quickPrompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#F0F7F4] text-[#0D3B2E] border border-[#0D3B2E]/20 text-[11px] font-semibold hover:border-[#C8A951] transition-colors cursor-pointer"
                >
                  {quickPrompt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
            {conciergeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-white border border-[#E2E8F0] text-[#111827]'
                    : 'bg-[#0D3B2E] text-white self-end max-w-xl'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#C8A951]">
                    {msg.role === 'assistant' ? 'VisaHobe AI Concierge' : 'You'}
                  </span>
                  <span className="text-[10px] opacity-75">{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConciergePrompt(conciergeInput);
            }}
            className="mt-4 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={conciergeInput}
              onChange={(e) => setConciergeInput(e.target.value)}
              placeholder="Ask the AI Concierge about your Singapore EP documents, COMPASS points, or timeline..."
              aria-label="Ask AI Concierge"
              className="flex-1 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
            />
            <LuxuryButton type="submit" size="sm">
              Send to Concierge
            </LuxuryButton>
          </form>
        </GlassCard>
      </Container>

      {/* Floating Glass Dock Navigation (Hidden on Mobile for clean touch controls) */}
      <FloatingGlassDock items={dashboardDockItems} position="floating" hideOnMobile={true} />
    </AuroraParallaxBackdrop>
  );
}
