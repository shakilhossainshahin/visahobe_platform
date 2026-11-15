import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Vercel Monorepo Configuration — @visahobe/client-dashboard (TICKET-P2-005)', () => {
  const appRoot = path.resolve(__dirname, '..');
  const vercelConfigPath = path.resolve(appRoot, 'vercel.json');
  const packageJsonPath = path.resolve(appRoot, 'package.json');

  it('ensures vercel.json exists and is valid JSON', () => {
    expect(fs.existsSync(vercelConfigPath)).toBe(true);
    const content = fs.readFileSync(vercelConfigPath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe('object');
  });

  it('validates Vercel Next.js framework preset, installCommand, and Turborepo build filter', () => {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(config.$schema).toBe('https://openapi.vercel.sh/vercel.json');
    expect(config.framework).toBe('nextjs');
    expect(config.installCommand).toBe('pnpm install --frozen-lockfile');

    // Build command must invoke turbo with valid package filter
    expect(config.buildCommand).toBeDefined();
    expect(config.buildCommand).toContain(`--filter=${pkg.name}...`);
    expect(config.buildCommand).toMatch(
      /turbo run build --filter=@visahobe\/client-dashboard\.\.\./,
    );
  });
});
