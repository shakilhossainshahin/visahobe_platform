# TICKET-P5-003: Live Browser UX Audit, True Scroll-Linked 3D Parallax Luxury Overhaul & Full Dynamic End-to-End System Wiring

## Status: Completed & Verified

**Priority:** P0  
**Domain:** Frontend Architecture / Motion Primitives / Full-Stack System Wiring  
**Branch:** `feature/ticket-p5-003-live-audit-3d-parallax-and-dynamic-system`

---

## 1. Executive Summary

This ticket successfully resolves the complete defect inventory discovered during the live browser UX audit across all 3 deployed application surfaces (`visahobe-platform.vercel.app`, `visahobe-client.vercel.app`, and `visahobe-super-admin.vercel.app`) on both Desktop (1440x900) and Mobile (390x844).

It upgrades the 3D Glassmorphism & Parallax motion engine in `@visahobe/ui` with multi-depth `<ParallaxLayer>` components, eliminates all WCAG AAA contrast and text truncation defects, creates the missing login pages for Super Admin and Client Dashboard, cleans up all hardcoded `localhost` references, and wires dynamic API endpoints across all three surfaces.

---

## 2. Scope & Verified Deliverables

### 2.1 Multi-Depth 3D Parallax Engine Upgrade (`packages/ui`)

- Created `<ParallaxLayer>` in `packages/ui/src/components/Glass3D/` supporting configurable depth speed and Z-axis offsets (`zOffset`).
- Enhanced `<FloatingGlassDock>` with `hideOnMobile?: boolean` option to prevent obstruction of input fields and country selection controls on mobile viewports (390x844).
- Added Vitest coverage in `packages/ui/test/glass-3d-primitives.test.tsx` verifying SSR compatibility, `ParallaxLayer` transform generation, and mobile responsive hiding.

### 2.2 Public Website (`apps/website`)

- **Contrast & Hierarchy**: Replaced low-contrast pill badge with high-contrast glowing champagne gold badge (`#C8A951`) over emerald glass; resolved dark-text-on-dark-glass contrast across sections.
- **Hero Parallax Stage**: Wrapped the `<InteractiveVisaGlobe />` and Holographic Visa Pass in multi-depth `<ParallaxLayer>` elements (`speed={0.03}, zOffset={10}` and `speed={0.08}, zOffset={30}`).
- **Dynamic API Routes**:
  - `GET /api/countries`: Dynamic route reading published country visa guides from `@visahobe/cms`, formatting fees, processing times, and autonomy tiers.
  - `POST /api/assessment`: Interactive assessment endpoint calculating live applicant scores, ADR-011 autonomy tiers, and dual-currency fee schedules (Pay Station BDT + Stripe USD).
- **Authentication Overhaul**: Redesigned `apps/website/app/login/page.tsx` with luxury obsidian-emerald glassmorphism, eliminating `window.alert()` in favor of dynamic status feedback banners.
- **Link Remediation**: Removed hardcoded `http://localhost:3002/partners` link in favor of relative `/login`.

### 2.3 Client Dashboard (`apps/client-dashboard`)

- **Missing Login Page**: Implemented `apps/client-dashboard/app/login/page.tsx` with luxury obsidian-emerald glass styling, session authentication simulation, and magic link dispatch.
- **Active Application Card**: Fixed heading and label contrast (white display typography and champagne gold accent on dark glass); added truncation safety for domain and session IDs.
- **Mobile Touch Safety**: Set `hideOnMobile={true}` on `<FloatingGlassDock>` so mobile applicants use `<MobileBottomNav />` cleanly with zero input occlusion.
- **Dynamic Case Endpoint**: Created `GET /api/cases` returning active case state, COMPASS scoring breakdown, milestone stages, and required document upload actions.
- **Link Remediation**: Replaced hardcoded `http://localhost:3000/login` in layout navbar with `/login`.

### 2.4 Super Admin Command Center (`apps/super-admin`)

- **Resolved 404 on Root Redirect**: Created `apps/super-admin/app/login/page.tsx` with staff operator credentials form, dark glass design, and seamless routing to `/mfa-verify` to fulfill AAL2 hardware security gate.
- **Dynamic Operations APIs**:
  - `GET /api/cases` & `PATCH /api/cases`: Operational queue filtering, search, and ADR-011 consular review gate approval by licensed verifiers.
  - `GET /api/wallets` & `POST /api/wallets`: Multi-tenant partner agency wallet balances, liquidity aggregates, and zero-overdraft double-entry ledger mutations.
- **Link Remediation**: Replaced hardcoded `http://localhost:3000/login` in layout navbar with `/login` and updated footer endpoints to production-safe URLs.
- **ADR-009 Invariant**: All data tables (`case-queue-table`, `audit`, etc.) strictly maintained on solid `#FFFFFF` surfaces with zero `backdrop-blur`.

---

## 3. Verification & Compliance Evidence

- Single Migration-Owner Rule: ZERO modifications to `packages/database/prisma/schema.prisma` or migration SQL.
- ADR-009 Table Rule: 100% compliant (`expect(html).not.toContain('backdrop-blur')` passes).
- ADR-011 Consular Safety Gate: Fully enforced in Super Admin cases API.
- ADR-012 B2C Client Shielding: Verified across Client Dashboard endpoints.
- Pre-push gate: All 8 required checks passing with exit code 0.
