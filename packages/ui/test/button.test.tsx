import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../src/components/Button/Button.js';

describe('Button Component', () => {
  it('should render primary variant with dark green background (#0D3B2E)', () => {
    const html = renderToStaticMarkup(<Button>Apply Now</Button>);
    expect(html).toContain('Apply Now');
    expect(html).toContain('bg-[#0D3B2E]');
    expect(html).toContain('text-white');
    expect(html).toContain('type="button"');
  });

  it('should render liquid glass variant with frosted translucency and specular styling', () => {
    const html = renderToStaticMarkup(<Button variant="glass">Interactive Overlay</Button>);
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('bg-white/80');
    expect(html).toContain('shadow-glass');
    expect(html).toContain('text-[#0D3B2E]');
  });

  it('should render outline and ghost variants', () => {
    const outlineHtml = renderToStaticMarkup(<Button variant="outline">Learn More</Button>);
    expect(outlineHtml).toContain('border-2 border-[#0D3B2E]');

    const ghostHtml = renderToStaticMarkup(<Button variant="ghost">Dismiss</Button>);
    expect(ghostHtml).toContain('bg-transparent');
    expect(ghostHtml).toContain('text-[#0D3B2E]');
  });

  it('should render danger and secondary variants', () => {
    const dangerHtml = renderToStaticMarkup(<Button variant="danger">Delete</Button>);
    expect(dangerHtml).toContain('bg-[#B91C1C]');

    const secondaryHtml = renderToStaticMarkup(<Button variant="secondary">Cancel</Button>);
    expect(secondaryHtml).toContain('bg-[#F8FAFC]');
  });

  it('should render small and large sizes', () => {
    const smHtml = renderToStaticMarkup(<Button size="sm">Small</Button>);
    expect(smHtml).toContain('text-xs');

    const lgHtml = renderToStaticMarkup(<Button size="lg">Large</Button>);
    expect(lgHtml).toContain('text-base');
  });

  it('should handle loading state with spinner and accessibility attributes', () => {
    const html = renderToStaticMarkup(
      <Button isLoading loadingText="Submitting...">
        Submit
      </Button>,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('Submitting...');
    expect(html).toContain('animate-spin');
    expect(html).toContain('data-testid="loading-spinner"');
  });

  it('should render left and right icon slots', () => {
    const html = renderToStaticMarkup(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Navigate
      </Button>,
    );
    expect(html).toContain('data-testid="left-icon"');
    expect(html).toContain('data-testid="right-icon"');
    expect(html).toContain('Navigate');
  });
});
