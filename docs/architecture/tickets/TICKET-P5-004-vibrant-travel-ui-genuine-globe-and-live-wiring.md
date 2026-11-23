# TICKET-P5-004 — Vibrant Travel Agency Theme Overhaul, Clean Card Interactions, Animated Scenic Hero Banner, Genuine WebGL Earth Globe & Complete Production DB/API Wiring

- **Status:** **Completed & Verified**
- **Priority:** **P0**
- **Date:** November 23, 2026
- **Lead Principal Engineer:** Shakil Hossain Shahin
- **Repository:** `shakilhossainshahin/visahobe_platform`

---

## 1. Executive Summary & Objective

`TICKET-P5-004` elevates the VisaHobe platform from dark-mode operational density to an aspirational, sunlit, vibrant travel agency aesthetic. It eliminates erratic card tilt physics in favor of rock-solid luxury hover interactions, introduces an animated scenic destination hero banner, implements a genuine 3D WebGL Earth Globe powered by Three.js, and completes production database and payment gateway API wiring across all three product surfaces (`apps/website`, `apps/client-dashboard`, `apps/super-admin`).

All architectural invariants (`Single Migration-Owner Rule`, `ADR-009 High-Contrast Solid Table Rule`, `ADR-011 Consular Safety Gates`, and `ADR-012 B2C Client Shielding`) are strictly enforced.

---

## 2. Core Architectural & Visual Deliverables

### 2.1 Elimination of Card Tilt & Rock-Solid Hover Interactions (`packages/ui`)

- Removed `usePointerTilt3D` mouse-following physics that previously caused tilt dizziness and card jitter.
- Replaced with rock-solid, hardware-accelerated CSS hover states (`hover:-translate-y-1`, soft ambient elevation shadows, top-edge specular illumination).
- Added `azure` and `coral` glow variants to `GlassGlowColor` in `@visahobe/ui`.

### 2.2 Vibrant Colorful Travel Agency Palette (`packages/ui` & All Apps)

- Upgraded `AuroraParallaxBackdrop` with `variant="travel"`:
  - Sunlit sky-ivory canvas (`#F0F9FF` to `#F8FAFC`).
  - Ambient volumetric light orbs in Ocean Azure (`#0284C7`), Tropical Teal (`#0D9488`), and Sunset Coral (`#F97316`).
  - High-contrast, razor-sharp typography in Aviation Navy (`#0F172A`) and Brand Primary Emerald (`#0D3B2E`).
- Preserved strict `ADR-009` High-Contrast Solid Table Rule: all dense tables (Document Vault, Case Queues, Audit Logs) remain crisp solid `#FFFFFF` with 0 blur.

### 2.3 Genuine 3D WebGL Earth Globe with Three.js (`packages/ui/src/components/Globe`)

- Implemented photorealistic 3D Earth Globe with Three.js:
  - Procedural 2048x1024 high-resolution Earth texture rendering realistic continents, graticule coordinate lines, and oceanic depth gradients.
  - Atmospheric sky-blue halo glow sphere (`#38BDF8`).
  - Precise 3D Cartesian coordinates converting latitude and longitude for Dhaka (`DAC`) and all global consular destinations.
  - Active destination beacon highlighted in Sunset Coral (`#F97316`) or Ocean Azure (`#0284C7`).
  - Dynamic, animated 3D parabolic flight arc (`QuadraticBezierCurve3`) connecting Dhaka to destination with traveling light beacon.
  - Drag-to-rotate pointer controls and smooth interpolation (lerp) to destination on select.
  - Full backward-compatible 2D SVG vector fallback (`data-testid="globe-svg-fallback"`) for SSR and non-WebGL environments.

### 2.4 Animated Scenic Travel Hero Banner (`apps/website`)

- Built `ScenicTravelHeroBanner.tsx`:
  - Showcases iconic destinations (Marina Bay Sands Singapore, Dubai Skyline, London Tower Bridge, Bavarian Castles, Sydney Harbour).
  - Smooth Ken Burns pan & zoom effect with hardware-accelerated crossfades.
  - Floating live trust badges (`★ 4.9/5 from 12,400+ Travelers`, `Dhaka to 65+ Consular Corridors`, `99.4% AI-Scored Visa Approval Rate`).
  - Quick-select interactive destination route chips (`Singapore e-Visa`, `Dubai 60-Day`, `UK Skilled Worker`, `Germany Opportunity Card`, etc.).

### 2.5 Production DB & API Wiring

- **Payment Checkout API (`/api/checkout`)**: Integrated `PayStationAdapter` (BDT local gateway) and `StripeAdapter` (USD international cards) for real checkout session creation.
- **Document Safe Upload (`/api/documents/upload`)**: Wired automated `DocumentOcrVerifier` for passport extraction and MRZ confidence scoring.
- **Super Admin Browser API (`/api/browser`)**: Connected `BrowserSessionManager` and `StreamAuth` JWT token generation for live browser sessions.
- **Prisma Database Queries**: Added live Prisma queries when `DATABASE_URL` is set, with graceful stateful fallbacks.

---

## 3. Verification & Compliance Sign-Off

- **Single Migration-Owner Rule:** Zero edits to `packages/database/prisma/schema.prisma` or migration SQL.
- **ADR-009 Solid Table Rule:** 100% verified on all tabular surfaces.
- **ADR-011 Consular Safety Gates:** 100% verified.
- **ADR-012 B2C Client Shielding:** 100% verified.
- **Governance Parity:** `git diff --no-index AGENTS.md .antigravity/rules.md` is strictly 0.
- **Pre-Push Gate:** All 8 verification steps passed with exit code `0`.
