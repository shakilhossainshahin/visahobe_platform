import { colors, shadows, typography, liquidGlassConfig } from '../tokens/index.js';

export interface ThemeCssVariables {
  [cssVariableName: string]: string;
}

/**
 * Returns a dictionary of all standard theme CSS variables
 */
export function getThemeCssVariablesObject(): ThemeCssVariables {
  return {
    '--color-bg': colors.bg,
    '--color-surface': colors.surface,
    '--color-surface-muted': colors.surfaceMuted,
    '--color-surface-elevated': colors.surfaceElevated,
    '--color-surface-hover': colors.surfaceHover,

    '--color-brand-900': colors.brand[900],
    '--color-brand-800': colors.brand[800],
    '--color-brand-700': colors.brand[700],
    '--color-brand-600': colors.brand[600],
    '--color-brand-500': colors.brand[500],
    '--color-brand-400': colors.brand[400],
    '--color-brand-300': colors.brand[300],
    '--color-brand-200': colors.brand[200],
    '--color-brand-100': colors.brand[100],
    '--color-brand-50': colors.brand[50],

    '--color-border': colors.border,
    '--color-border-subtle': colors.borderSubtle,
    '--color-border-emerald': colors.borderEmerald,
    '--color-border-emerald-accent': colors.borderEmeraldAccent,
    '--color-border-highlight': colors.borderHighlight,

    '--color-success': colors.semantic.success,
    '--color-success-light': colors.semantic.successLight,
    '--color-success-border': colors.semantic.successBorder,
    '--color-warning': colors.semantic.warning,
    '--color-warning-light': colors.semantic.warningLight,
    '--color-warning-border': colors.semantic.warningBorder,
    '--color-danger': colors.semantic.danger,
    '--color-danger-light': colors.semantic.dangerLight,
    '--color-danger-border': colors.semantic.dangerBorder,
    '--color-info': colors.semantic.info,
    '--color-info-light': colors.semantic.infoLight,
    '--color-info-border': colors.semantic.infoBorder,

    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-muted': colors.text.muted,
    '--color-text-inverse': colors.text.inverse,
    '--color-text-brand': colors.text.brand,

    '--font-sans': typography.fonts.sans,
    '--font-display': typography.fonts.display,
    '--font-mono': typography.fonts.mono,
    '--font-bangla': typography.fonts.bangla,

    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--shadow-xl': shadows.xl,
    '--shadow-glass': shadows.glass,
    '--shadow-glass-elevated': shadows.glassElevated,
    '--shadow-specular': shadows.specular,

    '--glass-panel-bg': liquidGlassConfig.panel.backgroundColor,
    '--glass-panel-border': liquidGlassConfig.panel.border,
    '--glass-panel-blur': liquidGlassConfig.panel.backdropBlur,
  };
}

/**
 * Returns a CSS string containing the `:root` definitions and accessibility fallbacks
 */
export function generateThemeCssVariables(): string {
  const vars = getThemeCssVariablesObject();
  const rootEntries = Object.entries(vars)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join('\n');

  return `
:root {
${rootEntries}
}

@media (prefers-reduced-transparency: reduce) {
  :root {
    --glass-panel-bg: ${liquidGlassConfig.reducedTransparencyFallback.backgroundColor};
    --glass-panel-border: ${liquidGlassConfig.reducedTransparencyFallback.border};
    --glass-panel-blur: 0px;
  }
}
`.trim();
}
