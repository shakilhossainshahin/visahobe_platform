import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('PWA Manifest Invariants (TICKET-P2-001)', () => {
  const manifestPath = path.resolve(__dirname, '../public/manifest.webmanifest');

  it('ensures manifest.webmanifest exists and is valid JSON', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed).toBeDefined();
  });

  it('enforces required PWA metadata, standalone display, and brand theme', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('VisaHobe Command Center');
    expect(manifest.short_name).toBe('VH Ops');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0D3B2E');
    expect(manifest.background_color).toBe('#FFFFFF');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
  });
});
