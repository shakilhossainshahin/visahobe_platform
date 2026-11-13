import { describe, it, expect } from 'vitest';
import { colors, liquidGlassConfig } from '../src/tokens/index.js';

describe('Design Tokens Contract Test', () => {
  it('should enforce primary dark green brand color (#0D3B2E)', () => {
    expect(colors.brand[700]).toBe('#0D3B2E');
  });

  it('should enforce white canvas background', () => {
    expect(colors.bg).toBe('#FDFDFD');
    expect(colors.surface).toBe('#FFFFFF');
  });

  it('should define liquid glass allowed and forbidden surfaces', () => {
    expect(liquidGlassConfig.allowedSurfaces).toContain('command-palette');
    expect(liquidGlassConfig.forbiddenSurfaces).toContain('data-tables');
    expect(liquidGlassConfig.forbiddenSurfaces).toContain('financial-ledgers');
  });
});
