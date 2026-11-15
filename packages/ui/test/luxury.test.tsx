import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GlassCard,
  LuxuryButton,
  EmeraldBadge,
  StatKpiCard,
  DataTableShell,
  StepProgressRail,
} from '../src/index.js';

describe('Flagship Luxury & Liquid Glass UI Primitives (TICKET-P2-006)', () => {
  it('should render GlassCard with luxury intensity and Champagne Gold accent divider', () => {
    const html = renderToStaticMarkup(
      <GlassCard intensity="luxury" goldAccent>
        <p>Executive Glass Overlay</p>
      </GlassCard>,
    );
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('border-[#C8A951]/45');
    expect(html).toContain('Executive Glass Overlay');
  });

  it('should render LuxuryButton with Deep Emerald fill and Champagne Gold trim', () => {
    const html = renderToStaticMarkup(<LuxuryButton>Begin Executive Intake</LuxuryButton>);
    expect(html).toContain('bg-[#0D3B2E]');
    expect(html).toContain('border-[#C8A951]/70');
    expect(html).toContain('ring-[#C8A951]/40');
    expect(html).toContain('Begin Executive Intake');
  });

  it('should render EmeraldBadge with Champagne Gold accent border and status dot', () => {
    const html = renderToStaticMarkup(
      <EmeraldBadge variant="luxury" dotPulse>
        Consular Verified
      </EmeraldBadge>,
    );
    expect(html).toContain('bg-[#0D3B2E]');
    expect(html).toContain('border-[#C8A951]/45');
    expect(html).toContain('Consular Verified');
  });

  it('should render StatKpiCard with Liquid Glass surface and Champagne Gold divider', () => {
    const html = renderToStaticMarkup(
      <StatKpiCard
        label="Approval Velocity"
        value="99.4%"
        subvalue="Verified across 18 consular corridors"
        trend={{ label: '+2.4% QoQ', direction: 'up' }}
      />,
    );
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('Approval Velocity');
    expect(html).toContain('99.4%');
    expect(html).toContain('+2.4% QoQ');
  });

  it('should render DataTableShell with solid white surface and zero backdrop-blur (ADR-009)', () => {
    const html = renderToStaticMarkup(
      <DataTableShell
        title="Active Consular Dossiers"
        description="Solid high-contrast operational table"
        toolbar={<button type="button">Filter</button>}
        footer={<span>Showing 12 of 12 records</span>}
      >
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
            </tr>
          </thead>
        </table>
      </DataTableShell>,
    );
    expect(html).toContain('bg-white');
    expect(html).not.toContain('backdrop-blur');
    expect(html).toContain('Active Consular Dossiers');
    expect(html).toContain('Showing 12 of 12 records');
  });

  it('should render StepProgressRail with 5-stage application tracker and active step indicator', () => {
    const steps = [
      { id: 'intake', label: '1. Intake', status: 'completed' as const, timestamp: 'Oct 10' },
      {
        id: 'vault',
        label: '2. Document Vault',
        status: 'completed' as const,
        timestamp: 'Oct 12',
      },
      {
        id: 'audit',
        label: '3. Legal & OCR Audit',
        status: 'current' as const,
        description: 'Specialist verifying financial ledger',
      },
      { id: 'submission', label: '4. Consular Dispatch', status: 'upcoming' as const },
      { id: 'decision', label: '5. Visa Issuance', status: 'upcoming' as const },
    ];
    const html = renderToStaticMarkup(<StepProgressRail steps={steps} />);
    expect(html).toContain('1. Intake');
    expect(html).toContain('3. Legal &amp; OCR Audit');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('bg-[#0D3B2E]');
    expect(html).toContain('border-[#C8A951]');
  });
});
