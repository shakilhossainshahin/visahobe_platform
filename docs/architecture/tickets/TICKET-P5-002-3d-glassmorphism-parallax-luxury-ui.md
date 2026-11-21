# TICKET-P5-002: Unified 3D Glassmorphism, Scroll Parallax & Luxury Motion Overhaul Across All 3 Applications (`website`, `client-dashboard`, `super-admin`)

- **Ticket ID:** `TICKET-P5-002`
- **Phase:** Phase 5 — Interactive Visual Excellence, Luxury Design & Mobile First Surfaces
- **Priority:** `P0`
- **Status:** `Completed & Verified`
- **Governing ADRs:** `ADR-009` (Visual Identity, Liquid Glass & High-Contrast Solid Tables), `ADR-010` (Prepaid Agency Wallet Ledger), `ADR-011` (Super AI Agent Autonomy & Consular Review Gates), `ADR-012` (Scoped MCP Servers & B2C Client Shielding)

---

## 1. Objective

Deliver an ultra-luxurious, coherent 3D Glassmorphism, Scroll Parallax, and micro-motion design engine across the entire VisaHobe ecosystem (`@visahobe/ui`, `apps/website`, `apps/client-dashboard`, `apps/super-admin`), establishing an unmistakable, sovereign-grade aesthetic:

1. **Shared 3D Glassmorphism & Parallax Engine (`packages/ui/src/components/Glass3D/`)**:
   - High-performance, lightweight GPU-accelerated motion primitives operating at 60-120fps with zero runtime bloat, zero SSR hydration mismatches, and native `prefers-reduced-motion` accessibility support.
   - `<AuroraParallaxBackdrop />`: Obsidian-emerald canvas (`#030908`) with slow-drifting volumetric emerald (`#0D3B2E`) and champagne gold (`#C8A951`) light orbs, micro-dust particle grid, and scroll-linked depth layers.
   - `<Glass3DCard />`: Multi-layer frosted glass (`backdrop-blur-2xl`), top-edge specular hairline reflection border, interactive pointer tilt (`rotateX`/`rotateY` in `perspective(1000px)`), and dynamic cursor-tracking radial spotlight sheen.
   - `<ParallaxStage />`: Scroll-driven 3D depth stage container (`perspective(1200px)` with `depthSpeed` control).
   - `<ScrollReveal3D />`: IntersectionObserver-driven 3D entrance animations with staggered delays.
   - `<FloatingGlassDock />`: Unified luxury floating glass dock navigation bar with champagne gold active indicators.
2. **Public Acquisition Portal (`apps/website`)**:
   - Reimagined around `<AuroraParallaxBackdrop />` and `<ParallaxStage />`, floating `<InteractiveVisaGlobe />` in a 3D parallax hero stage alongside a floating 3D holographic Visa Pass card (`<Glass3DCard glowColor="gold">`) and Glass Country Intelligence drawer.
   - Scroll-triggered parallax storytelling sections for the AI Visa Officer simulation preview, 6-country sovereign migration corridors, and B2B Partner Agency gateway using `<Glass3DCard />` and `<ScrollReveal3D />`.
   - Integrated `<FloatingGlassDock />` for fast section navigation.
3. **Client & Mobile PWA Workspace (`apps/client-dashboard`)**:
   - Wrapped in `<AuroraParallaxBackdrop intensity="deep">`.
   - Elevated Active Application header, Urgent Action callout, and milestone details with `<Glass3DCard>`.
   - Integrated `<FloatingGlassDock />` for ergonomic jump navigation between Overview, Journey, Vault, and Live Stream.
   - Preserved `ADR-009` High-Contrast Solid Table Invariant on all document checklist and case audit logs (`#FFFFFF` with 0 blur).
4. **Executive Mission Control (`apps/super-admin`)**:
   - Upgraded Mission Control Command Center with `<Glass3DCard blur={false}>` telemetry cards for Autonomy Distribution Ratio, Country Pipeline Distribution, and Prepaid Wallet Liquidity.
   - Applied interactive 3D pointer-tilt and specular gold borders to the Prioritized Consular Safety Gate & Live Browser Takeover queue.
   - Strictly enforced ADR-009 Solid High-Contrast Table Rule: 0 `backdrop-blur` in the Case Queue Table.
   - Integrated `<FloatingGlassDock blur={false} />` for administrative workflow traversal.
5. **Governance & Invariants**:
   - Single Migration-Owner Rule (`ADR-004`/`ADR-007`): Zero touches to `packages/database/prisma/schema.prisma` or migration files (0 diff).
   - Zero-Drift Governance Parity: `git diff --no-index AGENTS.md .antigravity/rules.md` verified 100% byte-for-byte identical.

---

## 2. Core Deliverables

### Step A — Glass3D Engine Primitives (`packages/ui`)

- **Types & Hooks (`packages/ui/src/components/Glass3D/`)**:
  - `types.ts`: Defined `Glass3DCardProps`, `AuroraParallaxBackdropProps`, `ParallaxStageProps`, `ScrollReveal3DProps`, and `FloatingGlassDockProps`.
  - `usePointerTilt3D.ts`: Computes normalized coordinates, `rotateX`/`rotateY` transforms, and dynamic spotlight coordinates with requestAnimationFrame and `prefers-reduced-motion` safety.
  - `useScrollParallax.ts`: Scroll position tracker providing smooth depth-offset translations.
- **Components**:
  - `AuroraParallaxBackdrop.tsx`: Volumetric drifting emerald and gold ambient light orbs over `#030908` obsidian canvas with parallax scroll offsets.
  - `Glass3DCard.tsx`: Multi-layer frosted glass with specular top reflection, cursor spotlight sheen, configurable glow colors (`gold`, `emerald`, `amber`, `neutral`), and configurable `blur` prop.
  - `ParallaxStage.tsx`: 3D perspective wrapper (`perspective: 1200px; transform-style: preserve-3d`).
  - `ScrollReveal3D.tsx`: IntersectionObserver entrance animator with direction choices (`up`, `down`, `left`, `right`, `zoom`).
  - `FloatingGlassDock.tsx`: Floating dock navigation with active gold indicators and backdrop blur (or solid mode).
- **Unit Tests (`packages/ui/test/glass-3d-primitives.test.tsx`)**:
  - 5 tests covering all Glass3D components and properties.

### Step B — Website 3D Redesign (`apps/website`)

- Full redesign of [apps/website/app/page.tsx](file:///d:/visahobe_platform/apps/website/app/page.tsx) with `<AuroraParallaxBackdrop />` and `<ParallaxStage />`.
- Embedded `<InteractiveVisaGlobe />` alongside 3D Holographic Visa Pass (`data-testid="holographic-visa-pass"`).
- Scroll-revealed 3D cards for AI simulation, destination corridors, workflow pipeline, and B2B partner agency gateway.
- Preserved all 7 original landing page assertions + added 3D glassmorphism test in `apps/website/test/landing-page.test.tsx` (8/8 tests passing).

### Step C — Client Dashboard 3D Glassmorphism (`apps/client-dashboard`)

- Integrated `<AuroraParallaxBackdrop intensity="deep">`, `<Glass3DCard>`, and `<FloatingGlassDock>` in [apps/client-dashboard/app/page.tsx](file:///d:/visahobe_platform/apps/client-dashboard/app/page.tsx).
- Preserved ADR-009 solid white tables in Document Vault and Case Audit logs.
- Added 3D glassmorphism tests in `apps/client-dashboard/test/pwa-mobile-journey.test.tsx` (5/5 tests passing).

### Step D — Super Admin 3D Telemetry Cards (`apps/super-admin`)

- Upgraded telemetry cards and safety takeover queue in [apps/super-admin/app/page.tsx](file:///d:/visahobe_platform/apps/super-admin/app/page.tsx) using `<Glass3DCard blur={false}>` and `<FloatingGlassDock blur={false}>`.
- Strictly preserved `expect(html).not.toContain('backdrop-blur')` in `apps/super-admin/test/case-queue-table.test.tsx` (6/6 tests passing).
- Added 3D glass telemetry card tests in `apps/super-admin/test/mission-control.test.tsx` (6/6 tests passing).

---

## 3. Verification & Test Suite

```bash
# UI Glass3D Primitives Suite (5/5 tests passing)
pnpm vitest run packages/ui/test/glass-3d-primitives.test.tsx

# Website Suite (8/8 tests passing)
pnpm vitest run apps/website/test/landing-page.test.tsx

# Client Dashboard Suite (5/5 tests passing)
pnpm vitest run apps/client-dashboard/test/pwa-mobile-journey.test.tsx

# Super Admin Mission Control & Case Queue Suite (12/12 tests passing)
pnpm vitest run apps/super-admin/test/mission-control.test.tsx apps/super-admin/test/case-queue-table.test.tsx

# Full Monorepo Typecheck
pnpm typecheck

# Full Production Build
pnpm build

# Phase 0 Baseline Checks (25/25)
pnpm verify:phase-0

# Production Readiness Checks (17/17)
pnpm verify:prod
```

---

## 4. Architectural Invariants Sign-Off

1. **Single Migration-Owner Rule (`ADR-004`/`ADR-007`)**: `packages/database` completely untouched (0 diffs).
2. **ADR-009 High-Contrast Solid Table Rule**: All tabular data remains solid `#FFFFFF` with no `backdrop-blur`.
3. **ADR-012 B2C Client Shielding**: All retail client views remain scrubbed of internal caseworker telemetry.
4. **Zero-Drift Governance Parity**: `git diff --no-index AGENTS.md .antigravity/rules.md` verified 100% byte-for-byte identical.
