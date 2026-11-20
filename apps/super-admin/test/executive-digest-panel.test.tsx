import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SuperAdminDashboardPage from '../app/page.js';

describe('Super AI Agent & Daily Executive Digest Panel (TICKET-P3-001 / ADR-011)', () => {
  it('renders the Super AI Agent & Daily Executive Digest section header', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Super AI Agent Autonomy &amp; Daily Executive Digest');
    expect(html).toContain('data-testid="executive-digest-panel"');
    expect(html).toContain('Autonomy Ratio: 31.1%');
    expect(html).toContain('7 Safety Intercepts');
  });

  it('renders 3-tier autonomy level breakdown (L1, L2, L3) per ADR-011', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Autonomy Levels (ADR-011)');
    expect(html).toContain('Level 1 (Assisted Draft, &lt; 0.80):');
    expect(html).toContain('14 cases (23%)');
    expect(html).toContain('Level 2 (Semi-Autonomous, 0.80-0.94):');
    expect(html).toContain('28 cases (46%)');
    expect(html).toContain('Level 3 (Autonomous, &gt;= 0.95):');
    expect(html).toContain('19 cases (31%)');
    expect(html).toContain(
      'Standard e-Visas (SG, AE, TR, MY, VN) qualified for autonomous filing.',
    );
  });

  it('renders consular safety guard intercept counters for restricted actions', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Consular Safety Intercepts');
    expect(html).toContain('Live Portal Payments:');
    expect(html).toContain('3 blocked');
    expect(html).toContain('Biometric / VAC Schedulers:');
    expect(html).toContain('3 blocked');
    expect(html).toContain('Perjury Statutory Affidavits:');
    expect(html).toContain('1 blocked');
    expect(html).toContain('All high-risk actions halted at human verifier gate');
  });

  it('renders financial low balance agencies and SLA breach alerts', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Partner Wallet &amp; SLA Alerts');
    expect(html).toContain('Low Balance (&lt; $500):');
    expect(html).toContain('1 Agency ($420.00)');
    expect(html).toContain('Critical SLA (&gt; 48h in review):');
    expect(html).toContain('VH-2026-DE-2041 (52h)');
  });

  it('renders interactive evaluation simulator controls with country selector and action toggles', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Interactive Super AI Agent Evaluation Simulator');
    expect(html).toContain('Destination Jurisdiction');
    expect(html).toContain('Singapore (SG - e-Visa Allowlist)');
    expect(html).toContain('United States (US - Consular Interview Gate)');
    expect(html).toContain('Simulate Restricted Actions (ADR-011)');
    expect(html).toContain('Portal Payment');
    expect(html).toContain('Biometrics Booking');
    expect(html).toContain('Run Super Agent Evaluation');
  });
});
