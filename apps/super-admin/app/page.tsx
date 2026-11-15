'use client';

import React, { useState } from 'react';
import { Button, LuxuryButton, Badge, EmeraldBadge, StatKpiCard } from '@visahobe/ui';

interface CaseItem {
  id: string;
  caseNumber: string;
  applicantRef: string;
  destination: string;
  visaStream: string;
  countryCode: string;
  stage: 'intake' | 'audit' | 'embassy_prep' | 'consular_submission' | 'decision';
  stageLabel: string;
  priority: 'urgent' | 'high' | 'standard';
  assignedTo: string;
  lastUpdated: string;
  actionRequired: boolean;
}

const MOCK_CASES: CaseItem[] = [
  {
    id: 'case-sg-4921',
    caseNumber: 'VH-2026-SG-4921',
    applicantRef: 'Tanvir A. (CL-8821)',
    destination: 'Singapore',
    visaStream: 'Employment Pass (EP)',
    countryCode: 'SG',
    stage: 'audit',
    stageLabel: 'Specialist Audit',
    priority: 'urgent',
    assignedTo: 'Sarah Jenkins',
    lastUpdated: '10 mins ago',
    actionRequired: true,
  },
  {
    id: 'case-de-1082',
    caseNumber: 'VH-2026-DE-1082',
    applicantRef: 'Ananya R. (CL-3392)',
    destination: 'Germany',
    visaStream: 'EU Blue Card',
    countryCode: 'DE',
    stage: 'embassy_prep',
    stageLabel: 'Embassy File Prep',
    priority: 'high',
    assignedTo: 'Michael Chen',
    lastUpdated: '42 mins ago',
    actionRequired: false,
  },
  {
    id: 'case-uk-9921',
    caseNumber: 'VH-2026-UK-9921',
    applicantRef: 'Kazi M. (CL-7712)',
    destination: 'United Kingdom',
    visaStream: 'Skilled Worker Visa',
    countryCode: 'GB',
    stage: 'intake',
    stageLabel: 'Intake Submitted',
    priority: 'standard',
    assignedTo: 'Unassigned',
    lastUpdated: '2 hours ago',
    actionRequired: true,
  },
  {
    id: 'case-au-4011',
    caseNumber: 'VH-2026-AU-4011',
    applicantRef: 'Farhana S. (CL-6104)',
    destination: 'Australia',
    visaStream: 'Subclass 189 Skilled',
    countryCode: 'AU',
    stage: 'consular_submission',
    stageLabel: 'Consular Submission',
    priority: 'standard',
    assignedTo: 'David Miller',
    lastUpdated: '4 hours ago',
    actionRequired: false,
  },
  {
    id: 'case-ca-5510',
    caseNumber: 'VH-2026-CA-5510',
    applicantRef: 'Rafiqul I. (CL-9014)',
    destination: 'Canada',
    visaStream: 'Express Entry (FSW)',
    countryCode: 'CA',
    stage: 'decision',
    stageLabel: 'Decision & Pass',
    priority: 'standard',
    assignedTo: 'Sarah Jenkins',
    lastUpdated: 'Yesterday',
    actionRequired: false,
  },
  {
    id: 'case-ae-2104',
    caseNumber: 'VH-2026-AE-2104',
    applicantRef: 'Zubaida K. (CL-4108)',
    destination: 'UAE',
    visaStream: '10-Year Golden Visa',
    countryCode: 'AE',
    stage: 'audit',
    stageLabel: 'Specialist Audit',
    priority: 'high',
    assignedTo: 'Michael Chen',
    lastUpdated: 'Yesterday',
    actionRequired: true,
  },
];

export default function SuperAdminDashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCases = MOCK_CASES.filter((c) => {
    if (selectedFilter !== 'all' && c.stage !== selectedFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.caseNumber.toLowerCase().includes(q) ||
        c.applicantRef.toLowerCase().includes(q) ||
        c.destination.toLowerCase().includes(q) ||
        c.visaStream.toLowerCase().includes(q) ||
        c.assignedTo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Cases', count: MOCK_CASES.length },
    {
      id: 'intake',
      label: 'Intake Queue',
      count: MOCK_CASES.filter((c) => c.stage === 'intake').length,
    },
    {
      id: 'audit',
      label: 'Specialist Audit',
      count: MOCK_CASES.filter((c) => c.stage === 'audit').length,
    },
    {
      id: 'embassy_prep',
      label: 'Embassy Prep',
      count: MOCK_CASES.filter((c) => c.stage === 'embassy_prep').length,
    },
    {
      id: 'consular_submission',
      label: 'Consular Submission',
      count: MOCK_CASES.filter((c) => c.stage === 'consular_submission').length,
    },
    {
      id: 'decision',
      label: 'Decision & Pass',
      count: MOCK_CASES.filter((c) => c.stage === 'decision').length,
    },
  ];

  return (
    <div className="space-y-8 text-[#111827]">
      {/* Operations Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <EmeraldBadge variant="brand" size="sm">
              Executive Operations Desk
            </EmeraldBadge>
            <Badge variant="gold" size="sm">
              AAL2 MFA Enforced • ADR-009 Compliant
            </Badge>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E] tracking-tight">
            Case Operations Command Center
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Global consular filing queues, SLA monitors, and real-time document verification
            pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/partners">
            <Button variant="outline" size="sm">
              Partner Wallets
            </Button>
          </a>
          <a href="/audit">
            <LuxuryButton size="sm">Launch Document Verifier</LuxuryButton>
          </a>
        </div>
      </div>

      {/* KPI Summary Cards (variant="solid" preserves zero backdrop-blur invariant on this page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatKpiCard
          variant="solid"
          label="Active Cases"
          value="142"
          subvalue="Across 6 launch destinations"
          trend={{ label: '+8 this week', direction: 'up' }}
        />
        <StatKpiCard
          variant="solid"
          label="Pending Verification"
          value="18"
          subvalue="Passports, bank statements, OCR"
          trend={{ label: 'Needs Review', direction: 'neutral' }}
        />
        <StatKpiCard
          variant="solid"
          label="SLA Critical Alerts"
          value="3"
          subvalue="Filing submission deadline"
          trend={{ label: '< 4h remaining', direction: 'down' }}
        />
        <StatKpiCard
          variant="solid"
          label="Approved Today"
          value="12"
          subvalue="Statutory files certified"
          trend={{ label: '100% SLA met', direction: 'up' }}
        />
      </div>

      {/* Case Operations Queue Section */}
      <div className="space-y-4">
        {/* Interactive Stage Filter Tabs, Priority Filter & Live Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#0D3B2E] text-white border border-[#C8A951]/60 shadow-xs'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0D3B2E] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedFilter === tab.id
                      ? 'bg-[#C8A951] text-[#111827] font-bold'
                      : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              aria-label="Filter by SLA Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs border border-[#E2E8F0] bg-white text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
            >
              <option value="all">All SLA Priorities</option>
              <option value="urgent">Urgent SLA Only</option>
              <option value="high">High Priority</option>
              <option value="standard">Standard Priority</option>
            </select>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by case #, client ref, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-[#E2E8F0] bg-white text-[#111827] placeholder-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Strict ADR-009 Compliant Solid High-Contrast Table (Zero Blur on Data Tables, Crisp #0D3B2E Header) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-gradient-to-r from-[#0D3B2E] via-[#C8A951] to-[#0D3B2E]"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="case-queue-table">
              <thead>
                <tr className="bg-[#0D3B2E] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Case Number</th>
                  <th className="py-3.5 px-4">Applicant Ref</th>
                  <th className="py-3.5 px-4">Destination &amp; Stream</th>
                  <th className="py-3.5 px-4">Filing Stage</th>
                  <th className="py-3.5 px-4">SLA Priority</th>
                  <th className="py-3.5 px-4">Assigned Verifier</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs bg-white">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#64748B]">
                      No cases matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                      data-testid={`case-row-${item.caseNumber}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0D3B2E]">
                        {item.caseNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#111827]">
                        {item.applicantRef}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#111827]">{item.destination}</div>
                        <div className="text-[11px] text-[#64748B]">{item.visaStream}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            item.stage === 'decision'
                              ? 'success'
                              : item.stage === 'audit'
                                ? 'warning'
                                : 'neutral'
                          }
                          size="sm"
                        >
                          {item.stageLabel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.priority === 'urgent' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]"
                            data-testid="priority-badge-urgent"
                          >
                            URGENT
                          </span>
                        )}
                        {item.priority === 'high' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                            data-testid="priority-badge-high"
                          >
                            HIGH
                          </span>
                        )}
                        {item.priority === 'standard' && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                            data-testid="priority-badge-standard"
                          >
                            STANDARD
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        {item.assignedTo === 'Unassigned' ? (
                          <span className="text-[#B45309] font-medium">Unassigned</span>
                        ) : (
                          item.assignedTo
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.lastUpdated}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a href={`/audit?case=${item.caseNumber}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-semibold text-[#0D3B2E] border border-[#0D3B2E]/20 hover:bg-[#0D3B2E]/5"
                          >
                            Review File
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {filteredCases.length} of {MOCK_CASES.length} cases
            </span>
            <span className="font-mono text-[11px]">
              Compliance: ADR-009 Solid High-Contrast Table Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
