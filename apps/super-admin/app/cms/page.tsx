'use client';

import React, { useState } from 'react';
import { Button, Badge, EmeraldBadge, StatKpiCard } from '@visahobe/ui';
import { getAllCountryGuides } from '@visahobe/cms';

export default function CmsEditorialPage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allGuides = getAllCountryGuides({ includeDrafts: true });

  const filteredGuides = allGuides.filter((guide) => {
    if (filter !== 'all' && guide.editorialStatus !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        guide.countryName.toLowerCase().includes(q) ||
        guide.region.toLowerCase().includes(q) ||
        guide.visaStreams.some((s) => s.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const publishedCount = allGuides.filter((g) => g.editorialStatus === 'published').length;
  const inReviewCount = allGuides.filter((g) => g.editorialStatus === 'in_review').length;
  const draftCount = allGuides.filter((g) => g.editorialStatus === 'draft').length;

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E]">
            CMS Editorial Policy Review &amp; Publishing Queue
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Authoritative visa rules engine managing 6 launch destination policy packages and
            statutory fee checklists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EmeraldBadge variant="brand" size="sm">
            Policy Engine: @visahobe/cms
          </EmeraldBadge>
        </div>
      </div>

      {/* Liquid Glass KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatKpiCard
          label="Published Guides"
          value={publishedCount}
          subvalue="Live on public acquisition portal"
          trend={{ label: '100% Verified', direction: 'up' }}
        />
        <StatKpiCard
          label="In Review"
          value={inReviewCount}
          subvalue="Pending legal counsel sign-off"
        />
        <StatKpiCard
          label="Draft Policy Packs"
          value={draftCount}
          subvalue="Internal researcher staging"
        />
      </div>

      {/* Filter Tabs & Live Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Policy Guides', count: allGuides.length },
            { id: 'published', label: 'Published Only', count: publishedCount },
            { id: 'in_review', label: 'In Review Queue', count: inReviewCount },
            { id: 'draft', label: 'Drafts', count: draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0D3B2E] text-white border border-[#C8A951]/60 shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0D3B2E] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === tab.id
                    ? 'bg-[#C8A951] text-[#111827] font-bold'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search destination, region, or stream..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs border border-[#E2E8F0] bg-white text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E] w-full sm:w-64"
        />
      </div>

      {/* Strict ADR-009 Compliant Solid White Table (Zero Blur on Data Tables, Crisp #0D3B2E Header) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-xs border-collapse"
            data-testid="cms-guides-table"
          >
            <thead>
              <tr className="bg-[#0D3B2E] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Destination Country</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Active Visa Streams</th>
                <th className="py-3.5 px-4">Processing Time</th>
                <th className="py-3.5 px-4">Editorial Status</th>
                <th className="py-3.5 px-4">Last Verified</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] bg-white">
              {filteredGuides.map((guide) => (
                <tr
                  key={guide.slug}
                  className="hover:bg-[#F8FAFC] transition-colors"
                  data-testid={`cms-row-${guide.slug}`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0D3B2E]">{guide.countryName}</div>
                    <div className="font-mono text-[10px] text-[#94A3B8]">
                      /countries/{guide.slug}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#475569]">{guide.region}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#111827]">
                      {guide.visaStreams.length} streams
                    </span>
                    <div className="text-[10px] text-[#64748B] truncate max-w-xs">
                      {guide.visaStreams.map((s) => s.name).join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#475569]">
                    {guide.processingTimeRange}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        guide.editorialStatus === 'published'
                          ? 'success'
                          : guide.editorialStatus === 'in_review'
                            ? 'warning'
                            : 'neutral'
                      }
                      size="sm"
                    >
                      {guide.editorialStatus === 'published'
                        ? 'Published'
                        : guide.editorialStatus === 'in_review'
                          ? 'In Review'
                          : 'Draft Staging'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{guide.lastVerifiedAt}</td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`http://localhost:3000/countries/${guide.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-semibold text-[#0D3B2E] border border-[#0D3B2E]/20 hover:bg-[#0D3B2E]/5"
                      >
                        Preview Guide
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
