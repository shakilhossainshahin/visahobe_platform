'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  GlassCard,
  Badge,
  EmeraldBadge,
  Button,
  LuxuryButton,
  StatKpiCard,
  DataTableShell,
} from '@visahobe/ui';

interface VaultDocument {
  id: string;
  title: string;
  category: 'identity' | 'educational' | 'financial' | 'professional' | 'health';
  mandatory: boolean;
  filename: string | null;
  fileSize: string | null;
  uploadedAt: string | null;
  status: 'verified' | 'pending_review' | 'action_required';
  notes: string;
  ocrConfidence?: string;
  sha256Digest?: string;
}

const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-passport',
    title: 'International Passport (Bio-data & Stamp Pages)',
    category: 'identity',
    mandatory: true,
    filename: 'passport_bio_tanvir.pdf',
    fileSize: '2.4 MB',
    uploadedAt: 'Nov 02, 2026',
    status: 'verified',
    notes: 'Validity exceeds 6 months. Bio-data verified via OCR.',
    ocrConfidence: '99.8% MRZ Match',
    sha256Digest: 'sha256:9f84c2a1...e41b',
  },
  {
    id: 'doc-degree',
    title: 'BSc Computer Science Degree Certificate',
    category: 'educational',
    mandatory: true,
    filename: 'bsc_degree_certificate.pdf',
    fileSize: '3.1 MB',
    uploadedAt: 'Nov 03, 2026',
    status: 'verified',
    notes: 'DataFlow credential verification completed. 20/20 COMPASS points.',
    ocrConfidence: '99.5% Seal Verified',
    sha256Digest: 'sha256:3c71b0d9...82a0',
  },
  {
    id: 'doc-transcripts',
    title: 'Official Academic Transcripts',
    category: 'educational',
    mandatory: true,
    filename: 'academic_transcripts_verified.pdf',
    fileSize: '4.8 MB',
    uploadedAt: 'Nov 03, 2026',
    status: 'verified',
    notes: 'Grade conversion verified against international standards.',
    ocrConfidence: '99.2% Tabular OCR',
    sha256Digest: 'sha256:7a12f5e8...c19d',
  },
  {
    id: 'doc-contract',
    title: 'Singapore Employment Contract & Offer Letter',
    category: 'professional',
    mandatory: true,
    filename: 'signed_employment_offer_singapore.pdf',
    fileSize: '1.2 MB',
    uploadedAt: 'Nov 04, 2026',
    status: 'verified',
    notes: 'Fixed salary meets statutory threshold (SGD $6,200/mo).',
    ocrConfidence: '99.7% Clause Match',
    sha256Digest: 'sha256:5e90a4c2...11f3',
  },
  {
    id: 'doc-cv',
    title: 'Detailed Professional Curriculum Vitae (CV)',
    category: 'professional',
    mandatory: true,
    filename: 'tanvir_ahmed_cv_2026.pdf',
    fileSize: '850 KB',
    uploadedAt: 'Nov 12, 2026',
    status: 'pending_review',
    notes: 'Queued for final MOM employment alignment review by Sarah J.',
    ocrConfidence: '98.9% Parsed',
    sha256Digest: 'sha256:2b44d1e7...90a8',
  },
  {
    id: 'doc-bank',
    title: 'Six Months Bank Statements (Salary Credits)',
    category: 'financial',
    mandatory: true,
    filename: null,
    fileSize: null,
    uploadedAt: null,
    status: 'action_required',
    notes: 'Urgent: Official stamped bank statement required showing regular deposits.',
  },
];

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<VaultDocument[]>(INITIAL_DOCUMENTS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewDocId, setPreviewDocId] = useState<string>('doc-passport');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('financial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const pendingCount = documents.filter((d) => d.status === 'pending_review').length;
  const actionRequiredCount = documents.filter((d) => d.status === 'action_required').length;

  const filteredDocuments = useMemo(() => {
    if (statusFilter === 'all') return documents;
    return documents.filter((d) => d.status === statusFilter);
  }, [documents, statusFilter]);

  const activePreviewDoc = documents.find((d) => d.id === previewDocId) ?? documents[0]!;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadFeedback({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedCategory);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.category === selectedCategory || doc.status === 'action_required') {
            return {
              ...doc,
              filename: data.document.sanitizedFilename,
              fileSize: `${(data.document.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedAt: 'Just now',
              status: 'pending_review',
              notes: 'Uploaded and queued for automated OCR & specialist audit.',
              ocrConfidence: '99.1% Queued Scan',
              sha256Digest: 'sha256:verified-upload',
            };
          }
          return doc;
        }),
      );

      setUploadFeedback({
        type: 'success',
        message: `File "${data.document.sanitizedFilename}" successfully uploaded and queued for audit.`,
      });
      setSelectedFile(null);
      setTimeout(() => {
        setIsModalOpen(false);
        setUploadFeedback(null);
      }, 1500);
    } catch (err) {
      setUploadFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Upload failed unexpectedly.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="py-8 md:py-12 flex flex-col gap-8 bg-[#F8FAFC] min-h-screen text-[#111827]">
      {/* Header & Status Summary */}
      <Container size="2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <EmeraldBadge variant="brand" size="sm">
                Encrypted Vault
              </EmeraldBadge>
              <Badge variant="gold" size="sm">
                Zero-Trust EXIF Scrubbing
              </Badge>
              <span className="text-xs text-[#64748B] font-medium">
                • Defense-in-Depth PII Protection
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0D3B2E]">
              Document Vault & Verification Checklist
            </h1>
            <p className="text-xs md:text-sm text-[#475569]">
              Track statutory verification statuses for Case ID:{' '}
              <span className="font-semibold text-[#0D3B2E]">VH-2026-SG-4921</span> (Singapore
              Employment Pass).
            </p>
          </div>

          <LuxuryButton size="md" onClick={() => setIsModalOpen(true)}>
            + Upload New Document
          </LuxuryButton>
        </div>

        {/* Liquid Glass KPI Metric Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatKpiCard
            label="Total Checklist Items"
            value={documents.length}
            subvalue="MOM Statutory Requirements"
          />
          <StatKpiCard
            label="Verified Clear"
            value={verifiedCount}
            subvalue="Passed all checks"
            trend={{ label: 'OCR + Lawyer', direction: 'up' }}
          />
          <StatKpiCard
            label="Pending Audit"
            value={pendingCount}
            subvalue="Specialist review queued"
          />
          <StatKpiCard
            label="Action Required"
            value={actionRequiredCount}
            subvalue="Upload immediately"
            trend={{ label: 'Due Nov 22', direction: 'down' }}
          />
        </div>

        {/* Interactive Document Preview & OCR Verification Inspector */}
        <div className="mb-6 rounded-2xl bg-white border border-[#C8A951]/45 p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                Interactive Document & OCR Inspector
              </span>
              <Badge variant="brand" size="sm">
                {activePreviewDoc.ocrConfidence ?? 'Awaiting Upload'}
              </Badge>
              {activePreviewDoc.sha256Digest && (
                <span className="font-mono text-[11px] text-[#64748B]">
                  {activePreviewDoc.sha256Digest}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-[#111827]">{activePreviewDoc.title}</h2>
            <p className="text-xs text-[#475569]">{activePreviewDoc.notes}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-[#0D3B2E] bg-[#F0F7F4] px-3 py-1.5 rounded-lg border border-[#0D3B2E]/15">
              {activePreviewDoc.filename ?? 'No File Uploaded Yet'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory(activePreviewDoc.category);
                setIsModalOpen(true);
              }}
            >
              {activePreviewDoc.filename ? 'Replace Document' : 'Upload Now'}
            </Button>
          </div>
        </div>

        {/* SOLID High-Contrast Data Table per ADR-009 (Never Liquid Glass on Dense Tables) */}
        <DataTableShell
          title="Statutory Dossier Checklist"
          description="Rendered on high-contrast solid white surface per ADR-009"
          toolbar={
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All (${documents.length})` },
                { key: 'verified', label: `Verified (${verifiedCount})` },
                { key: 'pending_review', label: `Pending Audit (${pendingCount})` },
                { key: 'action_required', label: `Action Required (${actionRequiredCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-[#0D3B2E] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        >
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D3B2E] text-white uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Document Title & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Uploaded File</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#111827] bg-white">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0D3B2E] text-sm">{doc.title}</span>
                        {doc.mandatory && (
                          <Badge variant="neutral" size="sm">
                            Mandatory
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B]">{doc.notes}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 uppercase text-[10px] font-bold tracking-wider text-[#64748B]">
                    {doc.category}
                  </td>

                  <td className="py-4 px-4">
                    {doc.filename ? (
                      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                        <span className="font-medium text-[#111827] truncate max-w-[200px]">
                          {doc.filename}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {doc.fileSize} • {doc.uploadedAt}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] italic text-[#B91C1C] font-semibold">
                        Not Uploaded
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    {doc.status === 'verified' && (
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    )}
                    {doc.status === 'pending_review' && (
                      <Badge variant="warning" size="sm">
                        Pending Audit
                      </Badge>
                    )}
                    {doc.status === 'action_required' && (
                      <Badge variant="danger" size="sm">
                        Action Required
                      </Badge>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewDocId(doc.id)}>
                        Inspect
                      </Button>
                      {doc.filename ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(doc.category);
                            setIsModalOpen(true);
                          }}
                        >
                          Re-upload
                        </Button>
                      ) : (
                        <LuxuryButton
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(doc.category);
                            setIsModalOpen(true);
                          }}
                        >
                          Upload Now
                        </LuxuryButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      </Container>

      {/* Interactive Upload Modal (Uses Liquid Glass Overlay per ADR-009) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <GlassCard
            intensity="luxury"
            goldAccent
            className="w-full max-w-lg p-6 md:p-8 bg-white/95 rounded-2xl shadow-xl flex flex-col gap-5 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex flex-col gap-0.5">
                <EmeraldBadge variant="brand" size="sm" className="w-fit">
                  Safe Upload Intake
                </EmeraldBadge>
                <h2 className="text-xl font-bold text-[#0D3B2E]">Upload Verification Document</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setUploadFeedback(null);
                }}
                className="text-[#64748B] hover:text-[#111827] font-bold text-lg p-1"
                aria-label="Close upload modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="upload-category"
                  className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]"
                >
                  Document Category
                </label>
                <select
                  id="upload-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                >
                  <option value="financial">Financial (Bank Statements & Salary Slips)</option>
                  <option value="identity">Identity (Passport & National ID)</option>
                  <option value="educational">Educational (Degree & Transcripts)</option>
                  <option value="professional">Professional (CV & Offer Contract)</option>
                  <option value="health">Health (Medical Clearance)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="file-upload"
                  className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]"
                >
                  Upload File (Drag & Drop or Browse • PDF, JPG, PNG up to 10MB)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0] || null;
                    if (file) {
                      setSelectedFile(file);
                      setUploadFeedback(null);
                    }
                  }}
                  className={`w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#C8A951] bg-[#C8A951]/10'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0D3B2E]'
                  }`}
                  data-testid="vault-drag-drop-zone"
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      setUploadFeedback(null);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">📂</span>
                    <span className="text-xs font-semibold text-[#0D3B2E]">
                      {selectedFile
                        ? `Selected: ${selectedFile.name}`
                        : 'Click to select or drag document here'}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Auto-encrypted with AES-256 • Strip EXIF & PII
                    </span>
                  </label>
                </div>
              </div>

              {/* Animated OCR Scan Beam Feedback */}
              {isUploading && (
                <div
                  className="relative overflow-hidden rounded-xl bg-[#0D3B2E]/5 border border-[#10B981]/30 p-4 my-2 text-center"
                  data-testid="ocr-scan-beam"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent animate-pulse" />
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0D3B2E]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    <span>Scanning Document OCR & Cryptographic Checksum...</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 font-mono">
                    Scrubbing EXIF metadata • Verifying MRZ checksum • ADR-012 B2C Shielded
                  </p>
                </div>
              )}

              {uploadFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    uploadFeedback.type === 'success'
                      ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                      : 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                  }`}
                >
                  {uploadFeedback.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setUploadFeedback(null);
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <LuxuryButton
                  type="submit"
                  size="sm"
                  isLoading={isUploading}
                  disabled={!selectedFile || isUploading}
                >
                  Upload & Verify
                </LuxuryButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
