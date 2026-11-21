import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SuperAdminDashboardPage from '../app/page.js';

describe('Super Admin Mission Control & Telemetry Deck (ADR-009, ADR-011, TICKET-P5-001)', () => {
  it('renders executive Mission Control deck container', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('data-testid="mission-control-deck"');
    expect(html).toContain('Mission Control • Live Consular Operations Deck');
    expect(html).toContain('Autonomous AI vs Human Intervention Telemetry');
    expect(html).toContain('Live Edge Sync • 0.2s');
    expect(html).toContain('Launch Live Browser Console →');
  });

  it('renders Autonomy Distribution Ratio gauge with Level 3 stats', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Autonomy Distribution Ratio');
    expect(html).toContain('78% Autonomous');
    expect(html).toContain('78% Level 3 Autonomous');
    expect(html).toContain('22% Human Intervention Gate');
    expect(html).toContain('Zero Gate Breaches');
  });

  it('renders Country Pipeline Distribution cards across launch jurisdictions', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Country Pipeline Distribution');
    expect(html).toContain('142 Cases');
    expect(html).toContain('🇸🇬 Singapore');
    expect(html).toContain('🇦🇪 UAE Golden');
    expect(html).toContain('🇬🇧 UK Skilled');
    expect(html).toContain('🇩🇪 Germany');
    expect(html).toContain('🇨🇦 Canada PR');
  });

  it('renders Prepaid Agency Wallet Liquidity overview with low balance alerts', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Prepaid Wallet Liquidity (ADR-010)');
    expect(html).toContain('$148,500.00');
    expect(html).toContain('14 Agencies');
    expect(html).toContain('Low Balance Alerts (&lt; $500)');
    expect(html).toContain('2 Agencies');
    expect(html).toContain('$12,450.00');
    expect(html).toContain('Zero-Overdraft Invariant Enforced');
  });

  it('renders Prioritized Consular Safety Gate & Live Browser Takeover Queue', () => {
    const html = renderToStaticMarkup(<SuperAdminDashboardPage />);

    expect(html).toContain('Prioritized Consular Safety Gate &amp; Live Browser Takeover Queue');
    expect(html).toContain('3 Sessions Paused at Safety Checkpoint • Staff Authorization Required');
    expect(html).toContain('VH-2026-SG-4921');
    expect(html).toContain('🇸🇬 Singapore MOM');
    expect(html).toContain('portal_payment (S$360 Lodgment Fee)');
    expect(html).toContain('/browser?sessionId=sess-brw-sg-4921');
    expect(html).toContain('VH-2026-AE-2104');
    expect(html).toContain('captcha_detected (Cloudflare Turnstile)');
    expect(html).toContain('/browser?sessionId=sess-brw-ae-2104');
    expect(html).toContain('Take Over in Live Browser');
  });
});
