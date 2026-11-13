import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Container, Section } from '../src/components/Layout/index.js';

describe('Layout Primitives (Container, Section)', () => {
  describe('Container', () => {
    it('should render container with 2xl default constraint and responsive padding', () => {
      const html = renderToStaticMarkup(
        <Container>
          <div>Centered Content</div>
        </Container>,
      );
      expect(html).toContain('max-w-7xl');
      expect(html).toContain('mx-auto');
      expect(html).toContain('px-4 sm:px-6 lg:px-8');
      expect(html).toContain('Centered Content');
    });

    it('should support size options (sm, lg, full)', () => {
      const smHtml = renderToStaticMarkup(<Container size="sm">Small</Container>);
      expect(smHtml).toContain('max-w-screen-sm');

      const fullHtml = renderToStaticMarkup(<Container size="full">Full</Container>);
      expect(fullHtml).toContain('max-w-full');
    });
  });

  describe('Section', () => {
    it('should render semantic <section> tag by default with default padding', () => {
      const html = renderToStaticMarkup(
        <Section>
          <h2>Section Title</h2>
        </Section>,
      );
      expect(html).toContain('<section');
      expect(html).toContain('bg-white');
      expect(html).toContain('py-12 sm:py-16');
      expect(html).toContain('Section Title');
    });

    it('should support brand background variant (#0D3B2E)', () => {
      const html = renderToStaticMarkup(
        <Section variant="brand">
          <p>Hero Brand</p>
        </Section>,
      );
      expect(html).toContain('bg-[#0D3B2E]');
      expect(html).toContain('text-white');
    });

    it('should support liquid glass section variant', () => {
      const html = renderToStaticMarkup(
        <Section variant="glass">
          <p>Glass Section</p>
        </Section>,
      );
      expect(html).toContain('backdrop-blur-md');
      expect(html).toContain('bg-white/80');
      expect(html).toContain('border-y border-white/60');
    });

    it('should render custom HTML element tag via "as" prop', () => {
      const html = renderToStaticMarkup(
        <Section as="article" padding="lg">
          <p>Article Section</p>
        </Section>,
      );
      expect(html).toContain('<article');
      expect(html).toContain('py-16 sm:py-24');
    });
  });
});
