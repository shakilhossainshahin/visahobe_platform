'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Section,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  GlassCard,
  Badge,
  Button,
} from '@visahobe/ui';
import {
  getPublishedCountryGuides,
  type CountryVisaGuide,
  type Region,
  type VisaCategory,
} from '@visahobe/cms';

const ALL_REGIONS: (Region | 'All')[] = [
  'All',
  'Europe',
  'Asia Pacific',
  'North America',
  'Oceania',
  'Middle East',
];

const ALL_CATEGORIES: (VisaCategory | 'All')[] = [
  'All',
  'Skilled Work',
  'Student Visa',
  'Business & Investor',
];

export default function CountriesDirectoryPage() {
  const publishedGuides: CountryVisaGuide[] = useMemo(() => getPublishedCountryGuides(), []);

  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGuides = useMemo(() => {
    return publishedGuides.filter((guide) => {
      // Region filter
      if (selectedRegion !== 'All' && guide.region !== selectedRegion) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const hasCategory = guide.visaStreams.some(
          (stream) => stream.category === selectedCategory,
        );
        if (!hasCategory) return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesCountry = guide.countryName.toLowerCase().includes(q);
        const matchesSummary = guide.summary.toLowerCase().includes(q);
        const matchesStream = guide.visaStreams.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesCountry && !matchesSummary && !matchesStream) {
          return false;
        }
      }

      return true;
    });
  }, [publishedGuides, selectedRegion, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <Section variant="brand" padding="lg" className="border-b border-[#E2E8F0] pt-12 pb-16">
        <Container size="2xl">
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                Official Consular Guides
              </Badge>
              <span className="text-xs font-semibold text-[#0D3B2E]/70">
                • Verified Policy Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#0D3B2E] tracking-tight">
              Global Visa & Immigration Directory
            </h1>
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
              Explore authoritative, continuously verified entry requirements, processing timelines,
              financial criteria, and required document checklists for premier global relocation
              destinations.
            </p>
          </div>
        </Container>
      </Section>

      {/* Filter and Search Bar */}
      <Section
        variant="default"
        padding="sm"
        className="border-b border-[#E2E8F0] bg-white sticky top-16 sm:top-20 z-30 shadow-xs"
      >
        <Container size="2xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2">
            {/* Search Input */}
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search country, visa stream, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 mr-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Region:
              </div>
              {ALL_REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedRegion === region
                      ? 'bg-[#0D3B2E] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Visa Stream Sub-Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] mr-2">
              Visa Stream:
            </span>
            {ALL_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#E3EFEA] text-[#0D3B2E] border border-[#0D3B2E]/30 font-semibold'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* Country Cards Grid */}
      <Section variant="default" padding="lg">
        <Container size="2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-display font-bold text-[#0D3B2E]">
              Available Destinations ({filteredGuides.length})
            </h2>
            <span className="text-xs text-[#64748B]">Showing verified active policy packs</span>
          </div>

          {filteredGuides.length === 0 ? (
            <GlassCard intensity="standard" className="p-12 text-center">
              <h3 className="text-lg font-bold text-[#0D3B2E] mb-2">No destinations found</h3>
              <p className="text-sm text-[#64748B] mb-6">
                Try adjusting your search query or relaxing filter selections.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRegion('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <Card
                  key={guide.slug}
                  className="flex flex-col justify-between hover:shadow-md hover:border-[#0D3B2E]/30 transition-all duration-200 bg-white"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl" role="img" aria-label={guide.countryName}>
                        {guide.flagEmoji}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {guide.region}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-[#0D3B2E]">
                      {guide.countryName}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 text-[#475569]">
                      {guide.tagline}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3 text-xs text-[#475569] border-t border-[#F1F5F9] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Processing Time</span>
                      <span className="font-semibold text-[#0F172A]">
                        {guide.processingTimeRange}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[#64748B]">Key Visa Streams</span>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {guide.visaStreams.slice(0, 2).map((stream) => (
                          <span
                            key={stream.id}
                            className="inline-block px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] font-medium text-[#334155]"
                          >
                            {stream.name}
                          </span>
                        ))}
                        {guide.visaStreams.length > 2 && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[11px] font-medium text-[#64748B]">
                            +{guide.visaStreams.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F8FAFC]">
                      <span className="text-[#64748B]">Official Authority</span>
                      <span className="font-medium text-[#0D3B2E] text-right truncate max-w-[180px]">
                        {guide.officialPortalName}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 flex flex-col gap-2">
                    <a href={`/countries/${guide.slug}`} className="w-full">
                      <Button variant="primary" size="sm" className="w-full">
                        View Visa Guide & Policy
                      </Button>
                    </a>
                    <a
                      href={`/assess?country=${encodeURIComponent(guide.countryName)}`}
                      className="w-full"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-[#0D3B2E] hover:bg-[#E3EFEA]"
                      >
                        Check My Eligibility →
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
