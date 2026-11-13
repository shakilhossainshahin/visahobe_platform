import { describe, it, expect } from 'vitest';
import {
  colors,
  liquidGlassConfig,
  typography,
  shadows,
  spacing,
  generateThemeCssVariables,
  getThemeCssVariablesObject,
  visahobeTailwindPreset,
} from '../src/index.js';

describe('Design Tokens Contract & Theme Test', () => {
  it('should enforce primary dark green brand color palette (#0D3B2E)', () => {
    expect(colors.brand[700]).toBe('#0D3B2E');
    expect(colors.brand[800]).toBe('#092A21');
    expect(colors.brand[600]).toBe('#145342');
    expect(colors.brand[900]).toBe('#07211A');
    expect(colors.brand[100]).toBe('#E3EFEA');
  });

  it('should enforce pure white primary and soft off-white secondary surfaces', () => {
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.surfaceMuted).toBe('#F8FAFC');
    expect(colors.bg).toBe('#FDFDFD');
  });

  it('should define subtle borders and emerald border accents', () => {
    expect(colors.border).toBe('#E2E8F0');
    expect(colors.borderSubtle).toBe('#F1F5F9');
    expect(colors.borderEmerald).toContain('rgba(13, 59, 46');
    expect(colors.borderHighlight).toBe('rgba(255, 255, 255, 0.60)');
  });

  it('should define complete semantic status tokens', () => {
    expect(colors.semantic.success).toBe('#15803D');
    expect(colors.semantic.warning).toBe('#B45309');
    expect(colors.semantic.danger).toBe('#B91C1C');
    expect(colors.semantic.info).toBe('#0369A1');
  });

  it('should enforce selective liquid glass rules per ADR-009', () => {
    expect(liquidGlassConfig.panel.backdropBlur).toBe('16px');
    expect(liquidGlassConfig.panel.backgroundColor).toBe('rgba(255, 255, 255, 0.82)');
    expect(liquidGlassConfig.allowedSurfaces).toContain('command-palette');
    expect(liquidGlassConfig.allowedSurfaces).toContain('navbar-shell');
    expect(liquidGlassConfig.allowedSurfaces).toContain('modal-dialogs');
    expect(liquidGlassConfig.forbiddenSurfaces).toContain('data-tables');
    expect(liquidGlassConfig.forbiddenSurfaces).toContain('financial-ledgers');
    expect(liquidGlassConfig.forbiddenSurfaces).toContain('document-review-screens');
  });

  it('should define typography scales with Plus Jakarta Sans and Inter', () => {
    expect(typography.fonts.display).toContain('Plus Jakarta Sans');
    expect(typography.fonts.sans).toContain('Inter');
    expect(typography.fonts.mono).toContain('JetBrains Mono');
    expect(typography.fonts.bangla).toContain('Noto Sans Bengali');
    expect(typography.sizes.base.fontSize).toBe('1rem');
  });

  it('should define elevation and glass shadows', () => {
    expect(shadows.glass).toContain('rgba(13, 59, 46');
    expect(shadows.specular).toContain('inset 0 1px 1px');
  });

  it('should define spacing scale', () => {
    expect(spacing[4]).toBe('1rem');
    expect(spacing[8]).toBe('2rem');
  });

  it('should generate theme CSS variables with reduced-transparency media query', () => {
    const cssVars = generateThemeCssVariables();
    expect(cssVars).toContain(':root {');
    expect(cssVars).toContain('--color-brand-700: #0D3B2E;');
    expect(cssVars).toContain('--color-surface: #FFFFFF;');
    expect(cssVars).toContain('--color-surface-muted: #F8FAFC;');
    expect(cssVars).toContain('@media (prefers-reduced-transparency: reduce)');
    expect(cssVars).toContain('--glass-panel-blur: 0px;');

    const varsObj = getThemeCssVariablesObject();
    expect(varsObj['--color-brand-700']).toBe('#0D3B2E');
    expect(varsObj['--color-surface']).toBe('#FFFFFF');
  });

  it('should export valid Tailwind preset extending theme tokens', () => {
    expect(visahobeTailwindPreset.theme.extend.colors.brand[700]).toBe('#0D3B2E');
    expect(visahobeTailwindPreset.theme.extend.fontFamily.display[0]).toContain(
      'Plus Jakarta Sans',
    );
  });
});
