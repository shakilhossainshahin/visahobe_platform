'use client';

import React, { useState } from 'react';
import { Container, GlassCard, Badge, Button } from '@visahobe/ui';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('financial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const pendingCount = documents.filter((d) => d.status === 'pending_review').length;
  const actionRequiredCount = documents.filter((d) => d.status === 'action_required').length;

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

      // Update local state for matching category
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
    <div className="py-8 md:py-12 flex flex-col gap-8 bg-[#F8FAFC] min-h-screen">
      {/* Header & Status Summary */}
      <Container size="2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                Encrypted Vault
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

          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            + Upload New Document
          </Button>
        </div>

        {/* Metric Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-1">
            <span className="text-xs text-[#64748B]">Total Checklist Items</span>
            <span className="text-xl font-bold text-[#0D3B2E]">{documents.length}</span>
            <span className="text-[11px] text-[#64748B]">MOM Statutory Requirements</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-1">
            <span className="text-xs text-[#64748B]">Verified Clear</span>
            <span className="text-xl font-bold text-[#15803D]">{verifiedCount}</span>
            <span className="text-[11px] text-[#15803D]">Passed all checks</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-1">
            <span className="text-xs text-[#64748B]">Pending Audit</span>
            <span className="text-xl font-bold text-[#B45309]">{pendingCount}</span>
            <span className="text-[11px] text-[#B45309]">Specialist review queued</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-1">
            <span className="text-xs text-[#64748B]">Action Required</span>
            <span className="text-xl font-bold text-[#B91C1C]">{actionRequiredCount}</span>
            <span className="text-[11px] text-[#B91C1C]">Upload immediately</span>
          </div>
        </div>

        {/* SOLID High-Contrast Data Table per ADR-009 (Never Liquid Glass on Dense Tables) */}
        <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Document Title & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Uploaded File</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
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
                        <span className="font-medium text-[#0F172A] truncate max-w-[200px]">
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
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(doc.category);
                          setIsModalOpen(true);
                        }}
                      >
                        Upload Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>

      {/* Interactive Upload Modal (Uses Liquid Glass Overlay per ADR-009) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <GlassCard
            intensity="elevated"
            className="w-full max-w-lg p-6 md:p-8 bg-white/95 rounded-2xl shadow-xl flex flex-col gap-5 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex flex-col gap-0.5">
                <Badge variant="brand" size="sm" className="w-fit">
                  Safe Upload Intake
                </Badge>
                <h2 className="text-xl font-bold text-[#0D3B2E]">Upload Verification Document</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setUploadFeedback(null);
                }}
                className="text-[#64748B] hover:text-[#0F172A] font-bold text-lg p-1"
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
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
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
                  Select File (PDF, JPG, PNG up to 10MB)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                    setUploadFeedback(null);
                  }}
                  className="w-full rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
                <span className="text-[11px] text-[#64748B]">
                  Windows & POSIX directory paths are sanitized. EXIF metadata is stripped
                  server-side.
                </span>
              </div>

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
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUploading}
                  disabled={!selectedFile || isUploading}
                >
                  Upload & Verify
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
