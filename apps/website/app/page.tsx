import React from 'react';
import {
  Container,
  Section,
  Button,
  GlassCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@visahobe/ui';

export default function HomePage() {
  const popularDestinations = [
    {
      country: 'Singapore',
      slug: 'singapore',
      flag: '🇸🇬',
      title: 'Employment Pass (COMPASS)',
      category: 'Skilled Work',
      processingTime: '3-8 Weeks',
      minRequirements: 'Degree + Salary S$5,600+',
      popular: true,
    },
    {
      country: 'Germany / Schengen',
      slug: 'germany',
      flag: '🇩🇪',
      title: 'EU Blue Card & Opportunity Card',
      category: 'Skilled Migration',
      processingTime: '6-12 Weeks',
      minRequirements: 'Recognized Degree + Job Offer',
      popular: true,
    },
    {
      country: 'United Kingdom',
      slug: 'united-kingdom',
      flag: '🇬🇧',
      title: 'Skilled Worker & Student Visa',
      category: 'Work & Study',
      processingTime: '4-8 Weeks',
      minRequirements: 'Sponsor CoS / CAS + English B2',
      popular: true,
    },
    {
      country: 'Canada',
      slug: 'canada',
      flag: '🇨🇦',
      title: 'Express Entry & Provincial Nominee',
      category: 'Permanent Residency',
      processingTime: '12-24 Weeks',
      minRequirements: 'CRS Score + ECA + IELTS 7+',
      popular: false,
    },
    {
      country: 'Australia',
      slug: 'australia',
      flag: '🇦🇺',
      title: 'Subclass 189 / 190 / 482',
      category: 'Skilled Migration',
      processingTime: '8-20 Weeks',
      minRequirements: 'Skill Assessment + 65+ Points',
      popular: false,
    },
    {
      country: 'United Arab Emirates',
      slug: 'uae',
      flag: '🇦🇪',
      title: 'Golden Visa & Green Visa',
      category: 'Investors & Talent',
      processingTime: '2-4 Weeks',
      minRequirements: 'Executive or Specialized Talent',
      popular: false,
    },
  ];

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
    <div className="w-full flex flex-col font-sans">
      {/* Hero Section */}
      <Section
        variant="default"
        padding="xl"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-white border-b border-[#E2E8F0]"
      >
        {/* Subtle Decorative Glass Gradient Orbs */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0D3B2E]/10 via-[#145342]/5 to-transparent blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <Container size="2xl" className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6 sm:gap-8">
            {/* Liquid Glass Badge */}
            <Badge variant="glass" size="md" dot dotPulse className="shadow-sm">
              <span className="font-semibold text-[#0D3B2E]">
                99.2% Verification Accuracy • AI + Licensed Human Verifiers
              </span>
            </Badge>

            {/* Authoritative Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#0D3B2E] leading-[1.12]">
              Global Visas & Relocation Powered by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D3B2E] via-[#16654F] to-[#2A9D7C]">
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
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                  Check Your Visa Eligibility Free
                </Button>
              </a>
              <a href="#services" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Destinations & Streams
                </Button>
              </a>
            </div>

            {/* Quick Interactive Selector Preview */}
            <div className="w-full mt-4 sm:mt-6">
              <GlassCard
                intensity="standard"
                className="p-6 sm:p-8 text-left max-w-3xl mx-auto shadow-glass"
              >
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <label
                      htmlFor="quick-country"
                      className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]"
                    >
                      Select Destination
                    </label>
                    <select
                      id="quick-country"
                      defaultValue="singapore"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
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
                      defaultValue="skilled"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                    >
                      <option value="skilled">Skilled Employment & Work Permit</option>
                      <option value="student">Higher Education & Student Visa</option>
                      <option value="pr">Permanent Residency & Migration</option>
                      <option value="business">Investor & Startup Founder</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-auto">
                    <a href="/assess" className="w-full block">
                      <Button variant="primary" size="md" className="w-full">
                        Evaluate Criteria
                      </Button>
                    </a>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="flex flex-col gap-2 max-w-xl">
              <Badge variant="brand" size="sm" className="w-fit">
                Global Destinations
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0D3B2E]">
                High-Success Migration Pathways
              </h2>
              <p className="text-sm sm:text-base text-[#475569]">
                Verified work permits, skilled PR tracks, and study visas managed end-to-end with
                unmatched compliance accuracy.
              </p>
            </div>
            <a href="/countries">
              <Button variant="outline" size="sm">
                View All Destinations →
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((dest) => (
              <Card
                key={dest.country}
                variant="default"
                className="hover:border-[#0D3B2E]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl" aria-hidden="true">
                      {dest.flag}
                    </span>
                    {dest.popular ? (
                      <Badge variant="brand" size="sm">
                        High Demand
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        {dest.category}
                      </Badge>
                    )}
                  </div>
                  <a href={`/countries/${dest.slug}`} className="hover:underline">
                    <CardTitle className="text-lg font-bold text-[#0D3B2E]">
                      {dest.country}
                    </CardTitle>
                  </a>
                  <CardDescription className="text-sm font-medium text-[#0F172A]">
                    {dest.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0 text-xs text-[#475569]">
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Processing Estimate</span>
                    <span className="font-semibold text-[#0F172A]">{dest.processingTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Core Criteria</span>
                    <span className="font-semibold text-[#0F172A]">{dest.minRequirements}</span>
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
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs hover:bg-[#E3EFEA] hover:text-[#0D3B2E]"
                    >
                      Assess Fit
                    </Button>
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
        className="border-y border-[#E2E8F0]"
      >
        <Container size="2xl">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
            <Badge variant="brand" size="sm">
              Operational Workflow
            </Badge>
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
                className="flex flex-col gap-4 p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-display font-extrabold text-[#0D3B2E]/20">
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
              <Badge variant="brand" size="sm" className="w-fit">
                Security & Compliance
              </Badge>
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
                  <span className="text-sm text-[#0F172A] font-medium">
                    Strict PostgreSQL Row-Level Security on all database tables
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-[#0F172A] font-medium">
                    Mandatory Multi-Factor Authentication (MFA) for staff & verifiers
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-[#0F172A] font-medium">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[#145342]">
                    {pillar.tag}
                  </span>
                  <h4 className="text-base font-bold text-[#0F172A]">{pillar.title}</h4>
                  <p className="text-xs text-[#475569] leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Bottom Banner */}
      <Section variant="brand" padding="lg" className="bg-[#0D3B2E] text-white text-center">
        <Container size="xl">
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Ready to verify your visa eligibility?
            </h2>
            <p className="text-base text-white/80 leading-relaxed">
              Take our 3-minute preliminary assessment. Receive an immediate eligibility breakdown
              and step-by-step document checklist for your chosen destination.
            </p>
            <a href="/assess">
              <Button
                variant="glass"
                size="lg"
                className="bg-white text-[#0D3B2E] hover:bg-white/90 border-white shadow-lg"
              >
                Launch Free Assessment →
              </Button>
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}
