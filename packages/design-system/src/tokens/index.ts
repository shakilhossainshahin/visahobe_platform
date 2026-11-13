/**
 * VisaHobe Design System — Core Design Tokens Contract
 *
 * Source of Truth: ADR-009 (UI Design System, Color Palette, and Liquid Glass Specification)
 * Visual Identity: Premium White base + Dark-Green (#0D3B2E) + Selective Liquid Glass.
 *
 * NOTE: This file defines the token contract for Phase 0 without building the full UI component library.
 */

export const colors = {
  // Canvas & Surfaces
  bg: '#FDFDFD',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F6F4',
  border: '#E5E7EB',
  borderSubtle: '#F0F2F0',

  // Primary Dark-Green Brand Palette (Replaces legacy navy/cyan)
  brand: {
    900: '#07211A', // Deepest dark green for solid headers and emphasis
    700: '#0D3B2E', // Primary Dark-Green Brand token
    500: '#16654F', // Interactive hover states & primary buttons
    300: '#2A9D7C', // Secondary accents
    100: '#E3EFEA', // Light green tint for badges & highlights
    50: '#F0F7F4',  // Ultra-subtle green wash
  },

  // Semantic Feedback Tokens
  semantic: {
    success: '#15803D', // Verified documents, approved cases, active status
    successLight: '#DCFCE7',
    warning: '#B45309', // Pending actions, expiring documents, missing info
    warningLight: '#FEF3C7',
    danger: '#B91C1C',  // Rejected documents, blocked tasks, failed payments
    dangerLight: '#FEE2E2',
    info: '#0369A1',    // Neutral informational alerts & hints
    infoLight: '#E0F2FE',
  },

  // Typography Tokens
  text: {
    primary: '#111827',   // High-contrast primary body text & headings
    secondary: '#4B5563', // Subtitles, metadata, timestamps
    muted: '#9CA3AF',     // Placeholder text & disabled labels
    inverse: '#FFFFFF',   // White text on dark green surfaces
  },
} as const;

export const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    bangla: '"Noto Sans Bengali", "Hind Siliguri", sans-serif',
  },
  sizes: {
    xs: { fontSize: '0.75rem', lineHeight: '1rem' },
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
    base: { fontSize: '1rem', lineHeight: '1.5rem' },
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
    '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
    '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
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
} as const;

export const radii = {
  none: '0px',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  glass: '0 8px 32px 0 rgba(13, 59, 46, 0.08)',
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
 * In accordance with ADR-009, glass effects are applied selectively to overlays.
 */
export const liquidGlassConfig = {
  panel: {
    backdropBlur: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    border: '1px solid rgba(255, 255, 255, 0.40)',
    boxShadow: shadows.glass,
  },
  accentGlass: {
    backdropBlur: '16px',
    backgroundColor: 'rgba(13, 59, 46, 0.04)',
    border: '1px solid rgba(13, 59, 46, 0.08)',
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
