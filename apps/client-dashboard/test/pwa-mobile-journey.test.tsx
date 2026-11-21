import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GamifiedJourneyTracker } from '../components/GamifiedJourneyTracker.js';
import { MobileBottomNav } from '../components/MobileBottomNav.js';
import { capacitorConfig } from '../capacitor.config.js';

describe('Client Dashboard PWA, Capacitor & Mobile Gamified Journey (TICKET-P5-001)', () => {
  it('has a valid PWA manifest matching brand parameters and standalone mode', () => {
    const manifestPath = path.resolve(__dirname, '../public/manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifestContent.name).toBe('VisaHobe — Applicant Workspace');
    expect(manifestContent.short_name).toBe('VisaHobe');
    expect(manifestContent.display).toBe('standalone');
    expect(manifestContent.theme_color).toBe('#0D3B2E');
    expect(manifestContent.background_color).toBe('#F8FAFC');
    expect(manifestContent.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('configures Capacitor 6 container with com.visahobe.client and Deep Emerald theme', () => {
    expect(capacitorConfig.appId).toBe('com.visahobe.client');
    expect(capacitorConfig.appName).toBe('VisaHobe');
    expect(capacitorConfig.webDir).toBe('out');
    expect(capacitorConfig.android?.backgroundColor).toBe('#0D3B2E');
  });

  it('renders GamifiedJourneyTracker with circular progress gauge and all 5 pipeline stages', () => {
    const html = renderToStaticMarkup(
      <GamifiedJourneyTracker
        caseNumber="VH-2026-SG-4921"
        destinationCountry="Singapore"
        visaStream="Employment Pass (COMPASS)"
      />,
    );

    expect(html).toContain('data-testid="gamified-journey-tracker"');
    expect(html).toContain('Dossier Velocity');
    expect(html).toContain('On Track for MOM EP Approval');
    expect(html).toContain('AI Intake');
    expect(html).toContain('OCR Vault');
    expect(html).toContain('Form Auto-Fill');
    expect(html).toContain('Safety Gate');
    expect(html).toContain('Embassy Lodgment');
  });

  it('renders MobileBottomNav with high-contrast touch targets and safe area insets', () => {
    const html = renderToStaticMarkup(<MobileBottomNav />);
    expect(html).toContain('data-testid="mobile-bottom-nav"');
    expect(html).toContain('Home');
    expect(html).toContain('Journey');
    expect(html).toContain('Vault');
    expect(html).toContain('Live AI');
    expect(html).toContain('Messages');
  });

  it('renders unified 3D glassmorphism, Aurora Parallax Backdrop, and Floating Glass Dock', async () => {
    const { default: ClientDashboardOverviewPage } = await import('../app/page.js');
    const html = renderToStaticMarkup(<ClientDashboardOverviewPage />);
    expect(html).toContain('data-testid="aurora-parallax-backdrop"');
    expect(html).toContain('data-testid="glass-3d-card"');
    expect(html).toContain('data-testid="floating-glass-dock"');
  });
});
