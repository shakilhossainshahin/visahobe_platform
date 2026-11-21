'use client';

import React, { useState } from 'react';
import { BrowserLiveViewer, LuxuryButton, EmeraldBadge } from '@visahobe/ui';

interface MockBrowserCase {
  id: string;
  caseNumber: string;
  destinationCountry: string;
  portalUrl: string;
  applicantName: string;
  status: 'active' | 'paused_safety_gate' | 'paused_human_takeover' | 'terminated';
  safetyReason?: string;
  blockedAction?: string;
}

const ACTIVE_SESSIONS: MockBrowserCase[] = [
  {
    id: 'sess-sg-01',
    caseNumber: 'VH-2026-SG-4921',
    destinationCountry: 'SG',
    portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
    applicantName: 'Tanvir A. (CL-8821)',
    status: 'active',
  },
  {
    id: 'sess-ae-02',
    caseNumber: 'VH-2026-AE-5012',
    destinationCountry: 'AE',
    portalUrl: 'https://smartservices.icp.gov.ae/echannels/web/client/default.html',
    applicantName: 'Fahim K. (CL-9011)',
    status: 'paused_safety_gate',
    safetyReason:
      'Autonomous execution of live consular portal payment is strictly forbidden. Human financial authorization required.',
    blockedAction: 'portal_payment',
  },
  {
    id: 'sess-tr-03',
    caseNumber: 'VH-2026-TR-1082',
    destinationCountry: 'TR',
    portalUrl: 'https://www.evisa.gov.tr/en/',
    applicantName: 'Ananya R. (CL-3392)',
    status: 'active',
  },
];

export default function BrowserOperatorPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sessions, setSessions] = useState<MockBrowserCase[]>(ACTIVE_SESSIONS);

  const current = sessions[selectedIndex] ?? sessions[0]!;

  const handleTakeover = () => {
    setSessions((prev) =>
      prev.map((s, idx) => (idx === selectedIndex ? { ...s, status: 'paused_human_takeover' } : s)),
    );
  };

  const handleRelease = () => {
    setSessions((prev) =>
      prev.map((s, idx) => (idx === selectedIndex ? { ...s, status: 'active' } : s)),
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Banner */}
      <section className="border-b border-[#E2E8F0] bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EmeraldBadge variant="luxury">Isolated Chromium Runtime</EmeraldBadge>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Container Port 6080 / 9222
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0D3B2E]">
                Live Consular Browser Operations
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Supervise automated browser filing agents in real-time. Human operators can take
                over interactive control during CAPTCHA challenges or consular payment gates per
                ADR-011.
              </p>
            </div>

            {/* Session Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {sessions.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition border ${
                    idx === selectedIndex
                      ? 'bg-[#0D3B2E] text-white border-[#C8A951]/60 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s.status === 'active'
                          ? 'bg-emerald-400'
                          : s.status === 'paused_safety_gate'
                            ? 'bg-amber-400'
                            : 'bg-blue-400'
                      }`}
                    />
                    <span>{s.caseNumber}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Viewer Column (3 Cols) */}
          <div className="lg:col-span-3">
            <BrowserLiveViewer
              sessionId={current.id}
              caseId={current.caseNumber}
              caseNumber={current.caseNumber}
              destinationCountry={current.destinationCountry}
              status={current.status}
              streamUrl={`wss://stream.visahobe.internal/vnc/${current.id}`}
              isClientViewOnly={false}
              userRole="browser_operator"
              takeoverMode={
                current.status === 'paused_human_takeover' ? 'interactive' : 'view_only'
              }
              safetyPauseReason={current.safetyReason}
              blockedAction={current.blockedAction}
              currentUrl={current.portalUrl}
              onRequestTakeover={handleTakeover}
              onReleaseTakeover={handleRelease}
              onRefreshStream={() => {}}
            />
          </div>

          {/* Right Sidebar: Active Container Telemetry */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <h3 className="font-heading text-sm font-bold text-[#0D3B2E] uppercase tracking-wider mb-4">
                Container Telemetry
              </h3>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Applicant:</dt>
                  <dd className="font-semibold text-slate-800">{current.applicantName}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Virtual Display:</dt>
                  <dd className="font-mono text-slate-800">:99 (Xvfb 1280x800)</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">VNC Security:</dt>
                  <dd className="font-semibold text-emerald-700">Token Auth (Zero -nopw)</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Idle Cleanup TTL:</dt>
                  <dd className="font-mono text-slate-800">10m Automatic</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">PII Shield:</dt>
                  <dd className="font-semibold text-emerald-700">Active (Masked)</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-[#C8A951]/40 bg-white/90 backdrop-blur-md p-5 shadow-sm">
              <h3 className="font-heading text-sm font-bold text-[#0D3B2E] mb-2">
                Consular Safety Matrix (ADR-011)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Live payments, irreversible biometric VAC slots, and sworn perjury affidavits
                strictly require human staff authorization.
              </p>
              <LuxuryButton
                variant="primary"
                className="w-full text-xs py-2"
                onClick={handleTakeover}
              >
                Inspect Selected Case
              </LuxuryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
