import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Card,
  GlassCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../src/components/Card/Card.js';

describe('Card & GlassCard Components', () => {
  it('should render standard Card with white surface and subtle border', () => {
    const html = renderToStaticMarkup(
      <Card>
        <p>Card Body</p>
      </Card>,
    );
    expect(html).toContain('bg-white');
    expect(html).toContain('border-[#E2E8F0]');
    expect(html).toContain('Card Body');
  });

  it('should render GlassCard with frosted liquid glass and specular highlights', () => {
    const html = renderToStaticMarkup(
      <GlassCard intensity="standard">
        <p>Glass Content</p>
      </GlassCard>,
    );
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('bg-white/85');
    expect(html).toContain('shadow-glass');
    expect(html).toContain('before:h-px');
    expect(html).toContain('Glass Content');
  });

  it('should render GlassCard with elevated intensity', () => {
    const html = renderToStaticMarkup(
      <GlassCard intensity="elevated">
        <p>Elevated Content</p>
      </GlassCard>,
    );
    expect(html).toContain('backdrop-blur-lg');
    expect(html).toContain('bg-white/90');
    expect(html).toContain('shadow-glassElevated');
  });

  it('should render complete Card structure with header, title, description, content and footer', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Visa Eligibility Assessment</CardTitle>
          <CardDescription>Instant evaluation powered by AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Score: 94%</div>
        </CardContent>
        <CardFooter>
          <button type="button">Proceed</button>
        </CardFooter>
      </Card>,
    );

    expect(html).toContain('Visa Eligibility Assessment');
    expect(html).toContain('Instant evaluation powered by AI');
    expect(html).toContain('Score: 94%');
    expect(html).toContain('Proceed');
  });
});
