/**
 * VisaHobe Design System — Core Design Tokens Contract
 *
 * Source of Truth: ADR-009 (UI Design System, Color Palette, and Liquid Glass Specification)
 * Visual Identity: Pure White primary surfaces + Deep Emerald Dark-Green (#0D3B2E) + Selective Liquid Glass.
 */

export const colors = {
  // Canvas & Surfaces
  bg: '#FDFDFD',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F1F5F9',

  // Primary Dark-Green Brand Palette (Replaces legacy navy/cyan)
  brand: {
    900: '#07211A', // Deepest dark green for solid headers and emphasis
    800: '#092A21', // Hover state for primary buttons & dark navigation
    700: '#0D3B2E', // Primary Dark-Green Brand token
    600: '#145342', // Accent green / secondary interactive
    500: '#16654F', // Interactive hover states & badges
    400: '#1E8265', // Mid-tone accent
    300: '#2A9D7C', // Secondary accents
    200: '#86EFAC', // Light emerald highlight
    100: '#E3EFEA', // Light green tint for badges & highlights
    50: '#F0F7F4', // Ultra-subtle green wash
  },

  // Borders
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  borderEmerald: 'rgba(13, 59, 46, 0.12)',
  borderEmeraldAccent: 'rgba(20, 83, 66, 0.24)',
  borderHighlight: 'rgba(255, 255, 255, 0.60)',

  // Semantic Feedback Tokens
  semantic: {
    success: '#15803D', // Verified documents, approved cases, active status
    successLight: '#DCFCE7',
    successBorder: '#86EFAC',
    warning: '#B45309', // Pending actions, expiring documents, missing info
    warningLight: '#FEF3C7',
    warningBorder: '#FDE68A',
    danger: '#B91C1C', // Rejected documents, blocked tasks, failed payments
    dangerLight: '#FEE2E2',
    dangerBorder: '#FECACA',
    info: '#0369A1', // Neutral informational alerts & hints
    infoLight: '#E0F2FE',
    infoBorder: '#BAE6FD',
  },

  // Typography Tokens
  text: {
    primary: '#0F172A', // High-contrast primary body text & headings
    secondary: '#475569', // Subtitles, metadata, timestamps
    muted: '#94A3B8', // Placeholder text & disabled labels
    inverse: '#FFFFFF', // White text on dark green surfaces
    brand: '#0D3B2E', // Dark-green branded text
    brandAccent: '#145342', // Accent green text
  },
} as const;

export const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display:
      '"Plus Jakarta Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    bangla: '"Noto Sans Bengali", "Hind Siliguri", sans-serif',
  },
  sizes: {
    xs: { fontSize: '0.75rem', lineHeight: '1rem', letterSpacing: '0.01em' },
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem', letterSpacing: '0' },
    base: { fontSize: '1rem', lineHeight: '1.5rem', letterSpacing: '-0.01em' },
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem', letterSpacing: '-0.01em' },
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem', letterSpacing: '-0.02em' },
    '2xl': { fontSize: '1.5rem', lineHeight: '2rem', letterSpacing: '-0.02em' },
    '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem', letterSpacing: '-0.02em' },
    '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem', letterSpacing: '-0.02em' },
    '5xl': { fontSize: '3rem', lineHeight: '1.15', letterSpacing: '-0.03em' },
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const radii = {
  none: '0px',
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glass: '0 8px 32px 0 rgba(13, 59, 46, 0.08)',
  glassElevated: '0 20px 40px -15px rgba(13, 59, 46, 0.12)',
  specular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.70)',
} as const;

export const motion = {
  durations: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

/**
 * Liquid Glass Specification & Usage Constraints
 * In accordance with ADR-009, glass effects are applied selectively to overlays and floating surfaces.
 */
export const liquidGlassConfig = {
  panel: {
    backdropBlur: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    border: '1px solid rgba(255, 255, 255, 0.60)',
    boxShadow: '0 8px 32px 0 rgba(13, 59, 46, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.70)',
  },
  accentGlass: {
    backdropBlur: '16px',
    backgroundColor: 'rgba(13, 59, 46, 0.04)',
    border: '1px solid rgba(13, 59, 46, 0.12)',
    boxShadow: '0 8px 32px 0 rgba(13, 59, 46, 0.06)',
  },
  heroGlass: {
    backdropBlur: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.70)',
    boxShadow:
      '0 20px 40px -15px rgba(13, 59, 46, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.80)',
  },
  reducedTransparencyFallback: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  /**
   * Surfaces where Liquid Glass is strictly permitted
   */
  allowedSurfaces: [
    'command-palette',
    'agent-activity-panel',
    'browser-live-stream-overlay',
    'modal-dialogs',
    'drawer-panels',
    'notification-center',
    'sticky-approval-bar',
    'marketing-hero-badge',
    'navbar-shell',
  ],
  /**
   * Surfaces where Liquid Glass is strictly forbidden to preserve readability and rendering speed
   */
  forbiddenSurfaces: [
    'data-tables',
    'case-queues',
    'document-review-screens',
    'ocr-extraction-diffs',
    'financial-ledgers',
    'long-form-inputs',
  ],
} as const;

export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;
export type BreakpointTokens = typeof breakpoints;
export type RadiiTokens = typeof radii;
export type ShadowTokens = typeof shadows;
export type MotionTokens = typeof motion;
export type LiquidGlassTokens = typeof liquidGlassConfig;
