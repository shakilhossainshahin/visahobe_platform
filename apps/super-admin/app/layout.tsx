import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { NavbarShell, FooterShell, Button, Badge } from '@visahobe/ui';

export const metadata: Metadata = {
  title: 'VisaHobe Command Center | Operations & Case Management',
  description:
    'Internal operations command center for case managers, document verifiers, and platform administrators. Governed by strict MFA and RBAC boundaries.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navLinks = [
    { label: 'Case Queue', href: '/' },
    { label: 'Document Audit', href: '/audit' },
    { label: 'CMS Editorial', href: '/cms' },
    { label: 'Audit Logs', href: '/logs' },
  ];

  const brandNode = (
    <a href="/" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#0D3B2E] flex items-center justify-center text-white font-bold text-sm shadow-xs">
        VH
      </div>
      <div className="flex flex-col">
        <span className="font-display font-bold text-base text-[#0D3B2E] leading-tight">
          VisaHobe
        </span>
        <span className="text-[10px] font-semibold text-[#145342] uppercase tracking-wider">
          Command Center
        </span>
      </div>
    </a>
  );

  const navActions = (
    <div className="flex items-center gap-3">
      {/* Active Tenant Boundary Pill */}
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#475569]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
        <span>HQ • Master Tenant</span>
      </div>

      {/* Staff MFA Verified Status Badge */}
      <Badge variant="brand" size="sm" className="hidden sm:inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#86EFAC] animate-pulse" />
        <span>MFA Verified • Staff (admin)</span>
      </Badge>

      <div className="hidden md:flex flex-col items-end text-xs">
        <span className="font-semibold text-[#0D3B2E]">Sarah Jenkins</span>
        <span className="text-[10px] text-[#64748B]">Lead Verifier • MOM #EP-8842</span>
      </div>

      <a href="http://localhost:3000/login">
        <Button variant="ghost" size="sm" className="text-xs text-[#64748B] hover:text-[#0D3B2E]">
          Exit Console
        </Button>
      </a>
    </div>
  );

  const footerColumns = [
    {
      title: 'Operations Surfaces',
      links: [
        { label: 'Operational Case Queue', href: '/' },
        { label: 'Document Verification', href: '/audit' },
        { label: 'CMS Policy Review', href: '/cms' },
        { label: 'Immutable Audit Trail', href: '/logs' },
      ],
    },
    {
      title: 'Customer Endpoints',
      links: [
        { label: 'Public Portal (Port 3000)', href: 'http://localhost:3000' },
        { label: 'Client Workspace (Port 3001)', href: 'http://localhost:3001' },
        { label: 'Country Policy Guides', href: 'http://localhost:3000/countries' },
        { label: 'Intake Wizard', href: 'http://localhost:3000/assess' },
      ],
    },
    {
      title: 'Compliance & Governance',
      links: [
        { label: 'MFA Policy (AAL2 Required)', href: '/logs' },
        { label: 'Kernel RLS Enforcement', href: '/logs' },
        { label: 'Zero-PII Storage Policy', href: '/logs' },
        { label: 'System Health Check', href: '/' },
      ],
    },
  ];

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0D3B2E" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased">
        <NavbarShell brand={brandNode} navLinks={navLinks} actions={navActions} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <FooterShell
          columns={footerColumns}
          disclaimer="RESTRICTED SYSTEM: VisaHobe Internal Command Center. Access is restricted to authorized personnel with active MFA (AAL2) verification. All actions are cryptographically sealed in the immutable audit trail."
        />
      </body>
    </html>
  );
}
