import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { NavbarShell, FooterShell, Button, Badge } from '@visahobe/ui';

export const metadata: Metadata = {
  title: 'Applicant Workspace & Case Tracker | VisaHobe Client Portal',
  description:
    'Secure applicant portal for real-time visa case tracking, document vault management, and direct communication with licensed immigration specialists.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'My Cases', href: '/#cases' },
    { label: 'Document Vault', href: '/documents' },
    { label: 'Messages', href: '/messages' },
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
        <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">
          Client Workspace
        </span>
      </div>
    </a>
  );

  const navActions = (
    <div className="flex items-center gap-3">
      <Badge variant="brand" size="sm" className="hidden md:inline-flex">
        🇸🇬 SG EP • VH-2026-SG-4921
      </Badge>
      <div className="hidden sm:flex flex-col items-end text-xs">
        <span className="font-semibold text-[#0D3B2E]">Tanvir Ahmed</span>
        <span className="text-[10px] text-[#64748B]">Primary Applicant</span>
      </div>
      <a href="http://localhost:3000/login">
        <Button variant="ghost" size="sm" className="text-xs text-[#64748B] hover:text-[#0D3B2E]">
          Sign Out
        </Button>
      </a>
    </div>
  );

  const footerColumns = [
    {
      title: 'Client Workspace',
      links: [
        { label: 'Case Overview', href: '/' },
        { label: 'Document Vault', href: '/documents' },
        { label: 'Specialist Messages', href: '/messages' },
        { label: 'Filing Timeline', href: '/#timeline' },
      ],
    },
    {
      title: 'Security & Compliance',
      links: [
        { label: 'PostgreSQL Row-Level Security', href: '/#security' },
        { label: 'End-to-End PII Redaction', href: '/#security' },
        { label: 'SOC 2 Type II Standards', href: '/#security' },
        { label: 'Applicant Data Privacy', href: '/#security' },
      ],
    },
    {
      title: 'Case Assistance',
      links: [
        { label: 'Assigned Verifier Notice', href: '/messages' },
        { label: 'Consular Fee Schedule', href: '/documents' },
        { label: 'Biometric Prep Guide', href: '/#timeline' },
      ],
    },
  ];

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#E3EFEA] selection:text-[#0D3B2E]">
        <NavbarShell
          brand={brandNode}
          navLinks={navLinks}
          actions={navActions}
          variant="glass"
          isSticky={true}
        />
        <main className="flex-1 w-full">{children}</main>
        <FooterShell
          brand={brandNode}
          columns={footerColumns}
          disclaimer="VisaHobe Client Workspace is an encrypted multi-tenant operational environment. Strict PostgreSQL Row-Level Security (RLS) is enforced across all applicant dossiers. Government visa approval determinations remain under the exclusive sovereign jurisdiction of foreign consular authorities."
        />
      </body>
    </html>
  );
}
