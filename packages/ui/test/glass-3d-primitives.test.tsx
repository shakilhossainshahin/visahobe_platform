import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AuroraParallaxBackdrop,
  Glass3DCard,
  ParallaxStage,
  ParallaxLayer,
  ScrollReveal3D,
  FloatingGlassDock,
} from '../src/index.js';

describe('Shared 3D Glassmorphism & Parallax Engine Primitives (TICKET-P5-002 / TICKET-P5-003 / TICKET-P5-004)', () => {
  it('renders AuroraParallaxBackdrop with dark variant and obsidian background', () => {
    const html = renderToStaticMarkup(
      <AuroraParallaxBackdrop variant="dark" intensity="vibrant" showParticles={true}>
        <div data-testid="test-content">Hero Headline</div>
      </AuroraParallaxBackdrop>,
    );

    expect(html).toContain('data-testid="aurora-parallax-backdrop"');
    expect(html).toContain('bg-[#030908]');
    expect(html).toContain('from-[#0D3B2E]');
    expect(html).toContain('from-[#C8A951]');
    expect(html).toContain('data-testid="test-content"');
    expect(html).toContain('Hero Headline');
  });

  it('renders AuroraParallaxBackdrop with vibrant travel theme canvas and ocean azure / sunset coral orbs', () => {
    const html = renderToStaticMarkup(
      <AuroraParallaxBackdrop variant="travel" intensity="vibrant" showParticles={true}>
        <div data-testid="test-content-travel">Vibrant Travel Experience</div>
      </AuroraParallaxBackdrop>,
    );

    expect(html).toContain('data-testid="aurora-parallax-backdrop"');
    expect(html).toContain('from-[#F0F9FF]');
    expect(html).toContain('from-[#0284C7]');
    expect(html).toContain('from-[#F97316]');
    expect(html).toContain('text-[#0F172A]');
    expect(html).toContain('Vibrant Travel Experience');
  });

  it('renders Glass3DCard with rock-solid hover, frosted blur, and specular top reflection', () => {
    const html = renderToStaticMarkup(
      <Glass3DCard glowColor="gold" specular={true} spotlight={false}>
        <div className="p-6">
          <h3>Visa Pass Hologram</h3>
        </div>
      </Glass3DCard>,
    );

    expect(html).toContain('data-testid="glass-3d-card"');
    expect(html).toContain('backdrop-blur-2xl');
    expect(html).toContain('border-white/60');
    expect(html).toContain('via-white/70'); // Specular top reflection
    expect(html).toContain('hover:border-[#C8A951]/60');
    expect(html).toContain('hover:-translate-y-1');
    expect(html).toContain('Visa Pass Hologram');
  });

  it('renders ParallaxStage with 3D perspective and depth speed wrapper', () => {
    const html = renderToStaticMarkup(
      <ParallaxStage perspective={1200} depthSpeed={0.1}>
        <div>Stage Content</div>
      </ParallaxStage>,
    );

    expect(html).toContain('data-testid="parallax-stage"');
    expect(html).toContain('perspective:1200px');
    expect(html).toContain('transform-style:preserve-3d');
    expect(html).toContain('Stage Content');
  });

  it('renders ParallaxLayer with zOffset and speed attributes', () => {
    const html = renderToStaticMarkup(
      <ParallaxLayer speed={0.2} zOffset={40}>
        <div>Parallax Foreground Element</div>
      </ParallaxLayer>,
    );

    expect(html).toContain('data-testid="parallax-layer"');
    expect(html).toContain('transform-style:preserve-3d');
    expect(html).toContain('Parallax Foreground Element');
  });

  it('renders ScrollReveal3D with initial 3D transform and opacity', () => {
    const html = renderToStaticMarkup(
      <ScrollReveal3D direction="up" delayMs={150}>
        <div>Animated Card</div>
      </ScrollReveal3D>,
    );

    expect(html).toContain('data-testid="scroll-reveal-3d"');
    expect(html).toContain('Animated Card');
  });

  it('renders FloatingGlassDock with specular highlight, active pill indicators, and mobile hiding', () => {
    const dockItems = [
      { id: 'home', label: 'Home', href: '/', active: true },
      { id: 'vault', label: 'Document Vault', href: '/documents', badge: '3 Pending' },
      { id: 'live', label: 'Live AI Officer', href: '/live-stream' },
    ];

    const html = renderToStaticMarkup(
      <FloatingGlassDock items={dockItems} position="floating" hideOnMobile={true} />,
    );

    expect(html).toContain('data-testid="floating-glass-dock"');
    expect(html).toContain('aria-label="Floating Glass Dock"');
    expect(html).toContain('backdrop-blur-2xl');
    expect(html).toContain('bg-[#092A21]/70');
    expect(html).toContain('hidden md:block');
    expect(html).toContain('Home');
    expect(html).toContain('Document Vault');
    expect(html).toContain('3 Pending');
    expect(html).toContain('Live AI Officer');
    expect(html).toContain('bg-[#C8A951]'); // Active pill indicator
  });
});
