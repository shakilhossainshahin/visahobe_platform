'use client';

import React, { useState } from 'react';
import { Card, Badge } from '@visahobe/ui';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'alert';
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-15T02:30:15Z',
    actorRole: 'verifier',
    actorId: 'usr-sarah-jenkins',
    action: 'document.verify',
    entityType: 'Document',
    entityId: 'doc-88a9e9f4-sg4921',
    details: 'Certified passport bio page for case VH-2026-SG-4921. PII scrubbed.',
    ipAddress: '10.0.4.12 (VPN)',
    status: 'success',
  },
  {
    id: 'log-002',
    timestamp: '2026-11-15T02:15:02Z',
    actorRole: 'admin',
    actorId: 'usr-admin-ops',
    action: 'case.stage_transition',
    entityType: 'Case',
    entityId: 'case-sg-4921',
    details: 'Milestone advanced from Intake Submitted to Specialist Audit.',
    ipAddress: '10.0.4.10 (VPN)',
    status: 'success',
  },
  {
    id: 'log-003',
    timestamp: '2026-11-15T01:45:22Z',
    actorRole: 'case_manager',
    actorId: 'usr-michael-chen',
    action: 'document.request_resubmission',
    entityType: 'Document',
    entityId: 'doc-12f9b8c1-de1082',
    details: 'Requested re-upload: bank statement missing page 2 of financial schedule.',
    ipAddress: '10.0.4.18 (VPN)',
    status: 'alert',
  },
  {
    id: 'log-004',
    timestamp: '2026-11-15T01:10:48Z',
    actorRole: 'admin',
    actorId: 'usr-sarah-jenkins',
    action: 'cms.editorial_update',
    entityType: 'CountryGuide',
    entityId: 'singapore',
    details: 'Verified MOM Compass point thresholds and employment pass salary criteria.',
    ipAddress: '10.0.4.12 (VPN)',
    status: 'success',
  },
  {
    id: 'log-005',
    timestamp: '2026-11-15T00:30:11Z',
    actorRole: 'system',
    actorId: 'worker-sla-monitor',
    action: 'sla.alert_triggered',
    entityType: 'Case',
    entityId: 'case-sg-4921',
    details: 'SLA alert: Case within 4h of consular filing deadline. Escalated to Lead Verifier.',
    ipAddress: '127.0.0.1 (Worker)',
    status: 'alert',
  },
];

export default function AuditLogsPage() {
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action.startsWith(filterAction);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E]">
            Immutable System Audit Trail
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Tamper-evident record of all operator actions, document decisions, and state
            transitions. Governed by PostgreSQL RLS.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            ISO 27001 / SOC 2 Type II
          </Badge>
        </div>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B] block">Total Logged Events</span>
          <span className="text-2xl font-bold text-[#0D3B2E] mt-1 block">1,842</span>
          <span className="text-[11px] text-[#94A3B8]">Cryptographically signed</span>
        </Card>
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B] block">MFA Verified Sessions</span>
          <span className="text-2xl font-bold text-[#15803D] mt-1 block">100%</span>
          <span className="text-[11px] text-[#94A3B8]">Staff AAL2 policy enforced</span>
        </Card>
        <Card className="p-4 bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B] block">Raw PII Leakage Scan</span>
          <span className="text-2xl font-bold text-[#0D3B2E] mt-1 block">0 Detected</span>
          <span className="text-[11px] text-[#94A3B8]">Scrubbed via @visahobe/core</span>
        </Card>
      </div>

      {/* Action Filters */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All Actions' },
          { id: 'document', label: 'Document Events' },
          { id: 'case', label: 'Case Transitions' },
          { id: 'cms', label: 'CMS Edits' },
          { id: 'sla', label: 'SLA Alerts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterAction(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterAction === tab.id
                ? 'bg-[#0D3B2E] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0D3B2E] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Strict ADR-009 Compliant Solid White Table (Zero Blur on Data Tables) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-xs border-collapse"
            data-testid="audit-logs-table"
          >
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor &amp; Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details &amp; Masked Diffs</th>
                <th className="py-3 px-4 text-right">IP Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[#F8FAFC] transition-colors"
                  data-testid={`audit-row-${log.id}`}
                >
                  <td className="py-3 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#0F172A]">{log.actorId}</div>
                    <Badge variant="brand" size="sm" className="text-[10px]">
                      {log.actorRole}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0D3B2E]">{log.action}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#475569]">{log.entityType}</span>
                    <span className="font-mono text-[10px] text-[#94A3B8] block">
                      {log.entityId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#475569] max-w-md">{log.details}</td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                    {log.ipAddress}
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
