import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  InteractiveVisaGlobe,
  STANDARD_GLOBE_DESTINATIONS,
  type GlobeDestination,
} from '../src/index.js';

describe('InteractiveVisaGlobe Component (ADR-009 / 3D Locator)', () => {
  it('renders interactive visa globe with header, origin DAC, and radar title', () => {
    const html = renderToStaticMarkup(
      <InteractiveVisaGlobe
        selectedDestinationId="singapore"
        destinations={STANDARD_GLOBE_DESTINATIONS}
      />,
    );

    expect(html).toContain('Interactive Global Visa Locator');
    expect(html).toContain('Live 3D Consular Radar • 60 FPS');
    expect(html).toContain('Dhaka (DAC)');
    expect(html).toContain('data-testid="interactive-visa-globe"');
  });

  it('renders Country Intelligence Card with live SLA, approval rate, and fees', () => {
    const html = renderToStaticMarkup(
      <InteractiveVisaGlobe
        selectedDestinationId="singapore"
        destinations={STANDARD_GLOBE_DESTINATIONS}
        showIntelligenceCard={true}
      />,
    );

    expect(html).toContain('Singapore');
    expect(html).toContain('Employment Pass (COMPASS)');
    expect(html).toContain('Level 3: Autonomous e-Visa');
    expect(html).toContain('3-8 Weeks');
    expect(html).toContain('99.4%');
    expect(html).toContain('S$360 MOM Lodgment');
    expect(html).toContain('$290 Platform');
    expect(html).toContain('Start AI Assessment for Singapore');
  });

  it('renders 2D SVG vector fallback gracefully in server/non-WebGL environments', () => {
    const html = renderToStaticMarkup(
      <InteractiveVisaGlobe
        selectedDestinationId="uae"
        destinations={STANDARD_GLOBE_DESTINATIONS}
      />,
    );

    expect(html).toContain('data-testid="globe-svg-fallback"');
    expect(html).toContain('DAC (Dhaka)');
    expect(html).toContain('United Arab Emirates');
  });

  it('renders destination quick pills for multiple countries', () => {
    const html = renderToStaticMarkup(
      <InteractiveVisaGlobe
        selectedDestinationId="uk"
        destinations={STANDARD_GLOBE_DESTINATIONS}
      />,
    );

    expect(html).toContain('Singapore');
    expect(html).toContain('United Kingdom');
    expect(html).toContain('Germany / Schengen');
    expect(html).toContain('Canada');
  });

  it('allows custom destinations and origin city configuration', () => {
    const customDestinations: GlobeDestination[] = [
      {
        id: 'japan',
        name: 'Japan',
        countryCode: 'JP',
        flag: '🇯🇵',
        slug: 'japan',
        lat: 36.2048,
        lng: 138.2529,
        category: 'Highly Skilled Professional',
        processingTime: '2-4 Weeks',
        approvalRate: '99.2%',
        autonomyLevel: 'Level 2: Semi-Autonomous',
        govFee: '¥3,000 MOFA',
        serviceFee: '$250 Platform',
        fastestRoute: 'Fast-Track Points System',
        requirementsSummary: '70+ Points on HSP Matrix',
      },
    ];

    const html = renderToStaticMarkup(
      <InteractiveVisaGlobe
        destinations={customDestinations}
        selectedDestinationId="japan"
        originCity={{ name: 'Chittagong', code: 'CGP', lat: 22.3569, lng: 91.7832 }}
      />,
    );

    expect(html).toContain('Japan');
    expect(html).toContain('Highly Skilled Professional');
    expect(html).toContain('Start AI Assessment for Japan');
    expect(html).toContain('CGP (Chittagong)');
  });
});
