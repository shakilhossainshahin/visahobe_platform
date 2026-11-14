import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { NavbarShell, FooterShell, Button } from '@visahobe/ui';

export const metadata: Metadata = {
  title: 'VisaHobe — AI-Powered Global Visa Operations & Relocation Platform',
  description:
    'Experience transparent, rapid visa processing with automated eligibility assessment, instant document verification, and licensed immigration expert sign-off.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navLinks = [
    { label: 'Services', href: '/#services' },
    { label: 'Destinations', href: '/countries' },
    { label: 'Eligibility Check', href: '/assess' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Trust & Security', href: '/#security' },
  ];

  const navActions = (
    <div className="flex items-center gap-2.5">
      <a href="/login">
        <Button variant="ghost" size="sm">
          Client Login
        </Button>
      </a>
      <a href="/assess">
        <Button variant="primary" size="sm">
          Start Assessment
        </Button>
      </a>
    </div>
  );

  const footerColumns = [
    {
      title: 'Visa Categories',
      links: [
        { label: 'Skilled Migration', href: '/#services' },
        { label: 'Student Visas', href: '/#services' },
        { label: 'Work Permits & Employment', href: '/#services' },
        { label: 'Investor & Business Visas', href: '/#services' },
      ],
    },
    {
      title: 'Destinations',
      links: [
        { label: 'Singapore (Employment Pass)', href: '/countries/singapore' },
        { label: 'Germany (EU Blue Card)', href: '/countries/germany' },
        { label: 'United Kingdom (Skilled Worker)', href: '/countries/united-kingdom' },
        { label: 'Canada (Express Entry & PNP)', href: '/countries/canada' },
        { label: 'Australia (Skilled Migration)', href: '/countries/australia' },
        { label: 'UAE (Golden Visa)', href: '/countries/uae' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'Interactive Assessment', href: '/assess' },
        { label: 'Client Portal Login', href: '/login' },
        { label: 'Verification Engine', href: '/#how-it-works' },
        { label: 'Enterprise Security', href: '/#security' },
      ],
    },
    {
      title: 'Legal & Trust',
      links: [
        { label: 'Privacy Policy & RLS Invariants', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security & PII Shield', href: '/#security' },
        { label: 'Responsible AI Disclosure', href: '/ai-ethics' },
      ],
    },
  ];

  const disclaimer =
    'VisaHobe is an independent technology operations and applicant enablement platform connecting applicants with certified operations specialists and licensed immigration attorneys. VisaHobe is not an embassy, consulate, or government visa issuing authority. Visa approvals remain at the sole legal discretion of relevant governmental immigration authorities.';

  const bottomLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Security Overview', href: '/#security' },
    { label: 'Compliance Status', href: '/status' },
  ];

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FDFDFD] text-[#0F172A] antialiased selection:bg-[#E3EFEA] selection:text-[#0D3B2E]">
        <NavbarShell variant="glass" isSticky={true} navLinks={navLinks} actions={navActions} />
        <main className="flex-1 w-full">{children}</main>
        <FooterShell
          brandDescription="The intelligent multi-tenant visa operating system combining rapid AI document extraction with licensed immigration professional sign-offs."
          columns={footerColumns}
          disclaimer={disclaimer}
          bottomLinks={bottomLinks}
        />
      </body>
    </html>
  );
}
