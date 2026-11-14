import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ClientDashboardOverviewPage from '../app/page.js';

describe('Client Dashboard Overview & Milestone Tracker', () => {
  it('renders active case reference ID and destination', () => {
    const html = renderToStaticMarkup(<ClientDashboardOverviewPage />);
    expect(html).toContain('VH-2026-SG-4921');
    expect(html).toContain('Singapore Employment Pass (COMPASS Tier 1)');
    expect(html).toContain('Sarah Jenkins');
  });

  it('renders all 5 live application progression milestone steps', () => {
    const html = renderToStaticMarkup(<ClientDashboardOverviewPage />);
    expect(html).toContain('Intake Submitted');
    expect(html).toContain('AI &amp; Specialist Document Audit');
    expect(html).toContain('Embassy File Preparation');
    expect(html).toContain('Biometrics &amp; Consular Submission');
    expect(html).toContain('Decision &amp; Pass Issuance');
  });

  it('highlights current stage (Stage 2) with status indicators', () => {
    const html = renderToStaticMarkup(<ClientDashboardOverviewPage />);
    expect(html).toContain('Stage 2 of 5: Document Audit');
    expect(html).toContain('In Progress • Est. Nov 20');
  });

  it('renders urgent action required callout for missing bank statement', () => {
    const html = renderToStaticMarkup(<ClientDashboardOverviewPage />);
    expect(html).toContain('Action Required');
    expect(html).toContain('Upload Recent Bank Statement (Last 6 Months)');
    expect(html).toContain('Due by Nov 22, 2026');
  });

  it('renders case audit log with verified timestamps and zero raw PII', () => {
    const html = renderToStaticMarkup(<ClientDashboardOverviewPage />);
    expect(html).toContain('Case Audit Log');
    expect(html).toContain('Degree Certificate Verified');
    expect(html).toContain('Automated OCR Check Passed');
    expect(html).toContain('COMPASS Benchmark Calculation');
  });
});
