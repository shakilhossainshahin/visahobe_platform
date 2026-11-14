'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@visahobe/ui';
import { getAllCountryGuides } from '@visahobe/cms';

export default function CmsEditorialPage() {
  const [filter, setFilter] = useState<string>('all');

  // Load all country policy packages including drafts and in-review packages
  const allGuides = getAllCountryGuides({ includeDrafts: true });

  const filteredGuides = allGuides.filter((guide) => {
    if (filter === 'all') return true;
    return guide.editorialStatus === filter;
  });

  const publishedCount = allGuides.filter((g) => g.editorialStatus === 'published').length;
  const inReviewCount = allGuides.filter((g) => g.editorialStatus === 'in_review').length;
  const draftCount = allGuides.filter((g) => g.editorialStatus === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <Badge variant="brand" size="sm">
            Policy Engine: @visahobe/cms
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Published Guides
            </span>
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#0D3B2E]">{publishedCount}</div>
          <span className="text-xs text-[#94A3B8] mt-1 block">
            Live on public acquisition portal
          </span>
        </Card>

        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              In Review
            </span>
            <span className="w-2 h-2 rounded-full bg-[#B45309]" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#B45309]">{inReviewCount}</div>
          <span className="text-xs text-[#94A3B8] mt-1 block">Pending legal counsel sign-off</span>
        </Card>

        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Draft Policy Packs
            </span>
            <span className="w-2 h-2 rounded-full bg-[#64748B]" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#475569]">{draftCount}</div>
          <span className="text-xs text-[#94A3B8] mt-1 block">Internal researcher staging</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Policy Guides', count: allGuides.length },
          { id: 'published', label: 'Published Only', count: publishedCount },
          { id: 'in_review', label: 'In Review Queue', count: inReviewCount },
          { id: 'draft', label: 'Drafts', count: draftCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === tab.id
                ? 'bg-[#0D3B2E] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0D3B2E] hover:bg-[#F8FAFC]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Strict ADR-009 Compliant Solid White Table (Zero Blur on Data Tables) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-xs border-collapse"
            data-testid="cms-guides-table"
          >
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                <th className="py-3 px-4">Destination Country</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Active Visa Streams</th>
                <th className="py-3 px-4">Processing Time</th>
                <th className="py-3 px-4">Editorial Status</th>
                <th className="py-3 px-4">Last Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
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
                    <span className="font-semibold text-[#0F172A]">
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
