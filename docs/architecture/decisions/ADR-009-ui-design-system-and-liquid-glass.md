# ADR-009: UI Design System, Color Palette, and Liquid Glass Specification

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Lead Designer, Frontend Architect  
**Consulted:** Final Architecture Blueprint v2.0 (Section 10), Master System Blueprint v1.0 (Section 16)

---

## 1. Context and Problem Statement

Earlier draft specifications proposed a dark navy and cyan visual aesthetic. Subsequent product design and executive strategy formally discontinued that direction. For a platform handling serious legal, governmental, and financial transactions (visa applications, international relocation, business registration), dark/cyan gaming-style or generic SaaS templates undermine trust, readability, and authority.

The system requires a calm, prestigious, international visual identity that delivers maximum legibility on high-density data tables and document inspection screens, while presenting a modern, premium feel through subtle, selective iOS-inspired Liquid Glass effects on interactive overlays.

---

## 2. Decision Drivers

- **Trust & Authority:** Clear, high-contrast, prestigious aesthetic suitable for embassies, business founders, and visa applicants.
- **Visual Distinction:** Distinctive brand identity centered on deep forest/emerald greens against pristine white/near-white surfaces.
- **Selective Glass vs Density:** Glassmorphism/blur effects must never degrade text contrast or slow rendering on dense operational data tables, financial records, or OCR document review panels.
- **Multilingual Readability:** Equal visual quality and font metrics for Bangla, English, and Banglish text.

---

## 3. Decision

VisaHobe establishes a **Premium White Base + Dark-Green Primary Brand (`#0D3B2E`) + Selective Liquid Glass** design system built in `packages/design-system` and `packages/ui` using Tailwind CSS and shadcn/ui:

### 3.1 Design Tokens and Palette

| Token                   | CSS Variable             | Hex Value (Light Mode) | Purpose / Usage                                    |
| ----------------------- | ------------------------ | ---------------------- | -------------------------------------------------- |
| **Background**          | `--color-bg`             | `#FDFDFD`              | Pristine main canvas                               |
| **Surface**             | `--color-surface`        | `#FFFFFF`              | Primary cards, panels, content containers          |
| **Muted Surface**       | `--color-surface-muted`  | `#F4F6F4`              | Secondary sidebars, subtle backgrounds             |
| **Brand 900**           | `--color-brand-900`      | `#07211A`              | Deepest dark-green text and solid headers          |
| **Brand 700 (Primary)** | `--color-brand-700`      | `#0D3B2E`              | Primary brand accent, primary CTA buttons          |
| **Brand 500**           | `--color-brand-500`      | `#16654F`              | Interactive hover states, active indicators        |
| **Brand 100**           | `--color-brand-100`      | `#E3EFEA`              | Subtle badge backgrounds, selection highlights     |
| **Success**             | `--color-success`        | `#15803D`              | Verified documents, approved cases, active status  |
| **Warning**             | `--color-warning`        | `#B45309`              | Pending actions, expiring documents, missing info  |
| **Danger**              | `--color-danger`         | `#B91C1C`              | Rejected documents, blocked tasks, failed payments |
| **Text Primary**        | `--color-text-primary`   | `#111827`              | High-contrast headings and primary content         |
| **Text Secondary**      | `--color-text-secondary` | `#4B5563`              | Subtitles, helper text, timestamps                 |
| **Border**              | `--color-border`         | `#E5E7EB`              | Hairline card and input borders                    |

### 3.2 Selective Liquid Glass Rules

Liquid Glass applies ultra-refined backdrop-blur, subtle inner borders, and high-translucency specular highlights.

**Permitted Liquid Glass Surfaces:**

- Floating Global Command Palette (`Cmd+K`).
- Floating Agent Activity Panel and Client Main Agent Chat Drawer.
- Browser Automation Live Stream overlay controls and badge bars.
- High-priority Approval Action Bars (sticky footer during document review).
- Modal Dialogs and Notification Center sheets.
- Public Website Hero card accents and trust banners.

**Strictly Prohibited on:**

- Data tables and case management queues.
- Document comparison and OCR extraction verification diffs.
- Financial ledgers, invoice tables, and payment line items.
- Form input fields and long legal disclosure text.

### 3.3 Typography and Multilingual Font Stack

- **Primary UI Sans:** `Inter`, system-ui, sans-serif.
- **Display Sans:** `Plus Jakarta Sans` or refined geometric display face for marketing and H1 headers.
- **Code & IDs:** `JetBrains Mono`, monospace (used for Case IDs, Task IDs, and CLI logs).
- **Bangla Support:** Native font stack prioritizing `Noto Sans Bengali`, `Hind Siliguri`, sans-serif for crystal-clear Bengali glyph rendering.

---

## 4. Consequences

### Positive

- **Instant Prestige:** Differentiates VisaHobe from cheap web forms and outdated government portals.
- **Zero Legibility Degradation:** By isolating glass effects to floating overlays, dense operations remain 100% crisp, fast, and accessible.
- **Shared Monorepo Component Library:** `packages/ui` provides pre-styled, accessible components consumable by all three apps (`apps/website`, `apps/client-dashboard`, `apps/super-admin`).

### Negative / Trade-offs

- Backdrop filters on older mobile GPUs can occasionally drop frame rates if overused.
- Designers and developers must resist applying glass effects indiscriminately.

### Mitigations

- Enforce standard Tailwind utility classes (e.g. `liquid-glass-panel` defined with `backdrop-blur-md bg-white/80 border border-white/20 shadow-xl`) in `packages/design-system`.
- Provide fallback styles for users who enable `prefers-reduced-transparency`.

---

## 5. Compliance and Verification Criteria

- [ ] Tailwind configuration exports standard semantic CSS variables for `--color-brand-700` (`#0D3B2E`) and no legacy cyan palette references exist.
- [ ] WCAG AA contrast ratio (> 4.5:1) verified for all primary and secondary text tokens against `--color-bg`.
- [ ] Liquid glass CSS utility classes include fallback solid background support for reduced transparency modes.
