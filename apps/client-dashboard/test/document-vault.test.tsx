import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DocumentVaultPage from '../app/documents/page.js';

describe('Client Dashboard Document Vault (ADR-009 Solid High-Contrast Table)', () => {
  it('renders page header and statutory document checklist titles', () => {
    const html = renderToStaticMarkup(<DocumentVaultPage />);
    expect(html).toContain('Document Vault &amp; Verification Checklist');
    expect(html).toContain('VH-2026-SG-4921');
    expect(html).toContain('International Passport (Bio-data &amp; Stamp Pages)');
    expect(html).toContain('BSc Computer Science Degree Certificate');
    expect(html).toContain('Official Academic Transcripts');
    expect(html).toContain('Singapore Employment Contract &amp; Offer Letter');
    expect(html).toContain('Detailed Professional Curriculum Vitae (CV)');
    expect(html).toContain('Six Months Bank Statements (Salary Credits)');
  });

  it('renders high-contrast data table with crisp white styling per ADR-009', () => {
    const html = renderToStaticMarkup(<DocumentVaultPage />);
    // Solid white surface for dense tables, not liquid glass
    expect(html).toContain('<table');
    expect(html).toContain('bg-white');
    expect(html).toContain('border-[#E2E8F0]');
  });

  it('renders correct verification status badges', () => {
    const html = renderToStaticMarkup(<DocumentVaultPage />);
    expect(html).toContain('Verified');
    expect(html).toContain('Pending Audit');
    expect(html).toContain('Action Required');
    expect(html).toContain('Not Uploaded');
  });

  it('renders metric badges bar with verified counters', () => {
    const html = renderToStaticMarkup(<DocumentVaultPage />);
    expect(html).toContain('Total Checklist Items');
    expect(html).toContain('Verified Clear');
    expect(html).toContain('Pending Audit');
  });
});
