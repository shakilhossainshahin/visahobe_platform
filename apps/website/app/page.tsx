'use client';

import React, { useState } from 'react';
import {
  Container,
  Section,
  Button,
  LuxuryButton,
  Badge,
  EmeraldBadge,
  StatKpiCard,
  InteractiveVisaGlobe,
  AuroraParallaxBackdrop,
  ParallaxStage,
  ParallaxLayer,
  ScrollReveal3D,
  FloatingGlassDock,
} from '@visahobe/ui';
import { ScenicTravelHeroBanner } from './components/ScenicTravelHeroBanner.js';

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
  const [simulationStep, setSimulationStep] = useState<number>(2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(1);
    setTimeout(() => setSimulationStep(2), 1000);
    setTimeout(() => setSimulationStep(3), 2000);
    setTimeout(() => setIsSimulating(false), 3000);
  };

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

  const dockNavItems = [
    { id: 'home', label: 'Explore 3D', href: '#hero', active: true },
    { id: 'destinations', label: 'Destinations', href: '#destinations' },
    { id: 'simulation', label: 'AI Officer', href: '#ai-officer-simulation' },
    { id: 'b2b', label: 'Agency Gateway', href: '#b2b-partners', badge: 'B2B' },
    { id: 'assess', label: 'Assess Fit', href: '/assess' },
  ];

  return (
    <AuroraParallaxBackdrop
      variant="travel"
      intensity="vibrant"
      className="w-full flex flex-col font-sans"
    >
      {/* 3D Parallax Hero Stage */}
      <ParallaxStage id="hero" perspective={1200} depthSpeed={0.06} className="relative pt-6 pb-12">
        <Container size="2xl" className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto gap-6 sm:gap-8">
            {/* Liquid Glass Status Pill with Champagne Gold Border */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Badge
                variant="glass"
                size="md"
                dot
                dotPulse
                className="shadow-sm border-[#C8A951]/50 backdrop-blur-md bg-white/80 text-[#0D3B2E]"
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#0F172A] leading-[1.1]">
              Global Visas & Relocation Powered by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D3B2E] via-[#0284C7] to-[#C8A951]">
                Intelligent AI Operations
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-[#334155] max-w-2xl leading-relaxed">
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

            {/* Animated Scenic Travel Hero Banner */}
            <div className="w-full mt-2">
              <ScenicTravelHeroBanner
                selectedDestinationId={selectedQuickCountry}
                onSelectDestination={(id) => setSelectedQuickCountry(id)}
              />
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

            {/* 3D Interactive Consular Radar Globe Stage (Full Width 12-Column Responsive) */}
            <div className="w-full mt-2 sm:mt-4">
              <ParallaxLayer speed={0.03} zOffset={10} dataTestId="hero-globe-layer">
                <InteractiveVisaGlobe
                  selectedDestinationId={selectedQuickCountry}
                  onSelectDestination={(dest) => {
                    setSelectedQuickCountry(dest.id);
                  }}
                />
              </ParallaxLayer>
            </div>

            {/* Interactive Instant Destination / Visa Selector (Crisp Solid White Card) */}
            <div className="w-full mt-4 sm:mt-6">
              <div className="p-6 sm:p-8 text-left max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#C8A951]" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                      Instant Consular Pathway &amp; Tariff Preview
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Live Policy Pack • Nov 2026
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <label
                      htmlFor="quick-country"
                      className="text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Select Destination
                    </label>
                    <select
                      id="quick-country"
                      value={selectedQuickCountry}
                      onChange={(e) => setSelectedQuickCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-2.5 text-sm font-medium text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0D3B2E]"
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
                      className="text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Application Purpose
                    </label>
                    <select
                      id="quick-purpose"
                      value={selectedQuickPurpose}
                      onChange={(e) => setSelectedQuickPurpose(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-2.5 text-sm font-medium text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0D3B2E]"
                    >
                      <option value="skilled">Skilled Employment &amp; Work Permit</option>
                      <option value="student">Higher Education &amp; Student Visa</option>
                      <option value="pr">Permanent Residency &amp; Migration</option>
                      <option value="business">Investor &amp; Startup Founder</option>
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
                <div className="mt-5 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Selected Pathway
                    </span>
                    <p className="text-sm font-bold text-[#0F172A] mt-0.5">
                      {activeHeroDestination.flag} {activeHeroDestination.country} —{' '}
                      {activeHeroDestination.title}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {activePurpose.readinessNote}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Processing &amp; Approval Benchmark
                    </span>
                    <p className="text-sm font-bold text-[#0F172A] mt-0.5">
                      {activeHeroDestination.processingTime} •{' '}
                      <span className="text-emerald-700 font-bold">
                        {activeHeroDestination.approvalRate} Approved
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Criteria: {activeHeroDestination.minRequirements}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Transparent Tariff Schedule
                    </span>
                    <p className="text-sm font-mono font-bold text-[#0D3B2E] mt-0.5">
                      {activeHeroDestination.transparentPricing}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {activeHeroDestination.govFeeNote}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    ✓ No hidden fees
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    ✓ Official embassy requirements
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    ✓ Real-time consular guidelines
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </ParallaxStage>

      {/* Live AI Visa Officer at Work Interactive Simulation Preview */}
      <Section
        id="ai-officer-simulation"
        variant="default"
        padding="lg"
        className="bg-transparent border-t border-slate-200/80 relative z-10"
      >
        <Container size="2xl">
          <ScrollReveal3D direction="up">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
              <div className="max-w-2xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                  <EmeraldBadge variant="brand" size="sm">
                    Autonomous Agent Runtime Preview
                  </EmeraldBadge>
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0F172A]">
                  Watch the AI Visa Officer at Work
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-2">
                  See our multi-stage pipeline parse identity credentials, verify consular policies,
                  and enforce statutory review gates in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="px-5 py-2.5 rounded-xl bg-[#0D3B2E] hover:bg-[#092A21] text-white font-semibold text-xs sm:text-sm border border-[#C8A951]/40 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSimulating ? 'Processing Simulation...' : '▶ Run Live Simulation'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 1: Document OCR Ingestion */}
              <div
                className={`p-6 text-left rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${
                  simulationStep === 1 ? 'ring-2 ring-[#10B981]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#0D3B2E] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    STAGE 01
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                    99.8% OCR Confidence
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Identity &amp; Credential Extraction
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Scans passport MRZ, checks biometric integrity, and normalizes educational degrees
                  against official accreditation registries.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>✓ MRZ: P&lt;BGDHOSSAIN&lt;&lt;MD&lt;SHAKIL</div>
                  <div>✓ Checksum: Validated (SHA-256)</div>
                  <div>✓ Anabin H+ Degree: Certified</div>
                </div>
              </div>

              {/* Stage 2: Policy Math & Matrix Scoring */}
              <div
                className={`p-6 text-left rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${
                  simulationStep === 2 ? 'ring-2 ring-[#C8A951]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#0D3B2E] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    STAGE 02
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                    Policy Calibration
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">Consular Rules Engine</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Evaluates statutory points thresholds, salary benchmarks, and nationality quotas
                  matching the destination country&apos;s live immigration criteria.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>✓ COMPASS Score: 50 / 40 Pts (Pass)</div>
                  <div>✓ Salary Benchmark: Top 10th Percentile</div>
                  <div>✓ Diversity Sub-criteria: Met (20 Pts)</div>
                </div>
              </div>

              {/* Stage 3: Human Verification Gate */}
              <div
                className={`p-6 text-left rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${
                  simulationStep === 3 ? 'ring-2 ring-emerald-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#0D3B2E] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    STAGE 03
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                    Licensed Counsel Gate
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">Accredited Attorney Review</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Strict ADR-011 review gate halts automated filing for human counsel verification
                  before any official embassy lodgment or biometric slot request.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>✓ Verifier: Sarah Jenkins, Esq.</div>
                  <div>✓ Audit Signature: SHA-256 Hash Verified</div>
                  <div>✓ Status: Approved for Embassy Lodgment</div>
                </div>
              </div>
            </div>
          </ScrollReveal3D>
        </Container>
      </Section>

      {/* Popular Destinations & Streams (Corridors) */}
      <Section
        id="destinations"
        variant="default"
        padding="lg"
        className="bg-transparent border-t border-slate-200/80 relative z-10"
      >
        <Container size="2xl">
          <ScrollReveal3D direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 text-left">
              <div className="flex flex-col gap-2 max-w-xl">
                <EmeraldBadge variant="brand" size="sm" className="w-fit">
                  Global Destinations
                </EmeraldBadge>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0F172A]">
                  High-Success Migration Pathways
                </h2>
                <p className="text-sm sm:text-base text-slate-600">
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
                          ? 'bg-[#0D3B2E] text-white border border-[#0D3B2E] shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {filter === 'All' ? 'All Pathways (6)' : filter}
                    </button>
                  ),
                )}
                <a href="/countries">
                  <Button variant="outline" size="sm" className="text-slate-700 border-slate-300">
                    View All Destinations →
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest.country}
                  className="p-6 text-left flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl" aria-hidden="true">
                        {dest.flag}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="success" size="sm">
                          {dest.approvalRate} Approval
                        </Badge>
                        {dest.popular ? (
                          <EmeraldBadge variant="gold" size="sm" dot={false}>
                            High Demand
                          </EmeraldBadge>
                        ) : (
                          <Badge
                            variant="neutral"
                            size="sm"
                            className="text-slate-700 border-slate-200"
                          >
                            {dest.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <a href={`/countries/${dest.slug}`} className="hover:underline">
                      <h3 className="text-lg font-bold text-[#0F172A]">{dest.country}</h3>
                    </a>
                    <p className="text-sm font-medium text-[#0D3B2E] mt-0.5">{dest.title}</p>

                    <div className="flex flex-col gap-2 pt-4 text-xs text-slate-600">
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Processing Estimate</span>
                        <span className="font-semibold text-[#0F172A]">{dest.processingTime}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Core Criteria</span>
                        <span className="font-semibold text-[#0F172A]">{dest.minRequirements}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Transparent Fee</span>
                        <span className="font-mono font-bold text-[#0D3B2E]">
                          {dest.transparentPricing}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-2">
                    <a href={`/countries/${dest.slug}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-slate-700 border-slate-300"
                      >
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
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal3D>
        </Container>
      </Section>

      {/* How VisaHobe AI + Human Works */}
      <Section
        id="how-it-works"
        variant="default"
        padding="lg"
        className="border-t border-slate-200/80 bg-transparent relative z-10"
      >
        <Container size="2xl">
          <ScrollReveal3D direction="up">
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
              <EmeraldBadge variant="brand" size="sm">
                Operational Workflow
              </EmeraldBadge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0F172A]">
                How VisaHobe AI + Human Verification Works
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We eliminate visa anxiety through an engineered, transparent 4-stage pipeline that
                combines speed with rigorous legal scrutiny.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((step) => (
                <div
                  key={step.step}
                  className="p-6 text-left flex flex-col gap-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all"
                >
                  <div
                    aria-hidden="true"
                    className="h-[2px] w-12 bg-gradient-to-r from-emerald-600 to-[#C8A951]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-display font-extrabold text-slate-300">
                      {step.step}
                    </span>
                    <Badge variant="brand" size="sm">
                      {step.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A]">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </ScrollReveal3D>
        </Container>
      </Section>

      {/* Trust, Security & Compliance */}
      <Section
        id="security"
        variant="default"
        padding="lg"
        className="border-t border-slate-200/80 bg-transparent relative z-10"
      >
        <Container size="2xl">
          <ScrollReveal3D direction="up">
            <div className="flex flex-col lg:flex-row items-start gap-12 text-left">
              <div className="lg:w-5/12 flex flex-col gap-4">
                <EmeraldBadge variant="brand" size="sm" className="w-fit">
                  Security &amp; Compliance
                </EmeraldBadge>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0F172A]">
                  Enterprise Data Privacy &amp; Legal Integrity
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Visa applications contain your most private identity documents. We built VisaHobe
                  with banking-grade tenant boundaries, rigorous auditability, and zero PII leaks.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      Strict PostgreSQL Row-Level Security on all database tables
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      Mandatory Multi-Factor Authentication (MFA) for staff &amp; verifiers
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      Automated secret vault and automated PII scrubbing in all logs
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityPillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="p-5 text-left flex flex-col gap-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                      {pillar.tag}
                    </span>
                    <h4 className="text-base font-bold text-[#0F172A]">{pillar.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal3D>
        </Container>
      </Section>

      {/* Corporate & B2B Partner Agency Gateway Section */}
      <Section
        id="b2b-partners"
        variant="default"
        padding="lg"
        className="bg-transparent border-t border-slate-200/80 relative z-10"
      >
        <Container size="2xl">
          <ScrollReveal3D direction="zoom">
            <div className="p-8 md:p-12 text-left relative overflow-hidden rounded-3xl bg-[#0F172A] text-white shadow-2xl border border-slate-800">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C8A951]/15 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <EmeraldBadge variant="gold" size="sm">
                      B2B Agency Infrastructure
                    </EmeraldBadge>
                    <span className="text-xs font-mono text-[#C8A951]">ADR-010 • 3-Tier SaaS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight">
                    Empower Your Travel Agency with White-Label Visa Operations
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                    Deliver sovereign e-Visas and work permit filings under your agency&apos;s
                    brand. Pre-fund your zero-overdraft wallet via bKash, Nagad or cards, and
                    automate client casework with high-velocity AI processing.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-xs font-bold text-[#C8A951] block">
                        White-Label Domains
                      </span>
                      <span className="text-[11px] text-slate-300">visa.yourtravelagency.com</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-xs font-bold text-[#C8A951] block">Prepaid Wallet</span>
                      <span className="text-[11px] text-slate-300">
                        Instant atomic fee deductions
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-xs font-bold text-[#C8A951] block">
                        Scoped Partner MCP
                      </span>
                      <span className="text-[11px] text-slate-300">Zero-trust tenant boundary</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <span className="text-xs font-bold text-[#C8A951] block">
                        Wholesale Tariffs
                      </span>
                      <span className="text-[11px] text-slate-300">
                        Margin protection &amp; ledger audits
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col gap-3 shrink-0">
                  <a href="/login" className="w-full">
                    <Button variant="gold" size="lg" className="w-full shadow-lg">
                      Join B2B Partner Network →
                    </Button>
                  </a>
                  <a href="/login" className="w-full">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full text-white border-white/30 hover:bg-white/10"
                    >
                      Agency Staff Portal Login
                    </Button>
                  </a>
                  <span className="text-[11px] text-slate-400 text-center">
                    Verified travel agencies, law firms &amp; corporate HR desks
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal3D>
        </Container>
      </Section>

      {/* CTA Bottom Banner */}
      <Section
        variant="default"
        padding="lg"
        className="bg-transparent text-center border-t border-slate-200/80 relative z-10"
      >
        <Container size="xl">
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto py-6">
            <EmeraldBadge variant="gold" size="md">
              Instant Eligibility &amp; Tariff Calculator
            </EmeraldBadge>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0F172A]">
              Ready to verify your visa eligibility?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Take our 3-minute preliminary assessment. Receive an immediate eligibility breakdown
              and step-by-step document checklist for your chosen destination.
            </p>
            <a href="/assess">
              <LuxuryButton size="lg" className="shadow-lg">
                Launch Free Assessment →
              </LuxuryButton>
            </a>
          </div>
        </Container>
      </Section>

      {/* Floating Glass Dock Navigation (Hidden on Mobile) */}
      <FloatingGlassDock items={dockNavItems} position="floating" hideOnMobile={true} />
    </AuroraParallaxBackdrop>
  );
}
