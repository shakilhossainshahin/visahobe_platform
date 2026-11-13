# TICKET-P1-001: Design System & Liquid Glass UI Component Library

**Ticket ID:** TICKET-P1-001  
**Phase:** Phase 1 — Design System & Public Website  
**Priority:** P0 (Blocker)  
**Status:** In Progress  
**Estimated Effort:** 2 Engineering Days  
**Dependencies:** Phase 0 Complete (`TICKET-P0-001` through `TICKET-P0-008` signed off)  
**Related Architecture Documents:**

- [Final Architecture Blueprint v2.0 (Section 10 — UI/UX Design System)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#10-uiux-design-system)
- [ADR-009: UI Design System, Color Palette, and Liquid Glass Specification](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)

---

## 1. Objective

Establish the core **White + Dark-Green Liquid Glass** design token system in `@visahobe/design-system` and the foundational accessible UI component library in `@visahobe/ui`. This library provides the reusable, strongly typed design primitives and layout shells required for all public acquisition pages (`apps/website`), client workspace portals (`apps/client-dashboard`), and administrative consoles (`apps/super-admin`).

---

## 2. Visual Direction & Architectural Guardrails

As ratified in ADR-009 and Section 10 of Blueprint v2.0:

1. **Color Scheme:**
   - Primary canvas surfaces: Pure White (`#FFFFFF`) and Soft Off-White (`#F8FAFC`, `#FDFDFD`).
   - Primary brand identity: Deep Emerald Dark-Green (`brand.700: #0D3B2E`, hover `brand.800: #092A21`, accent `brand.600: #145342`).
   - Borders: Hairline crisp borders (`#E2E8F0` / `#E5E7EB`) with subtle emerald border accents (`rgba(13, 59, 46, 0.12)`).
   - Semantic status tokens: Success (`#15803D`), Warning (`#B45309`), Danger (`#B91C1C`), Info (`#0369A1`).
2. **Selective Liquid Glass Specification:**
   - Multi-layered frosted translucency (`backdrop-filter: blur(16px)`, `background-color: rgba(255, 255, 255, 0.82)`), crisp 1px specular highlights (`rgba(255, 255, 255, 0.60)`), and soft elevation shadows (`rgba(13, 59, 46, 0.08)`).
   - Strict Surface Policy: Strictly permitted on overlays, floating hero badges, command palettes, sticky navigation, and modal dialogues. Strictly prohibited on high-density data tables, financial records, and long legal text.
   - Accessibility & Fallback: Automatic fallback for `prefers-reduced-transparency: reduce` with solid high-contrast surfaces.
3. **Typography & Layout:**
   - Display & Heading: `Plus Jakarta Sans` for prestigious marketing headlines.
   - UI Body & Form Sans: `Inter` for crisp body copy and data readability.
   - Code & Identifier Mono: `JetBrains Mono` for case IDs, transaction references, and CLI traces.
   - Multilingual Bangla Stack: `Noto Sans Bengali`, `Hind Siliguri`.
4. **Security & Quality Guardrails:**
   - Zero raw PII exposure in component default props or logs.
   - Strict TypeScript configuration (`exactOptionalPropertyTypes: true` compatible).
   - Clean barrel exports from `@visahobe/design-system` and `@visahobe/ui`.

---

## 3. Scope of Work

### 3.1 Design Tokens (`packages/design-system`)

- [x] Extend `src/tokens/index.ts` with complete token contract:
  - Brand Dark-Green scale (`brand.50` through `brand.900`).
  - Surface and Canvas tokens (`bg`, `surface`, `surfaceMuted`, `surfaceElevated`).
  - Border and Specular Highlight tokens (`border`, `borderSubtle`, `borderEmerald`, `borderHighlight`).
  - Semantic Status scales (`success`, `warning`, `danger`, `info` with light backgrounds and borders).
  - Typography scales (display, sans, mono, bangla, sizes, weights, line-heights, letter-spacings).
  - Spacing, Elevation Shadows, Radii, and Responsive Breakpoints.
  - Liquid Glass surface configurations (presets, allowed surfaces, forbidden surfaces).
- [x] Implement CSS Variable and Theme Generator (`src/theme/index.ts`):
  - `:root` CSS custom properties generator (`generateThemeCssVariables()`).
  - Theme object dictionary for runtime injection.
  - Fallback styles for reduced transparency.
- [x] Export Tailwind CSS preset (`src/tailwind/index.ts`) for monorepo application consumers.
- [x] Provide unified barrel export `src/index.ts`.

### 3.2 Accessible UI Components (`packages/ui`)

- [x] `Button`: Multi-variant (`primary`, `secondary`, `glass`, `outline`, `ghost`, `danger`), multi-size (`sm`, `md`, `lg`), loading state with spinner, disabled state, icon slots, accessible ARIA attributes.
- [x] `Card` & `GlassCard`: Standard opaque container and Liquid Glass translucent container with specular highlights, header, title, description, content, and footer primitives.
- [x] `Badge`: Status and indicator pills (`brand`, `success`, `warning`, `danger`, `info`, `neutral`, `glass`) with optional active dot.
- [x] Form Primitives (`Input`, `Select`, `Textarea`): Full accessibility support (`label`, `helperText`, `errorMessage`, `aria-invalid`, `aria-describedby`, `aria-required`), focus ring styling, and PII-safe attribute passthrough (`autoComplete`).
- [x] Layout Primitives (`Container`, `Section`): Max-width constraints, responsive padding, background variants (`default`, `muted`, `brand`, `glass`).
- [x] Navigation & Layout Shells (`NavbarShell`, `FooterShell`):
  - `NavbarShell`: Sticky header shell with brand slot, navigation links slot, action buttons/CTA slot, responsive glass option.
  - `FooterShell`: Structured footer with brand bio, columnar navigation links, copyright notice, legal disclaimer slot.
- [x] Unified barrel export `src/index.ts`.

### 3.3 Verification & Testing

- [x] Vitest unit tests in `packages/design-system/test/`:
  - Token contracts, dark green brand hex verification (`#0D3B2E`), liquid glass rules.
  - CSS variable generation and reduced-transparency fallback.
- [x] Vitest component tests in `packages/ui/test/`:
  - `Button`: rendering, variants (`primary`, `glass`), loading spinner, ARIA attributes.
  - `Card` & `GlassCard`: rendering, glass classes, nested children.
  - `Badge`: variant rendering, dot indicators.
  - `Input`, `Select`, `Textarea`: error messages, labels, `aria-invalid`, `aria-describedby`, disabled states.
  - `Container` & `Section`: semantic elements, padding, max-width classes.
  - `NavbarShell` & `FooterShell`: slots, links, copyright rendering.
- [x] Verification pipeline:
  - `pnpm install --frozen-lockfile`
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm verify:phase-0` (regression guard)

---

## 4. Definition of Done

1. Design tokens completely define the White + Dark-Green (`#0D3B2E`) + Liquid Glass visual identity with zero legacy navy/cyan references.
2. All required accessible UI primitives are implemented in `packages/ui` with strict TypeScript typing (`exactOptionalPropertyTypes: true`).
3. Unit and component tests in both packages pass with 100% success rate.
4. All workspace build, lint, format, and typecheck scripts pass with exit code 0.
5. Zero modifications to database schema or migrations.
6. Changes committed and pushed to `feature/ticket-p1-001-design-system-and-liquid-glass-ui` for pull request review.
