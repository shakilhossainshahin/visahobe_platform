# TICKET-P5-001: Interactive 3D Globe Country Locator, Luxury UI/UX Transformation Across All 3 Surfaces & Client Dashboard PWA + Android Capacitor Shell

- **Ticket ID:** `TICKET-P5-001`
- **Phase:** Phase 5 — Interactive Visual Excellence, Luxury Design & Mobile First Surfaces
- **Priority:** `P0`
- **Status:** `Completed & Verified`
- **Governing ADRs:** `ADR-009` (Visual Identity, Liquid Glass & Solid Tables), `ADR-010` (Prepaid Agency Wallet Ledger), `ADR-011` (Super AI Agent Autonomy & Consular Review Gates), `ADR-012` (Scoped MCP Servers & B2C Client Shielding)

---

## 1. Objective

Elevate the entire VisaHobe customer and administrative experience to an elite, luxury standard across all three digital surfaces (`apps/website`, `apps/client-dashboard`, `apps/super-admin`) while launching the cross-platform mobile strategy:

1. **Public Acquisition Site (`apps/website`)**:
   - Build a lightweight 60fps-optimized interactive 3D Globe component (`<InteractiveVisaGlobe />`) in `@visahobe/ui` with dynamic WebGL capability detection, graceful 2D SVG vector sphere fallback, origin Dhaka (DAC) to destination flight arcs with traveling pulse beacons, quick country filter pills, and Liquid Glass Country Intelligence Card (`ADR-009`).
   - Redesign landing hero with embedded interactive 3D Globe and live "AI Visa Officer at Work" interactive simulation preview.
   - Introduce Corporate & B2B Partner Agency Gateway section with direct pathways to agency white-label onboarding.
2. **Client Workspace & Mobile (`apps/client-dashboard`)**:
   - Deliver mobile-first ergonomic navigation with fixed bottom navigation bar (`<MobileBottomNav />`) and iOS/Android safe-area inset support (`env(safe-area-inset-bottom)`).
   - Implement gamified 5-stage case journey tracker (`<GamifiedJourneyTracker />`) with animated circular velocity progress ring (68%), interactive stage detail inspection, and consular milestone badges.
   - Upgrade Document Vault with interactive drag-and-drop dropzone and animated laser OCR scan beam feedback.
   - Launch native Progressive Web App (PWA) manifest with Deep Emerald theme (`#0D3B2E`), standalone viewport, and iOS/Android installation prompt banner (`<PwaInstallPrompt />`).
   - Scaffold production-ready native Android Capacitor 6 application (`capacitor.config.ts`, `android/` project tree) under package `com.visahobe.client`.
3. **Super Admin Command Center (`apps/super-admin`)**:
   - Deliver executive Luxury Dark-Glass Mission Control Command Center (`data-testid="mission-control-deck"`) tracking real-time Autonomous AI vs Human Intervention Ratio (78% Level 3 autonomous), Country Pipeline Distribution, and Prepaid Agency Wallet Liquidity ($148,500 across 14 agencies with low-balance alerts).
   - Deploy Prioritized Consular Safety Gate & Live Browser Takeover Queue with live session deep-links routing directly to `/browser`.
4. **Governance Parity & Invariants**:
   - Update `AGENTS.md` and `.antigravity/rules.md` roadmap sections with 100% byte-for-byte zero-drift parity.
   - Strict observance of the Single Migration-Owner Rule (`ADR-004`/`ADR-007`): zero modifications to `packages/database/prisma/schema.prisma` or migration SQL files.
   - Strict adherence to `ADR-009` high-contrast solid operational table invariant: zero `backdrop-blur` on tabular data.
   - Strict adherence to `ADR-012` B2C shielding: zero internal caseworker notes or wholesale costs exposed to applicants.

---

## 2. Core Deliverables

### Step A — Interactive 3D Globe Component (`packages/ui`)

- **Types & Standard Destinations (`packages/ui/src/components/Globe/types.ts`)**:
  - `GlobeDestination`: Type definition for destinations including ISO code, name, flag emoji, coordinates (lat/lng), visa stream, processing time, and autonomy level (`L1`, `L2`, `L3`).
  - `STANDARD_GLOBE_DESTINATIONS`: 10 launch and high-volume destinations (Singapore, UAE, UK, Germany, Canada, Australia, Japan, Malaysia, Turkey, USA).
  - `GlobeOriginCity`: Dynamic origin location (default Dhaka, DAC `23.8103° N, 90.4125° E`).
- **Interactive Component (`packages/ui/src/components/Globe/InteractiveVisaGlobe.tsx`)**:
  - WebGL canvas context detection (`isWebGLAvailable`) with high-performance requestAnimationFrame loop.
  - Graceful 2D SVG vector fallback with longitude/latitude meridian grids and dynamic flight arc coordinate interpolation.
  - Parabolic flight arc from origin (DAC) to destination with traveling gold pulse beacon.
  - Floating Liquid Glass Country Intelligence Card (`ADR-009`) displaying visa category, processing velocity, autonomy level, and direct action button.
  - Quick country pill selectors and real-time destination search filter.
- **Export & Unit Tests (`packages/ui/src/index.ts`, `packages/ui/test/interactive-visa-globe.test.tsx`)**:
  - 5 comprehensive tests verifying radar animation, intelligence card, 2D SVG fallback, quick country pills, and custom origin coordinates.

### Step B — Landing Page Transformation (`apps/website`)

- **Hero 3D Globe Integration (`apps/website/app/page.tsx`)**:
  - Dynamic client-only import (`ssr: false`) with responsive container and high-contrast typography (`Plus Jakarta Sans` + `Inter`).
  - Live "AI Visa Officer at Work" interactive simulation preview displaying live OCR confidence (99.4%), statutory rule evaluation, and real-time telemetry log.
  - Corporate & B2B Partner Agency Gateway highlighting 3-tier SaaS white-label capabilities, prepaid wallet, and agency registration.

### Step C — Client Dashboard PWA & Android Capacitor (`apps/client-dashboard`)

- **PWA Manifest & Insets (`apps/client-dashboard/public/manifest.webmanifest`, `apps/client-dashboard/app/layout.tsx`)**:
  - Deep Emerald branding (`#0D3B2E`), standalone display mode, orientation lock, and Apple web app meta tags.
  - Mobile bottom viewport padding (`pb-20 md:pb-6`) ensuring content is never obscured by navigation bars or safe-area insets.
- **Mobile Bottom Navigation (`apps/client-dashboard/components/MobileBottomNav.tsx`)**:
  - 5 core views: Home, Journey, Document Vault, Live AI Concierge, and Messages.
  - Active indicator pills with `#0D3B2E` brand styling and champagne gold accents.
- **Gamified Journey Tracker (`apps/client-dashboard/components/GamifiedJourneyTracker.tsx`)**:
  - Animated SVG circular velocity progress ring (68% overall milestone velocity).
  - 5 sequential pipeline stages: `AI Intake` -> `OCR Vault` -> `Form Auto-Fill` -> `Safety Gate` -> `Embassy Lodgment`.
  - Interactive stage detail drawer and milestone status badges.
- **Enhanced Document Vault (`apps/client-dashboard/app/documents/page.tsx`)**:
  - Interactive drag-and-drop upload zone (`data-testid="vault-drag-drop-zone"`).
  - Animated laser scan beam feedback indicator (`data-testid="ocr-scan-beam"`) simulating real-time document extraction.
- **PWA Install Prompt (`apps/client-dashboard/components/PwaInstallPrompt.tsx`)**:
  - Non-intrusive bottom banner handling native `beforeinstallprompt` (Android/Chrome) and Safari Add-to-Home-Screen instructions (iOS).
- **Native Android Capacitor Project Tree (`apps/client-dashboard/capacitor.config.ts`, `apps/client-dashboard/android/`)**:
  - Configured with `appId: 'com.visahobe.client'`, `appName: 'VisaHobe'`, and `webDir: 'out'`.
  - Gradle build scripts (`build.gradle`, `app/build.gradle`, `variables.gradle`), `AndroidManifest.xml` with Internet permissions and Deep Emerald splash theme, and native `MainActivity.java`.

### Step D — Super Admin Mission Control Deck (`apps/super-admin`)

- **Mission Control Deck (`apps/super-admin/app/page.tsx`)**:
  - Executive dark-glass styling (`bg-gradient-to-r from-[#0D3B2E] via-[#092A21] to-[#041611] text-white border border-[#C8A951]/40`).
  - Autonomy Distribution Ratio gauge (78% Level 3 autonomous vs 22% Human review gates).
  - Country Pipeline Distribution cards across all 6 launch jurisdictions with real-time statutory SLA tracking.
  - Prepaid Agency Wallet Liquidity overview ($148,500 total, 14 active agencies, low-balance warnings).
  - Prioritized Consular Safety Gate & Live Browser Takeover Queue linking directly to `/browser?sessionId=...`.
- **Unit Tests (`apps/super-admin/test/mission-control.test.tsx`)**:
  - 5 tests verifying mission control deck, autonomy gauge, pipeline distribution, prepaid wallet liquidity, and takeover queue.

---

## 3. Verification & Test Suite

```bash
# UI Interactive Globe Unit Suite (5/5 tests passing)
pnpm vitest run packages/ui/test/interactive-visa-globe.test.tsx

# Website Landing Page Suite (7/7 tests passing)
pnpm vitest run apps/website/test/landing-page.test.tsx

# Client Dashboard PWA & Journey Suite (4/4 tests passing)
pnpm vitest run apps/client-dashboard/test/pwa-mobile-journey.test.tsx

# Super Admin Mission Control Suite (5/5 tests passing)
pnpm vitest run apps/super-admin/test/mission-control.test.tsx

# Full Monorepo Typecheck
pnpm typecheck

# Full Production Build
pnpm build

# Phase 0 Foundational Verification (25/25 checks)
pnpm verify:phase-0

# Production Readiness Verification (17/17 checks)
pnpm verify:prod
```

---

## 4. Architectural Invariants Sign-Off

1. **Single Migration-Owner Rule (`ADR-004`/`ADR-007`)**: `packages/database/prisma/schema.prisma` and migrations were completely untouched (0 diffs).
2. **ADR-009 High-Contrast Solid Table Rule**: All data tables remain 100% solid `#FFFFFF` with no `backdrop-blur`.
3. **ADR-012 B2C Client Shielding**: All applicant-facing views present scrubbed, client-safe progress data without exposing staff notes or internal fee margins.
4. **Zero-Drift Governance Parity**: `git diff --no-index AGENTS.md .antigravity/rules.md` verified 100% byte-for-byte identical.
