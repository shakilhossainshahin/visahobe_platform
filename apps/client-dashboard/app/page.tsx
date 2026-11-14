'use client';

import React from 'react';
import { Container, Card, GlassCard, Badge, Button } from '@visahobe/ui';

interface MilestoneStep {
  id: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string;
}

const MILESTONE_STEPS: MilestoneStep[] = [
  {
    id: 1,
    title: 'Intake Submitted',
    subtitle: 'Eligibility criteria evaluated & dossier initialized',
    status: 'completed',
    date: 'Nov 02, 2026',
  },
  {
    id: 2,
    title: 'AI & Specialist Document Audit',
    subtitle: 'OCR check, degree credentialing & specialist verification',
    status: 'current',
    date: 'In Progress • Est. Nov 20',
  },
  {
    id: 3,
    title: 'Embassy File Preparation',
    subtitle: 'MOM Form 8 digital dossier & employer submission pack',
    status: 'upcoming',
    date: 'Est. Nov 28, 2026',
  },
  {
    id: 4,
    title: 'Biometrics & Consular Submission',
    subtitle: 'IPA issuance & biometric registration appointment',
    status: 'upcoming',
    date: 'Est. Dec 05, 2026',
  },
  {
    id: 5,
    title: 'Decision & Pass Issuance',
    subtitle: 'Official MOM digital Employment Pass delivery',
    status: 'upcoming',
    date: 'Est. Dec 15, 2026',
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

export default function ClientDashboardOverviewPage() {
  return (
    <div className="py-8 md:py-12 flex flex-col gap-8">
      {/* Top Header Card */}
      <Container size="2xl">
        <GlassCard
          intensity="elevated"
          className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/95"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" size="md">
                Active Application
              </Badge>
              <Badge variant="neutral" size="sm">
                Case ID: VH-2026-SG-4921
              </Badge>
              <span className="text-xs text-[#64748B] font-medium">
                • Target Submission: Dec 15, 2026
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0D3B2E]">
              Singapore Employment Pass (COMPASS Tier 1)
            </h1>
            <p className="text-xs md:text-sm text-[#475569]">
              Assigned Specialist:{' '}
              <span className="font-semibold text-[#0D3B2E]">
                Sarah Jenkins (Senior Immigration Specialist)
              </span>{' '}
              • Ministry of Manpower Registered
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <a href="/documents">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Open Document Vault
              </Button>
            </a>
            <a href="/messages">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Message Specialist
              </Button>
            </a>
          </div>
        </GlassCard>
      </Container>

      {/* Visual 5-Stage Milestone Tracker */}
      <Container size="2xl">
        <Card variant="default" className="p-6 md:p-8 bg-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                Live Milestone Tracking
              </span>
              <h2 className="text-xl font-bold text-[#0D3B2E]">Application Progression Status</h2>
            </div>
            <Badge variant="brand" size="md">
              Stage 2 of 5: Document Audit (80% Ready)
            </Badge>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {MILESTONE_STEPS.map((step) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all relative ${
                    isCurrent
                      ? 'border-[#0D3B2E] bg-[#E3EFEA]/30 shadow-xs ring-1 ring-[#0D3B2E]'
                      : isCompleted
                        ? 'border-[#86EFAC] bg-[#F0FDF4]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-[#15803D] text-white'
                          : isCurrent
                            ? 'bg-[#0D3B2E] text-white animate-pulse'
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

                  <div className="pt-2 border-t border-black/5 text-[10px] font-medium text-[#64748B]">
                    {step.date}
                  </div>
                </div>
              );
            })}
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
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Upload Recent Bank Statement (Last 6 Months)
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    MOM consular guidelines require proof of fixed monthly salary credits. Please
                    upload an official stamped e-statement showing October deposits.
                  </p>
                </div>
                <a href="/documents" className="shrink-0">
                  <Button variant="primary" size="sm">
                    Upload File →
                  </Button>
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
                <h3 className="text-base font-bold text-[#0F172A]">
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
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-xs text-[#64748B]">Document Readiness</span>
                <span className="text-xl font-bold text-[#0D3B2E]">4 of 6 (67%)</span>
                <span className="text-[11px] text-[#15803D]">1 item pending upload</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-xs text-[#64748B]">COMPASS Score</span>
                <span className="text-xl font-bold text-[#0D3B2E]">50 / 40 Points</span>
                <span className="text-[11px] text-[#15803D]">Passing Threshold Exceeded</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-xs text-[#64748B]">Processing Window</span>
                <span className="text-xl font-bold text-[#0D3B2E]">3 – 5 Weeks</span>
                <span className="text-[11px] text-[#64748B]">MOM Standard Speed</span>
              </div>
            </div>
          </div>

          {/* Activity Column (1 Col) */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-[#0D3B2E]">Case Audit Log</h2>
            <Card variant="default" className="p-5 bg-white flex flex-col gap-4">
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
    </div>
  );
}
