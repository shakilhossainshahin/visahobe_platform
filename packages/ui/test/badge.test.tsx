import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from '../src/components/Badge/Badge.js';

describe('Badge Component', () => {
  it('should render brand emerald pill by default', () => {
    const html = renderToStaticMarkup(<Badge>Verified</Badge>);
    expect(html).toContain('bg-[#E3EFEA]');
    expect(html).toContain('text-[#0D3B2E]');
    expect(html).toContain('Verified');
  });

  it('should render semantic status variants (success, warning, danger, info)', () => {
    const successHtml = renderToStaticMarkup(<Badge variant="success">Approved</Badge>);
    expect(successHtml).toContain('bg-[#DCFCE7]');
    expect(successHtml).toContain('text-[#15803D]');

    const warningHtml = renderToStaticMarkup(<Badge variant="warning">Pending</Badge>);
    expect(warningHtml).toContain('bg-[#FEF3C7]');
    expect(warningHtml).toContain('text-[#B45309]');

    const dangerHtml = renderToStaticMarkup(<Badge variant="danger">Rejected</Badge>);
    expect(dangerHtml).toContain('bg-[#FEE2E2]');
    expect(dangerHtml).toContain('text-[#B91C1C]');

    const infoHtml = renderToStaticMarkup(<Badge variant="info">In Review</Badge>);
    expect(infoHtml).toContain('bg-[#E0F2FE]');
    expect(infoHtml).toContain('text-[#0369A1]');
  });

  it('should render liquid glass badge variant', () => {
    const html = renderToStaticMarkup(<Badge variant="glass">Live Session</Badge>);
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('bg-white/80');
    expect(html).toContain('text-[#0D3B2E]');
  });

  it('should render status dot and pulsing dot indicator', () => {
    const dotHtml = renderToStaticMarkup(<Badge dot>Active</Badge>);
    expect(dotHtml).toContain('rounded-full');

    const pulseHtml = renderToStaticMarkup(
      <Badge dot dotPulse>
        Realtime
      </Badge>,
    );
    expect(pulseHtml).toContain('animate-ping');
  });
});
