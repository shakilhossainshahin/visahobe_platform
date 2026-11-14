import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CmsEditorialPage from '../app/cms/page.js';

describe('CMS Editorial Policy Review & Publishing Queue (TICKET-P2-001)', () => {
  it('renders all launch destination policy guides from @visahobe/cms', () => {
    const html = renderToStaticMarkup(<CmsEditorialPage />);

    expect(html).toContain('CMS Editorial Policy Review');
    expect(html).toContain('Singapore');
    expect(html).toContain('Germany');
    expect(html).toContain('United Kingdom');
    expect(html).toContain('Canada');
    expect(html).toContain('Australia');
    expect(html).toContain('United Arab Emirates');
  });

  it('renders editorial status badges and active stream indicators', () => {
    const html = renderToStaticMarkup(<CmsEditorialPage />);

    expect(html).toContain('data-testid="cms-guides-table"');
    expect(html).toContain('Published');
    expect(html).toContain('Published Guides');
    expect(html).toContain('Preview Guide');
  });
});
