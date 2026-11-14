'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@visahobe/ui';

interface DocumentAuditTarget {
  documentId: string;
  caseNumber: string;
  applicantRef: string;
  category: string;
  fileName: string;
  fileSize: string;
  checksum: string;
  uploadedAt: string;
  status: 'pending_review' | 'verified' | 'action_required';
  ocrData: {
    field: string;
    extractedValue: string;
    requirementValue: string;
    confidence: number;
    match: boolean;
  }[];
}

const MOCK_AUDIT_DOC: DocumentAuditTarget = {
  documentId: 'doc-88a9e9f4-sg4921',
  caseNumber: 'VH-2026-SG-4921',
  applicantRef: 'Tanvir A. [CL-8821]',
  category: 'Identity & Nationality',
  fileName: 'singapore_ep_passport_bio.pdf',
  fileSize: '2.4 MB',
  checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  uploadedAt: 'Today at 09:30 AM',
  status: 'pending_review',
  ocrData: [
    {
      field: 'Full Legal Name',
      extractedValue: 'T***** A**** (Masked)',
      requirementValue: 'Exact match with MOM portal profile',
      confidence: 0.99,
      match: true,
    },
    {
      field: 'Document Number',
      extractedValue: 'A******8 (Masked)',
      requirementValue: 'Machine-Readable Passport Standard (ICAO 9303)',
      confidence: 0.98,
      match: true,
    },
    {
      field: 'Date of Expiry',
      extractedValue: '18 Nov 2031',
      requirementValue: 'Must have at least 6 months validity',
      confidence: 0.97,
      match: true,
    },
    {
      field: 'Issuing Authority',
      extractedValue: 'Department of Immigration & Passports',
      requirementValue: 'Recognized Statutory Authority',
      confidence: 0.96,
      match: true,
    },
    {
      field: 'MRZ Checksum',
      extractedValue: 'P<BGD<<T*****<A****<<<<<<<<<<<<<<<<<<',
      requirementValue: 'Valid Type 3 MRZ Structure',
      confidence: 0.99,
      match: true,
    },
  ],
};

export default function DocumentAuditPage() {
  const [docState, setDocState] = useState<DocumentAuditTarget>(MOCK_AUDIT_DOC);
  const [selectedReason, setSelectedReason] = useState<string>('poor_resolution');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleApprove = () => {
    setDocState((prev) => ({ ...prev, status: 'verified' }));
    setFeedbackMessage('Document certified and marked Verified. Audit event logged.');
  };

  const handleReject = () => {
    setDocState((prev) => ({ ...prev, status: 'action_required' }));
    setFeedbackMessage(
      `Resubmission requested with reason code '${selectedReason}'. Client notified.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs font-semibold text-[#0D3B2E] hover:underline">
              &larr; Back to Case Queue
            </a>
            <span className="text-xs text-[#94A3B8]">•</span>
            <span className="text-xs font-mono text-[#64748B]">{docState.caseNumber}</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E] mt-1">
            Document Verification &amp; OCR Diff Audit
          </h1>
          <p className="text-sm text-[#64748B]">
            High-assurance side-by-side inspection of statutory client uploads against MOM
            compliance rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              docState.status === 'verified'
                ? 'success'
                : docState.status === 'action_required'
                  ? 'danger'
                  : 'warning'
            }
            size="md"
          >
            {docState.status === 'verified'
              ? 'Status: Verified & Signed'
              : docState.status === 'action_required'
                ? 'Status: Action Required'
                : 'Status: Pending Audit'}
          </Badge>
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#ECFDF5] border border-[#86EFAC] text-xs font-semibold text-[#065F46] flex items-center justify-between"
        >
          <span>{feedbackMessage}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[#065F46] hover:text-[#0D3B2E]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document File Preview Container (Solid White per ADR-009) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                  Original Client Document
                </span>
                <span className="text-sm font-bold text-[#0F172A]">{docState.fileName}</span>
              </div>
              <Badge variant="neutral" size="sm">
                PDF Document
              </Badge>
            </div>

            {/* Document Render Canvas */}
            <div className="mt-4 p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center min-h-[360px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0D3B2E]/10 flex items-center justify-center text-[#0D3B2E] text-2xl font-bold mb-4">
                📄
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">
                Biometric Passport Scan Certified
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mt-1">
                Embedded private signed URL preview. Client metadata, camera EXIF, and local file
                paths have been scrubbed via @visahobe/core.
              </p>

              <div className="mt-6 w-full max-w-xs p-3 bg-white border border-[#E2E8F0] rounded-lg text-left text-[11px] font-mono text-[#475569] space-y-1">
                <div>Size: {docState.fileSize}</div>
                <div>Uploaded: {docState.uploadedAt}</div>
                <div className="truncate">SHA-256: {docState.checksum}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Extracted OCR Diff & Verifier Action Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Extracted Metadata Comparison Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <h2 className="text-sm font-bold text-[#0D3B2E]">
                Extracted OCR Fields &amp; Verification Checks
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Automated extraction validated with 98.2% average confidence. All raw PII is masked.
              </p>
            </div>

            <table className="w-full text-left text-xs" data-testid="ocr-diff-table">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#475569]">
                  <th className="py-2.5 px-4">Field</th>
                  <th className="py-2.5 px-4">Extracted Value</th>
                  <th className="py-2.5 px-4">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {docState.ocrData.map((row) => (
                  <tr key={row.field} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-semibold text-[#1E293B]">{row.field}</td>
                    <td className="py-3 px-4 font-mono text-[#0D3B2E]">{row.extractedValue}</td>
                    <td className="py-3 px-4">
                      {row.match ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D]">
                          ✓ Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B91C1C]">
                          ✗ Mismatch
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verifier Sign-off & Decision Actions */}
          <Card className="p-6 bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0D3B2E]">Verifier Decision &amp; Audit Seal</h3>
            <p className="text-xs text-[#64748B]">
              Approving seals this document with the verifier&apos;s cryptographic signature and
              advances the case milestone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleApprove}
                className="flex-1 bg-[#15803D] hover:bg-[#166534] text-white font-bold"
                data-testid="approve-document-btn"
              >
                ✓ Certify &amp; Approve Document
              </Button>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 mt-4">
              <span className="text-xs font-semibold text-[#64748B] block mb-2">
                Or request correction / re-upload:
              </span>
              <div className="flex gap-2">
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-[#E2E8F0] bg-white text-[#0F172A]"
                >
                  <option value="poor_resolution">Unreadable scan / poor resolution</option>
                  <option value="corners_truncated">Document corners or borders cropped</option>
                  <option value="expired_validity">Validity period is under 6 months</option>
                  <option value="missing_pages">Multi-page schedule incomplete</option>
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReject}
                  className="text-xs font-bold text-[#B91C1C] border border-[#B91C1C]/30 hover:bg-[#B91C1C]/10"
                  data-testid="reject-document-btn"
                >
                  Request Resubmission
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
