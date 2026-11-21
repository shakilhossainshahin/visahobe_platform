'use client';

import React, { useState } from 'react';

export interface JourneyStage {
  id: number;
  key: string;
  title: string;
  shortLabel: string;
  status: 'completed' | 'current' | 'upcoming';
  slaTimeline: string;
  description: string;
  deliverables: string[];
  verifierBadge?: string;
}

const DEFAULT_STAGES: JourneyStage[] = [
  {
    id: 1,
    key: 'intake',
    title: 'Intelligent AI Intake',
    shortLabel: 'AI Intake',
    status: 'completed',
    slaTimeline: 'Completed in 4 Mins',
    description:
      'Dynamic COMPASS evaluation, nationality eligibility criteria, and tenant workspace initialization.',
    deliverables: [
      'COMPASS Preliminary Criteria (50/40 Points Verified)',
      'Encrypted PostgreSQL 16 Kernel RLS Workspace Locked',
      'Primary Specialist Verifier Assigned (Sarah Jenkins, Esq.)',
    ],
    verifierBadge: 'Verified & Signed',
  },
  {
    id: 2,
    key: 'ocr_vault',
    title: 'OCR Vault & Biometric Audit',
    shortLabel: 'OCR Vault',
    status: 'current',
    slaTimeline: 'In Progress • 48h Turnaround',
    description:
      'Automated MRZ checksum verification, degree accreditation check, and financial statement parsing.',
    deliverables: [
      'Passport MRZ & Bio-data Verified (99.8% Confidence)',
      'BSc Computer Science DataFlow International Authentication',
      'Action Item: Awaiting Stamped 6-Month Bank Statement',
    ],
    verifierBadge: 'In Verification',
  },
  {
    id: 3,
    key: 'form_autofill',
    title: 'Consular Form Auto-Fill & Mapping',
    shortLabel: 'Form Auto-Fill',
    status: 'upcoming',
    slaTimeline: 'Est. 3 Business Days',
    description:
      'Dynamic schema mapping of applicant credentials to official MOM Form 8 digital lodgment fields.',
    deliverables: [
      'MOM Form 8 Statutory Declaration Assembly',
      'Employer Sponsor ACRA Registration Match',
      'Consular Dry-Run Execution Trace',
    ],
    verifierBadge: 'Pending Previous Stage',
  },
  {
    id: 4,
    key: 'safety_gate',
    title: 'Consular Safety Gate Review',
    shortLabel: 'Safety Gate',
    status: 'upcoming',
    slaTimeline: 'Est. 24h Counsel Turnaround',
    description:
      'Mandatory human-in-the-loop review per ADR-011. Accredited legal counsel signs off on statutory filings.',
    deliverables: [
      'Legal Compliance Affidavit Sign-Off',
      'Biometric Appointment Preparation Pack',
      'Statutory Fee Schedule Authorization',
    ],
    verifierBadge: 'Licensed Attorney Gate',
  },
  {
    id: 5,
    key: 'embassy_submission',
    title: 'Consular Submission & Decision',
    shortLabel: 'Embassy Lodgment',
    status: 'upcoming',
    slaTimeline: '10–14 Business Days',
    description:
      'Official lodgment through government portal, IPA issuance tracking, and biometric appointment scheduling.',
    deliverables: [
      'Official MOM Lodgment Reference & Receipt',
      'In-Principle Approval (IPA) Letter Dispatch',
      'Digital Employment Pass (SGWorkPass) Issuance',
    ],
    verifierBadge: 'Sovereign Consular Action',
  },
];

export function GamifiedJourneyTracker({
  stages = DEFAULT_STAGES,
  caseNumber = 'VH-2026-SG-4921',
  destinationCountry = 'Singapore',
  visaStream = 'Employment Pass (COMPASS)',
}: {
  stages?: JourneyStage[];
  caseNumber?: string;
  destinationCountry?: string;
  visaStream?: string;
}) {
  const [selectedStageId, setSelectedStageId] = useState<number>(2);

  const activeStage = stages.find((s) => s.id === selectedStageId) ?? stages[1]!;

  // Calculate completion percentage: Completed=100%, Current=50%, Upcoming=0%
  const totalWeight = stages.length;
  const completedWeight = stages.filter((s) => s.status === 'completed').length;
  const currentWeight = stages.filter((s) => s.status === 'current').length * 0.5;
  const progressPercent = Math.round(((completedWeight + currentWeight) / totalWeight) * 100);

  // Circular gauge constants
  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercent / 100) * circleCircumference;

  return (
    <div
      className="w-full rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-4 sm:p-6 text-[#0F172A]"
      data-testid="gamified-journey-tracker"
    >
      {/* Top Header Strip: Case + Circular Progress Meter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D3B2E]">
              Live Application Pathway
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D3B2E] mt-0.5">
            {destinationCountry} {visaStream}
          </h3>
          <span className="text-xs font-mono text-[#64748B]">Case Ref: {caseNumber}</span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center gap-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-2.5 self-stretch sm:self-auto">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                fill="none"
                stroke="#0D3B2E"
                strokeWidth="10"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute font-display font-extrabold text-xs text-[#0D3B2E]">
              {progressPercent}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#0D3B2E]">Dossier Velocity</span>
            <span className="text-[11px] font-semibold text-emerald-700">
              On Track for MOM EP Approval
            </span>
            <span className="text-[10px] text-[#64748B]">Next: Consular Form Auto-Fill</span>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Pipeline Stage Steps */}
      <div className="my-6">
        <div className="flex items-center justify-between relative overflow-x-auto pb-2 gap-2">
          {/* Connector Rail behind steps */}
          <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-[#E2E8F0] -z-0" />

          {stages.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={`relative z-10 flex flex-col items-center gap-2 p-2 rounded-xl transition-all min-w-[90px] cursor-pointer text-center group ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
                aria-pressed={isSelected}
              >
                {/* Stage Badge Node */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                    isCompleted
                      ? 'bg-[#15803D] text-white ring-4 ring-emerald-100'
                      : isCurrent
                        ? 'bg-[#0D3B2E] text-white ring-4 ring-[#C8A951]/40 animate-pulse'
                        : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#CBD5E1]'
                  }`}
                >
                  {isCompleted ? '✓' : stage.id}
                </div>

                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isSelected ? 'text-[#0D3B2E]' : 'text-[#475569] group-hover:text-[#0D3B2E]'
                    }`}
                  >
                    {stage.shortLabel}
                  </span>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-tight ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrent
                          ? 'text-[#C8A951] font-bold'
                          : 'text-[#94A3B8]'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-5 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0D3B2E] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                STAGE 0{activeStage.id}
              </span>
              <h4 className="font-bold text-base text-[#0D3B2E]">{activeStage.title}</h4>
            </div>
            <p className="text-xs text-[#64748B] mt-1">{activeStage.description}</p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <span className="text-xs font-mono font-semibold text-[#0D3B2E] bg-white px-3 py-1 rounded-lg border border-[#E2E8F0]">
              ⏱ {activeStage.slaTimeline}
            </span>
            {activeStage.verifierBadge && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                {activeStage.verifierBadge}
              </span>
            )}
          </div>
        </div>

        {/* Deliverables Checklist */}
        <div className="mt-3.5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
            Stage Deliverables & Verification Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeStage.deliverables.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#334155]"
              >
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
