import type { Metadata } from 'next';
import { notFound } from 'next/navigation.js';
import React from 'react';
import {
  Container,
  Section,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  GlassCard,
  Badge,
  Button,
} from '@visahobe/ui';
import {
  getCountryGuideBySlug,
  getPublishedCountrySlugs,
  type CountryVisaGuide,
} from '@visahobe/cms';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPublishedCountrySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getCountryGuideBySlug(slug);

  if (!guide) {
    return {
      title: 'Destination Not Found | VisaHobe',
      description: 'The requested visa guide could not be located in our verified policy database.',
    };
  }

  return {
    title: `${guide.countryName} Visa & Immigration Guide (2026) | VisaHobe`,
    description: `${guide.countryName} visa and immigration guide: ${guide.tagline}. Complete official requirements, ${guide.processingTimeRange} processing timeline, financial requirements, and document checklist.`,
    openGraph: {
      title: `${guide.countryName} Visa Requirements & Application Guide (2026)`,
      description: guide.summary,
      type: 'article',
      siteName: 'VisaHobe',
    },
    keywords: [
      `${guide.countryName} visa`,
      `${guide.countryName} immigration 2026`,
      ...guide.visaStreams.map((s) => s.name),
      guide.region,
      'visa requirements',
      'work permit',
    ],
  };
}

export default async function CountryGuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide: CountryVisaGuide | undefined = getCountryGuideBySlug(slug);

  if (!guide) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[#E2E8F0] py-3 text-xs text-[#64748B]">
        <Container size="2xl">
          <nav className="flex items-center gap-2">
            <a href="/" className="hover:text-[#0D3B2E]">
              Home
            </a>
            <span>/</span>
            <a href="/countries" className="hover:text-[#0D3B2E]">
              Destinations
            </a>
            <span>/</span>
            <span className="font-semibold text-[#0D3B2E]">{guide.countryName}</span>
          </nav>
        </Container>
      </div>

      {/* Hero Section */}
      <Section variant="brand" padding="lg" className="border-b border-[#E2E8F0] pt-12 pb-16">
        <Container size="2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-3xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-4xl" role="img" aria-label={guide.countryName}>
                  {guide.flagEmoji}
                </span>
                <Badge variant="brand" size="md">
                  {guide.region}
                </Badge>
                <Badge variant="neutral" size="sm">
                  Verified Policy: {guide.lastVerifiedAt}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#0D3B2E] tracking-tight">
                {guide.countryName} Visa & Immigration Guide
              </h1>

              <p className="text-base sm:text-lg font-medium text-[#0D3B2E]/90">{guide.tagline}</p>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{guide.summary}</p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                <span>
                  Official Authority:{' '}
                  <a
                    href={guide.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0D3B2E] underline hover:text-[#092A21]"
                  >
                    {guide.officialPortalName} ↗
                  </a>
                </span>
              </div>
            </div>

            {/* Quick Action Card */}
            <GlassCard
              intensity="elevated"
              className="w-full lg:w-80 shrink-0 p-6 flex flex-col gap-4 bg-white/90"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                  Eligibility Check
                </span>
                <h2 className="text-lg font-bold text-[#0D3B2E]">Targeting {guide.countryName}?</h2>
                <p className="text-xs text-[#64748B]">
                  Run our 2-minute instant criteria evaluation before preparing your dossier.
                </p>
              </div>

              <div className="border-y border-[#E2E8F0] py-3 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Estimated Processing:</span>
                  <span className="font-semibold text-[#0D3B2E]">{guide.processingTimeRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Available Streams:</span>
                  <span className="font-semibold text-[#0D3B2E]">
                    {guide.visaStreams.length} Programs
                  </span>
                </div>
              </div>

              <a
                href={`/assess?country=${encodeURIComponent(guide.countryName)}`}
                className="w-full block"
              >
                <Button variant="primary" size="md" className="w-full">
                  Assess My Eligibility
                </Button>
              </a>
            </GlassCard>
          </div>
        </Container>
      </Section>

      {/* Metrics Summary Grid */}
      <Section variant="default" padding="sm" className="border-b border-[#E2E8F0] bg-white">
        <Container size="2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B] font-medium">Processing Benchmark</span>
              <span className="text-sm font-bold text-[#0D3B2E]">{guide.processingTimeRange}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B] font-medium">Capital & Currency</span>
              <span className="text-sm font-bold text-[#0D3B2E]">
                {guide.capital} ({guide.currency})
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B] font-medium">Official Languages</span>
              <span className="text-sm font-bold text-[#0D3B2E]">{guide.officialLanguage}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B] font-medium">Policy Verification</span>
              <span className="text-sm font-bold text-[#0D3B2E]">Active (Nov 2026)</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Main Content Area */}
      <Container size="2xl" className="py-12 flex flex-col gap-16">
        {/* Visa Streams */}
        <section id="visa-streams" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Badge variant="brand" size="sm" className="w-fit">
              Available Pathways
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D3B2E]">
              Key Visa Streams & Qualification Criteria
            </h2>
            <p className="text-sm text-[#475569]">
              Detailed breakdown of statutory criteria, processing targets, and candidate
              prerequisites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guide.visaStreams.map((stream) => (
              <Card key={stream.id} className="flex flex-col justify-between bg-white shadow-xs">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="neutral" size="sm">
                      {stream.category}
                    </Badge>
                    {stream.highlightTag && (
                      <Badge variant="brand" size="sm">
                        {stream.highlightTag}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0D3B2E]">{stream.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-[#475569]">
                    {stream.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 text-xs border-t border-[#F1F5F9] pt-4">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#F8FAFC]">
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Processing Time</span>
                      <span className="font-semibold text-[#0F172A]">{stream.processingTime}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">
                        Minimum Funds / Salary
                      </span>
                      <span className="font-semibold text-[#0F172A]">{stream.minimumFunds}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-[#0D3B2E] block mb-1.5">
                      Statutory Requirements:
                    </span>
                    <ul className="space-y-1 text-[#475569]">
                      {stream.keyRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#0D3B2E] font-bold">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-[#0D3B2E] block mb-1.5">
                      Target Applicant Profiles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {stream.eligibleProfiles.map((prof, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#E3EFEA] text-[11px] font-medium text-[#0D3B2E]"
                        >
                          {prof}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 border-t border-[#F1F5F9]">
                  <a
                    href={`/assess?country=${encodeURIComponent(guide.countryName)}`}
                    className="w-full block"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Evaluate Fit for {stream.name}
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Document Checklist */}
        <section id="documents" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Badge variant="brand" size="sm" className="w-fit">
              Dossier Readiness
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D3B2E]">
              Required Document Checklist
            </h2>
            <p className="text-sm text-[#475569]">
              Standard documents required by {guide.officialPortalName} for primary applicant
              lodging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guide.documentChecklist.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#64748B]">
                      {doc.category}
                    </span>
                    {doc.mandatory ? (
                      <Badge variant="danger" size="sm">
                        Mandatory
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Conditional
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#0D3B2E]">{doc.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{doc.description}</p>
                </div>

                {doc.tips && (
                  <div className="pt-2 border-t border-[#F1F5F9] text-[11px] text-[#0D3B2E] font-medium bg-[#E3EFEA]/40 p-2 rounded-lg">
                    💡 Tip: {doc.tips}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Official Fee Summary */}
        <section id="fees" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Badge variant="brand" size="sm" className="w-fit">
              Financial Transparency
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D3B2E]">
              Official Government Fee Summary
            </h2>
            <p className="text-sm text-[#475569]">
              Standard governmental lodging and processing levies for {guide.countryName}.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Visa Program</th>
                  <th className="py-3 px-4">Government Lodging Fee</th>
                  <th className="py-3 px-4">Healthcare / Surcharge</th>
                  <th className="py-3 px-4">Official Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {guide.officialFeeSummary.map((fee, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]/50">
                    <td className="py-3.5 px-4 font-semibold text-[#0D3B2E]">{fee.streamName}</td>
                    <td className="py-3.5 px-4 font-medium">{fee.governmentFee}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {fee.healthcareSurcharge || 'None / Not Applicable'}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] max-w-xs">
                      {fee.notes ||
                        'Payable directly to official consular authority upon lodgement.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Official Disclaimer */}
        <div className="p-6 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] text-xs text-[#475569] leading-relaxed flex flex-col gap-2">
          <span className="font-bold text-[#0D3B2E] uppercase tracking-wider text-[11px]">
            Official Consular & Legal Disclaimer
          </span>
          <p>
            The immigration information presented on this page is compiled directly from published
            guidelines issued by {guide.officialPortalName} and verified as of{' '}
            {guide.lastVerifiedAt}. Immigration statutory rules, quotas, and processing timelines
            are subject to sovereign legislative amendments without prior notice. VisaHobe is an
            AI-assisted visa preparation platform and does not make consular determinations or issue
            travel authorizations.
          </p>
        </div>

        {/* Bottom CTA Banner */}
        <GlassCard
          intensity="elevated"
          className="p-8 sm:p-12 text-center flex flex-col items-center gap-6 bg-white/95"
        >
          <div className="max-w-xl flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D3B2E]">
              Ready to Relocate to {guide.countryName}?
            </h2>
            <p className="text-sm text-[#475569]">
              Complete our initial assessment questionnaire to evaluate your CRS/points eligibility
              and receive a tailored document roadmap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href={`/assess?country=${encodeURIComponent(guide.countryName)}`}>
              <Button variant="primary" size="md">
                Start Free Assessment for {guide.countryName}
              </Button>
            </a>
            <a href="/countries">
              <Button variant="outline" size="md">
                Browse All Destinations
              </Button>
            </a>
          </div>
        </GlassCard>
      </Container>
    </div>
  );
}
