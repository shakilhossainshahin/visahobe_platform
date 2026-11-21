'use client';

import React from 'react';
import { BrowserLiveViewer, Container, GlassCard, EmeraldBadge } from '@visahobe/ui';

export default function ClientLiveStreamPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Header */}
      <section className="border-b border-[#E2E8F0] bg-white py-8">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EmeraldBadge variant="luxury">Real-Time Consular Stream</EmeraldBadge>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Case VH-2026-SG-4921
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0D3B2E]">
                Live Application Filing Stream
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Observe the automated preparation of your Singapore Employment Pass application.
                Your stream is encrypted and strictly view-only to safeguard your privacy and
                consular credentials.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <main className="pt-8">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Viewer Column */}
            <div className="lg:col-span-3">
              <BrowserLiveViewer
                sessionId="sess-client-stream-4921"
                caseId="case-sg-4921"
                caseNumber="VH-2026-SG-4921"
                destinationCountry="SG"
                status="active"
                streamUrl="wss://stream.visahobe.com/vnc/sess-client-stream-4921"
                isClientViewOnly={true}
                userRole="client"
                takeoverMode="view_only"
                currentUrl="https://eservices.ica.gov.sg/sgarrivalcard/"
              />
            </div>

            {/* Right Information Sidebar */}
            <div className="space-y-6">
              <GlassCard intensity="luxury" className="p-5">
                <h3 className="font-heading text-sm font-bold text-[#0D3B2E] uppercase tracking-wider mb-3">
                  Zero-Trust Stream Security
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>
                      <strong>View-Only Invariant:</strong> Clients receive read-only frames.
                      Arbitrary input injection is physically disabled.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>
                      <strong>PII Shield:</strong> Passports, cards, and passwords are masked with
                      cryptographic hashes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>
                      <strong>Consular Safety Gate:</strong> Live payment or oath signing pauses
                      automatically for human authorization.
                    </span>
                  </li>
                </ul>
              </GlassCard>

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm text-xs text-slate-600">
                <h4 className="font-heading font-bold text-[#0D3B2E] mb-1">
                  Questions or Need Assistance?
                </h4>
                <p className="mb-3">Your designated case manager is monitoring this session.</p>
                <a
                  href="/messages"
                  className="inline-flex items-center text-xs font-semibold text-[#0D3B2E] hover:underline"
                >
                  Message Case Specialist &rarr;
                </a>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
