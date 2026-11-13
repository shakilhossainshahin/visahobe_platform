import { colors, typography, spacing, radii, shadows, breakpoints } from '../tokens/index.js';

export const visahobeTailwindPreset = {
  theme: {
    screens: breakpoints,
    extend: {
      colors: {
        bg: 'var(--color-bg, #FDFDFD)',
        surface: {
          DEFAULT: 'var(--color-surface, #FFFFFF)',
          muted: 'var(--color-surface-muted, #F8FAFC)',
          elevated: 'var(--color-surface-elevated, #FFFFFF)',
          hover: 'var(--color-surface-hover, #F1F5F9)',
        },
        brand: {
          900: colors.brand[900],
          800: colors.brand[800],
          700: colors.brand[700],
          600: colors.brand[600],
          500: colors.brand[500],
          400: colors.brand[400],
          300: colors.brand[300],
          200: colors.brand[200],
          100: colors.brand[100],
          50: colors.brand[50],
        },
        border: {
          DEFAULT: 'var(--color-border, #E2E8F0)',
          subtle: 'var(--color-border-subtle, #F1F5F9)',
          emerald: colors.borderEmerald,
          'emerald-accent': colors.borderEmeraldAccent,
          highlight: colors.borderHighlight,
        },
        status: {
          success: colors.semantic.success,
          'success-light': colors.semantic.successLight,
          'success-border': colors.semantic.successBorder,
          warning: colors.semantic.warning,
          'warning-light': colors.semantic.warningLight,
          'warning-border': colors.semantic.warningBorder,
          danger: colors.semantic.danger,
          'danger-light': colors.semantic.dangerLight,
          'danger-border': colors.semantic.dangerBorder,
          info: colors.semantic.info,
          'info-light': colors.semantic.infoLight,
          'info-border': colors.semantic.infoBorder,
        },
      },
      fontFamily: {
        sans: [typography.fonts.sans],
        display: [typography.fonts.display],
        mono: [typography.fonts.mono],
        bangla: [typography.fonts.bangla],
      },
      spacing,
      borderRadius: radii,
      boxShadow: {
        glass: shadows.glass,
        'glass-elevated': shadows.glassElevated,
        specular: shadows.specular,
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        hero: '20px',
      },
    },
  },
} as const;
