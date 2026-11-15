'use client';

import React, { useState } from 'react';
import {
  Container,
  Section,
  Button,
  LuxuryButton,
  GlassCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  EmeraldBadge,
  StatKpiCard,
} from '@visahobe/ui';

interface DestinationPathway {
  id: string;
  country: string;
  slug: string;
  flag: string;
  title: string;
  category: string;
  processingTime: string;
  approvalRate: string;
  transparentPricing: string;
  govFeeNote: string;
  minRequirements: string;
  popular: boolean;
}

const POPULAR_DESTINATIONS: DestinationPathway[] = [
  {
    id: 'singapore',
    country: 'Singapore',
    slug: 'singapore',
    flag: '🇸🇬',
    title: 'Employment Pass (COMPASS)',
    category: 'Skilled Work',
    processingTime: '3-8 Weeks',
    approvalRate: '99.4%',
    transparentPricing: '$290 Service + S$360 MOM Fee',
    govFeeNote: 'Direct MOM eService Lodgment',
    minRequirements: 'Degree + Salary S$5,600+',
    popular: true,
  },
  {
    id: 'germany',
    country: 'Germany / Schengen',
    slug: 'germany',
    flag: '🇩🇪',
    title: 'EU Blue Card & Opportunity Card',
    category: 'Skilled Migration',
    processingTime: '6-12 Weeks',
    approvalRate: '98.8%',
    transparentPricing: '$340 Service + €100 Embassy Fee',
    govFeeNote: 'Anabin H+ & ZAB Pre-Verified',
    minRequirements: 'Recognized Degree + Job Offer',
    popular: true,
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    slug: 'united-kingdom',
    flag: '🇬🇧',
    title: 'Skilled Worker & Student Visa',
    category: 'Work & Study',
    processingTime: '4-8 Weeks',
    approvalRate: '99.1%',
    transparentPricing: '$320 Service + £719 UKVI Fee',
    govFeeNote: 'CoS / CAS + IHS Calibrated',
    minRequirements: 'Sponsor CoS / CAS + English B2',
    popular: true,
  },
  {
    id: 'canada',
    country: 'Canada',
    slug: 'canada',
    flag: '🇨🇦',
    title: 'Express Entry & Provincial Nominee',
    category: 'Permanent Residency',
    processingTime: '12-24 Weeks',
    approvalRate: '98.3%',
    transparentPricing: '$450 Service + C$1,525 IRCC Fee',
    govFeeNote: 'CRS + ECA + Biometrics Included',
    minRequirements: 'CRS Score + ECA + IELTS 7+',
    popular: false,
  },
  {
    id: 'australia',
    country: 'Australia',
    slug: 'australia',
    flag: '🇦🇺',
    title: 'Subclass 189 / 190 / 482',
    category: 'Skilled Migration',
    processingTime: '8-20 Weeks',
    approvalRate: '98.6%',
    transparentPricing: '$420 Service + A$4,770 DHA Fee',
    govFeeNote: 'SkillSelect EOI & Vetassess',
    minRequirements: 'Skill Assessment + 65+ Points',
    popular: false,
  },
  {
    id: 'uae',
    country: 'United Arab Emirates',
    slug: 'uae',
    flag: '🇦🇪',
    title: 'Golden Visa & Green Visa',
    category: 'Investors & Talent',
    processingTime: '2-4 Weeks',
    approvalRate: '99.6%',
    transparentPricing: '$260 Service + AED 3,700 ICP Fee',
    govFeeNote: '10-Year Residency Fast-Track',
    minRequirements: 'Executive or Specialized Talent',
    popular: false,
  },
];

const PURPOSE_META: Record<
  string,
  { label: string; categoryParam: string; readinessNote: string }
> = {
  skilled: {
    label: 'Skilled Employment & Work Permit',
    categoryParam: 'Skilled Work',
    readinessNote: 'Includes employer sponsor verification & contract compliance audit',
  },
  student: {
    label: 'Higher Education & Student Visa',
    categoryParam: 'Student Visa',
    readinessNote: 'Includes admission letter validation & financial solvency certification',
  },
  pr: {
    label: 'Permanent Residency & Migration',
    categoryParam: 'Permanent Residency',
    readinessNote: 'Includes points calculation, credential assessment & family accompaniment',
  },
  business: {
    label: 'Investor & Startup Founder',
    categoryParam: 'Investor / Business',
    readinessNote: 'Includes source-of-funds legal audit & golden residency structuring',
  },
};

export default function HomePage() {
  const [selectedQuickCountry, setSelectedQuickCountry] = useState<string>('singapore');
  const [selectedQuickPurpose, setSelectedQuickPurpose] = useState<string>('skilled');
  const [pathwayFilter, setPathwayFilter] = useState<string>('All');

  const activeHeroDestination =
    POPULAR_DESTINATIONS.find((d) => d.id === selectedQuickCountry) ?? POPULAR_DESTINATIONS[0]!;
  const activePurpose = PURPOSE_META[selectedQuickPurpose] ?? PURPOSE_META.skilled!;

  const filteredDestinations =
    pathwayFilter === 'All'
      ? POPULAR_DESTINATIONS
      : POPULAR_DESTINATIONS.filter((d) =>
          pathwayFilter === 'Popular' ? d.popular : d.category === pathwayFilter,
        );

  const workflowSteps = [
    {
      step: '01',
      title: 'Intelligent Intake',
      description:
        'Complete a streamlined 3-minute assessment. Our dynamic engine identifies the exact visa subclasses matching your nationality, education, and career profile.',
      badge: 'Step 1 • 3 Mins',
    },
    {
      step: '02',
      title: 'AI OCR & Document Validation',
      description:
        'Upload your passport, academic degrees, and employment proofs. Automated OCR inspects validity, formatting, and consular criteria instantly.',
      badge: 'Step 2 • Real-time',
    },
    {
      step: '03',
      title: 'Licensed Specialist Sign-Off',
      description:
        'Before any official submission, accredited immigration attorneys and case verifiers validate your dossier for 100% legal compliance.',
      badge: 'Step 3 • Verified',
    },
    {
      step: '04',
      title: 'Submission & Live Milestones',
      description:
        'Track consular appointments, biometric submissions, and visa approvals in real time through your unified client portal and mobile app.',
      badge: 'Step 4 • Complete',
    },
  ];

  const securityPillars = [
    {
      title: 'PostgreSQL Row-Level Security',
      description:
        'Client records and confidential dossiers are strictly locked at the database kernel level. Zero cross-tenant data leakage is guaranteed.',
      tag: 'Database Kernel Isolation',
    },
    {
      title: 'Defense-in-Depth PII Redaction',
      description:
        'Passports, national IDs, and private contact credentials are automatically sanitized across logs, traces, and metrics before storage.',
      tag: 'Automated PII Masking',
    },
    {
      title: 'Licensed Human Verifiers',
      description:
        'AI expedites the heavy lifting, but certified immigration lawyers sign off on every client application before embassy lodgment.',
      tag: 'Certified Counsel',
    },
    {
      title: 'Real-Time Embassy Policy Sync',
      description:
        'Consular rules, salary thresholds, and quota caps update in real time, preventing rejected filings due to outdated application forms.',
      tag: 'Live Policy Updates',
    },
  ];

  return (
    <div className="w-full flex flex-col font-sans bg-white text-[#111827]">
      {/* Executive Flagship Hero Section */}
      <Section
        variant="default"
        padding="xl"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-white border-b border-[#E2E8F0]"
      >
        {/* Subtle Decorative Luxury Emerald & Champagne Gold Orbs */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[380px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0D3B2E]/10 via-[#C8A951]/10 to-transparent blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <Container size="2xl" className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6 sm:gap-8">
            {/* Liquid Glass Status Pill with Champagne Gold Border */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Badge
                variant="glass"
                size="md"
                dot
                dotPulse
                className="shadow-sm border-[#C8A951]/50"
              >
                <span className="font-semibold text-[#0D3B2E]">
                  99.2% Verification Accuracy • AI + Licensed Human Verifiers
                </span>
              </Badge>
              <EmeraldBadge variant="gold" size="md" dot={false}>
                Flagship Consular Desk • B2C & B2B Partner Network
              </EmeraldBadge>
            </div>

            {/* Authoritative Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#0D3B2E] leading-[1.1]">
              Global Visas & Relocation Powered by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D3B2E] via-[#145342] to-[#C8A951]">
                Intelligent AI Operations
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-[#475569] max-w-2xl leading-relaxed">
              Experience transparent, error-free visa processing. Rapid automated eligibility
              scoring, instant document validation, and certified immigration specialist sign-offs
              in one modern platform.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a href="/assess" className="w-full sm:w-auto">
                <LuxuryButton size="lg" className="w-full sm:w-auto shadow-md">
                  Check Your Visa Eligibility Free
                </LuxuryButton>
              </a>
              <a href="#destinations" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Destinations & Streams
                </Button>
              </a>
            </div>

            {/* Live Executive Trust Metrics Strip (Liquid Glass KPI Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-2 text-left">
              <StatKpiCard
                label="Consular Approval Rate"
                value="99.2%"
                subvalue="Dual AI + Licensed Lawyer Sign-Off"
                trend={{ label: '+1.8% vs Industry', direction: 'up' }}
              />
              <StatKpiCard
                label="Dossiers Processed"
                value="18,450+"
                subvalue="Across 6 Sovereign Jurisdictions"
                trend={{ label: 'Zero SLA Breaches', direction: 'neutral' }}
              />
              <StatKpiCard
                label="OCR Document Audit"
                value="2.4 Mins"
                subvalue="Automated MRZ & Solvency Check"
                trend={{ label: '99.7% Precision', direction: 'up' }}
              />
              <StatKpiCard
                label="Fee Transparency"
                value="100%"
                subvalue="Official Gov Tariffs + Fixed Concierge"
                trend={{ label: 'Zero Hidden Markups', direction: 'neutral' }}
              />
            </div>

            {/* Interactive Instant Destination / Visa Selector */}
            <div className="w-full mt-2 sm:mt-4">
              <GlassCard
                intensity="luxury"
                goldAccent
                className="p-6 sm:p-8 text-left max-w-4xl mx-auto shadow-glass"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#C8A951]" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                      Instant Consular Pathway & Tariff Preview
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#0D3B2E] bg-[#F0F7F4] px-2.5 py-1 rounded-lg border border-[#0D3B2E]/15">
                    Live Policy Pack • Nov 2026
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <label
                      htmlFor="quick-country"
                      className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]"
                    >
                      Select Destination
                    </label>
                    <select
                      id="quick-country"
                      value={selectedQuickCountry}
                      onChange={(e) => setSelectedQuickCountry(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                    >
                      <option value="singapore">🇸🇬 Singapore (Employment Pass / Tech)</option>
                      <option value="germany">🇩🇪 Germany / Schengen (EU Blue Card)</option>
                      <option value="uk">🇬🇧 United Kingdom (Skilled Worker)</option>
                      <option value="canada">🇨🇦 Canada (Express Entry / PNP)</option>
                      <option value="australia">🇦🇺 Australia (PR / Subclass 189)</option>
                      <option value="uae">🇦🇪 United Arab Emirates (Golden Visa)</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <label
                      htmlFor="quick-purpose"
                      className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]"
                    >
                      Application Purpose
                    </label>
                    <select
                      id="quick-purpose"
                      value={selectedQuickPurpose}
                      onChange={(e) => setSelectedQuickPurpose(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                    >
                      <option value="skilled">Skilled Employment & Work Permit</option>
                      <option value="student">Higher Education & Student Visa</option>
                      <option value="pr">Permanent Residency & Migration</option>
                      <option value="business">Investor & Startup Founder</option>
                    </select>
                  </div>

                  <div className="w-full md:w-auto">
                    <a
                      href={`/assess?country=${encodeURIComponent(activeHeroDestination.country)}&category=${encodeURIComponent(activePurpose.categoryParam)}`}
                      className="w-full block"
                    >
                      <LuxuryButton size="md" className="w-full">
                        Evaluate Criteria
                      </LuxuryButton>
                    </a>
                  </div>
                </div>

                {/* Live Interactive Preview Output Panel */}
                <div className="mt-5 p-4 rounded-xl bg-white border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                      Selected Pathway
                    </span>
                    <p className="text-sm font-bold text-[#0D3B2E] mt-0.5">
                      {activeHeroDestination.flag} {activeHeroDestination.country} —{' '}
                      {activeHeroDestination.title}
                    </p>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      {activePurpose.readinessNote}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                      Processing & Approval Benchmark
                    </span>
                    <p className="text-sm font-bold text-[#111827] mt-0.5">
                      {activeHeroDestination.processingTime} •{' '}
                      <span className="text-[#15803D]">
                        {activeHeroDestination.approvalRate} Approved
                      </span>
                    </p>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      Criteria: {activeHeroDestination.minRequirements}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                      Transparent Tariff Schedule
                    </span>
                    <p className="text-sm font-mono font-bold text-[#0D3B2E] mt-0.5">
                      {activeHeroDestination.transparentPricing}
                    </p>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      {activeHeroDestination.govFeeNote}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[rgba(13,59,46,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
                  <span className="flex items-center gap-1.5 font-medium text-[#0D3B2E]">
                    ✓ No hidden fees
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#0D3B2E]">
                    ✓ Official embassy requirements
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#0D3B2E]">
                    ✓ Real-time consular guidelines
                  </span>
                </div>
              </GlassCard>
            </div>
          </div>
        </Container>
      </Section>

      {/* Popular Destinations & Streams */}
      <Section id="destinations" variant="muted" padding="lg">
        <Container size="2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="flex flex-col gap-2 max-w-xl">
              <EmeraldBadge variant="brand" size="sm" className="w-fit">
                Global Destinations
              </EmeraldBadge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0D3B2E]">
                High-Success Migration Pathways
              </h2>
              <p className="text-sm sm:text-base text-[#475569]">
                Verified work permits, skilled PR tracks, and study visas managed end-to-end with
                unmatched compliance accuracy and transparent statutory pricing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Popular', 'Skilled Work', 'Skilled Migration', 'Permanent Residency'].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setPathwayFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      pathwayFilter === filter
                        ? 'bg-[#0D3B2E] text-white border border-[#C8A951]/60 shadow-xs'
                        : 'bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#0D3B2E]/40'
                    }`}
                  >
                    {filter === 'All' ? 'All Pathways (6)' : filter}
                  </button>
                ),
              )}
              <a href="/countries">
                <Button variant="outline" size="sm">
                  View All Destinations →
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <Card
                key={dest.country}
                variant="luxury"
                goldDivider
                className="hover:border-[#0D3B2E]/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between bg-white"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl" aria-hidden="true">
                      {dest.flag}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="success" size="sm">
                        {dest.approvalRate} Approval
                      </Badge>
                      {dest.popular ? (
                        <EmeraldBadge variant="brand" size="sm" dot={false}>
                          High Demand
                        </EmeraldBadge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          {dest.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <a href={`/countries/${dest.slug}`} className="hover:underline">
                    <CardTitle className="text-lg font-bold text-[#0D3B2E]">
                      {dest.country}
                    </CardTitle>
                  </a>
                  <CardDescription className="text-sm font-medium text-[#111827]">
                    {dest.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2.5 pt-0 text-xs text-[#475569]">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Processing Estimate</span>
                    <span className="font-semibold text-[#111827]">{dest.processingTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Core Criteria</span>
                    <span className="font-semibold text-[#111827]">{dest.minRequirements}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Transparent Fee</span>
                    <span className="font-mono font-bold text-[#0D3B2E]">
                      {dest.transparentPricing}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex items-center gap-2">
                  <a href={`/countries/${dest.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Guide
                    </Button>
                  </a>
                  <a
                    href={`/assess?country=${encodeURIComponent(dest.country.toLowerCase())}`}
                    className="flex-1"
                  >
                    <LuxuryButton size="sm" className="w-full text-xs">
                      Assess Fit
                    </LuxuryButton>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* How VisaHobe AI + Human Works */}
      <Section
        id="how-it-works"
        variant="default"
        padding="lg"
        className="border-y border-[#E2E8F0] bg-white"
      >
        <Container size="2xl">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
            <EmeraldBadge variant="brand" size="sm">
              Operational Workflow
            </EmeraldBadge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0D3B2E]">
              How VisaHobe AI + Human Verification Works
            </h2>
            <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
              We eliminate visa anxiety through an engineered, transparent 4-stage pipeline that
              combines speed with rigorous legal scrutiny.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs relative overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="h-[2px] w-12 bg-gradient-to-r from-[#0D3B2E] to-[#C8A951]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-display font-extrabold text-[#0D3B2E]/25">
                    {step.step}
                  </span>
                  <Badge variant="brand" size="sm">
                    {step.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-[#0D3B2E]">{step.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Trust, Security & Compliance */}
      <Section id="security" variant="muted" padding="lg">
        <Container size="2xl">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="lg:w-5/12 flex flex-col gap-4">
              <EmeraldBadge variant="brand" size="sm" className="w-fit">
                Security & Compliance
              </EmeraldBadge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0D3B2E]">
                Enterprise Data Privacy & Legal Integrity
              </h2>
              <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
                Visa applications contain your most private identity documents. We built VisaHobe
                with banking-grade tenant boundaries, rigorous auditability, and zero PII leaks.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-[#111827] font-medium">
                    Strict PostgreSQL Row-Level Security on all database tables
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-[#111827] font-medium">
                    Mandatory Multi-Factor Authentication (MFA) for staff & verifiers
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-[#111827] font-medium">
                    Automated secret vault and automated PII scrubbing in all logs
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col gap-2"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                    {pillar.tag}
                  </span>
                  <h4 className="text-base font-bold text-[#111827]">{pillar.title}</h4>
                  <p className="text-xs text-[#475569] leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Bottom Banner */}
      <Section
        variant="brand"
        padding="lg"
        className="bg-[#0D3B2E] text-white text-center border-t-2 border-[#C8A951]"
      >
        <Container size="xl">
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <EmeraldBadge variant="gold" size="md">
              Instant Eligibility & Tariff Calculator
            </EmeraldBadge>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Ready to verify your visa eligibility?
            </h2>
            <p className="text-base text-white/80 leading-relaxed">
              Take our 3-minute preliminary assessment. Receive an immediate eligibility breakdown
              and step-by-step document checklist for your chosen destination.
            </p>
            <a href="/assess">
              <Button variant="gold" size="lg" className="shadow-lg">
                Launch Free Assessment →
              </Button>
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}
