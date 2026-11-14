import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SuperAdminDashboardPage from '../app/page.js';

describe('Case Operations Command Center & ADR-009 Queue (TICKET-P2-001)', () => {
  it('renders executive KPI summary cards with active counters', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Case Operations Command Center');
    expect(html).toContain('Active Cases');
    expect(html).toContain('142');
    expect(html).toContain('Pending Verification');
    expect(html).toContain('18');
    expect(html).toContain('SLA Critical Alerts');
    expect(html).toContain('3');
    expect(html).toContain('Approved Today');
    expect(html).toContain('12');
  });

  it('renders operational case table on solid white canvas strictly per ADR-009', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    // ADR-009 compliance check: must render in a solid white container with 1px border
    expect(html).toContain('data-testid="case-queue-table"');
    expect(html).toContain('bg-white');
    expect(html).toContain('border-[#E2E8F0]');

    // Table rows must NOT use liquid glass or backdrop-blur
    expect(html).not.toContain('backdrop-blur');
    expect(html).toContain('Compliance: ADR-009 Solid High-Contrast Table Verified');
  });

  it('renders critical case numbers and destination stream information', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('VH-2026-SG-4921');
    expect(html).toContain('Singapore');
    expect(html).toContain('Employment Pass (EP)');

    expect(html).toContain('VH-2026-DE-1082');
    expect(html).toContain('Germany');
    expect(html).toContain('EU Blue Card');

    expect(html).toContain('VH-2026-AU-4011');
    expect(html).toContain('Australia');
  });

  it('renders priority SLA badges (URGENT, HIGH, STANDARD)', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('URGENT');
    expect(html).toContain('HIGH');
    expect(html).toContain('STANDARD');
  });

  it('renders assigned caseworkers and file review trigger buttons', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Sarah Jenkins');
    expect(html).toContain('Michael Chen');
    expect(html).toContain('Review File');
  });
});
