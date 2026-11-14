import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import HomePage from '../app/page.js';

describe('Website Landing Page (HomePage)', () => {
  it('should render authoritative headline and dark-green branding', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('Global Visas &amp; Relocation Powered by');
    expect(html).toContain('Intelligent AI Operations');
    expect(html).toContain('text-[#0D3B2E]');
  });

  it('should render Liquid Glass hero status pill', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('99.2% Verification Accuracy • AI + Licensed Human Verifiers');
    expect(html).toContain('backdrop-blur-md');
  });

  it('should render quick selector preview with destinations', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('Singapore (Employment Pass / Tech)');
    expect(html).toContain('Germany / Schengen (EU Blue Card)');
    expect(html).toContain('Evaluate Criteria');
  });

  it('should render popular migration pathways cards', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('High-Success Migration Pathways');
    expect(html).toContain('Singapore');
    expect(html).toContain('Germany / Schengen');
    expect(html).toContain('United Kingdom');
    expect(html).toContain('Canada');
    expect(html).toContain('Australia');
    expect(html).toContain('United Arab Emirates');
  });

  it('should render transparent 4-step AI + Human workflow pipeline', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('How VisaHobe AI + Human Verification Works');
    expect(html).toContain('Intelligent Intake');
    expect(html).toContain('AI OCR &amp; Document Validation');
    expect(html).toContain('Licensed Specialist Sign-Off');
    expect(html).toContain('Submission &amp; Live Milestones');
  });

  it('should render enterprise trust and security guarantees', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('Enterprise Data Privacy &amp; Legal Integrity');
    expect(html).toContain('PostgreSQL Row-Level Security');
    expect(html).toContain('Defense-in-Depth PII Redaction');
    expect(html).toContain('Strict PostgreSQL Row-Level Security on all database tables');
  });
});
