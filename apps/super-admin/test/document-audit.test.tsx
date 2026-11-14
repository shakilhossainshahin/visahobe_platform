import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DocumentAuditPage from '../app/audit/page.js';

describe('Document Verification & OCR Diff Audit (TICKET-P2-001)', () => {
  it('renders document metadata and scrubbed file attributes', () => {
    const html = renderToStaticMarkup(<DocumentAuditPage />);

    expect(html).toContain('Document Verification &amp; OCR Diff Audit');
    expect(html).toContain('singapore_ep_passport_bio.pdf');
    expect(html).toContain('VH-2026-SG-4921');
    expect(html).toContain('2.4 MB');
    expect(html).toContain('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('renders side-by-side OCR extraction comparison table with masked values', () => {
    const html = renderToStaticMarkup(<DocumentAuditPage />);

    expect(html).toContain('data-testid="ocr-diff-table"');
    expect(html).toContain('Full Legal Name');
    expect(html).toContain('T***** A**** (Masked)');
    expect(html).toContain('Document Number');
    expect(html).toContain('A******8 (Masked)');
    expect(html).toContain('Date of Expiry');
    expect(html).toContain('18 Nov 2031');
    expect(html).toContain('Issuing Authority');
  });

  it('renders decision actions for certification and resubmission request', () => {
    const html = renderToStaticMarkup(<DocumentAuditPage />);

    expect(html).toContain('Certify &amp; Approve Document');
    expect(html).toContain('Request Resubmission');
    expect(html).toContain('Unreadable scan / poor resolution');
  });
});
