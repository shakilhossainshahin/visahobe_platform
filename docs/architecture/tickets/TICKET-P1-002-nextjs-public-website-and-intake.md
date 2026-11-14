# TICKET-P1-002: Next.js Public Website & Interactive Intake Portal

**Ticket ID:** TICKET-P1-002  
**Phase:** Phase 1 — Design System & Public Website  
**Priority:** P0 (Blocker)  
**Status:** In Progress  
**Estimated Effort:** 3 Engineering Days  
**Dependencies:** `TICKET-P1-001` (Design Tokens & `@visahobe/ui` kit merged into `main`)  
**Related Architecture Documents:**

- [Final Architecture Blueprint v2.0 (Section 10 — UI/UX Design System)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#10-uiux-design-system)
- [Final Architecture Blueprint v2.0 (Section 14.2 — Phase 1 Public website and intake)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#phase-1--public-website-and-intake)
- [ADR-001: Monorepo Architecture and Product Surfaces](../decisions/ADR-001-product-surfaces.md)
- [ADR-009: UI Design System, Color Palette, and Liquid Glass Specification](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)

---

## 1. Objective

Build the customer-facing acquisition experience in `apps/website` using Next.js 15 App Router, TypeScript, and Tailwind CSS powered by `@visahobe/design-system` and `@visahobe/ui`. Deliver a high-converting, authoritative White + Deep Emerald Dark-Green (`#0D3B2E`) public portal featuring a sticky translucent Liquid Glass navigation header, comprehensive landing page, multi-step interactive visa eligibility wizard, PII-sanitized lead intake API route, and a unified authentication portal entry preview.

---

## 2. Architectural Guardrails & Invariants

1. **Visual Identity:**
   - Strict adherence to the White + Dark-Green (`#0D3B2E`) + Selective Liquid Glass palette. Zero legacy navy/cyan styling.
   - Glassmorphism applied strictly to floating/sticky overlays (e.g. `NavbarShell`, hero badge, assessment progress indicator, elevated cards) and forbidden on dense data sections.
2. **Security & PII Sanitization:**
   - Any server-side logging in intake API routes (`/api/intake`) must route through the structured JSON logger in `@visahobe/core` to ensure passport numbers, phone numbers, and emails are scrubbed before writing to logs.
   - Client form inputs must support browser autofill standards while avoiding client-side credential persistence.
3. **Monorepo Packaging & Transpilation:**
   - Monorepo dependencies (`@visahobe/ui`, `@visahobe/design-system`, `@visahobe/core`, `@visahobe/shared`) configured via `transpilePackages` in `next.config.mjs`.
4. **Database Guardrails:**
   - Zero changes to database schema or migrations in this ticket.

---

## 3. Scope of Work

### 3.1 Next.js App Router & Tailwind Setup (`apps/website`)

- [x] Configure `apps/website/package.json` with Next.js 15, React 18/19, Tailwind CSS, PostCSS, and workspace packages (`@visahobe/ui`, `@visahobe/design-system`, `@visahobe/core`).
- [x] Configure `apps/website/next.config.mjs` with `transpilePackages`.
- [x] Configure `apps/website/tailwind.config.mjs` inheriting `visahobeTailwindPreset`.
- [x] Configure `apps/website/app/globals.css` with injected CSS custom properties from `generateThemeCssVariables()`.

### 3.2 Global Layout & Public Navigation (`app/layout.tsx`)

- [x] Sticky translucent `NavbarShell`:
  - Brand logo slot (VisaHobe emerald badge).
  - Navigation links: Services, Destinations, Eligibility Assessment, How It Works.
  - Action CTAs: "Client Portal" (links to `/login`) and "Check Eligibility" (links to `/assess`).
- [x] Comprehensive `FooterShell`:
  - Company overview & mission.
  - Structured service and destination columns.
  - Mandatory legal compliance disclaimer emphasizing VisaHobe is an independent technology platform.
  - Copyright and legal links.

### 3.3 Public Landing Page (`app/page.tsx`)

- [x] **Hero Section**: Confident display typography, Liquid Glass status pill ("99.2% Verification Accuracy • AI + Human Verifiers"), dual CTAs, and interactive quick visa destination/purpose selector with instant redirection to `/assess`.
- [x] **Core Services & Global Destinations Grid**: Work visas, skilled migration, student visas, and investor/business tracks across Singapore, Europe/Schengen, UK, Canada, Australia, and GCC.
- [x] **How It Works 4-Step Pipeline**: 1. Intelligent Intake → 2. Automated OCR & Document Validation → 3. Licensed Expert Sign-off → 4. Submission & Milestone Tracking.
- [x] **Trust & Compliance Highlights**: PostgreSQL RLS multi-tenant data privacy, bank-grade encryption, zero raw PII leaks, and transparent fee schedules.

### 3.4 Interactive Visa Eligibility Wizard (`app/assess/page.tsx` & `/api/intake`)

- [x] **Multi-Step Client Form**:
  - Step 1: Destination Country & Visa Stream.
  - Step 2: Applicant Profile & Education / Work Experience.
  - Step 3: Document Readiness Checklist (Passport, transcripts, proof of funds, police clearance).
  - Step 4: Contact Information & Communication Preferences.
- [x] Client-side progress bar and step validation.
- [x] **Intake API Route (`app/api/intake/route.ts`)**:
  - Validates submission payload.
  - Redacts PII in server logs using `@visahobe/core` logger.
  - Calculates preliminary eligibility score and produces a unique tracking reference (e.g., `VH-2026-XXXX`).
  - Returns structured score, tier, and recommended next steps.

### 3.5 Client Sign-in Shell (`app/login/page.tsx`)

- [x] Dedicated authentication entry preview styled with Liquid Glass card, White + Dark-Green palette, email/password form, SSO / Magic link buttons, and biometric / MFA ready indicators.

### 3.6 Automated Testing (`apps/website/test/`)

- [x] Landing page rendering and navigation link verification.
- [x] Eligibility wizard step progression and field validation tests.
- [x] `/api/intake` route validation and PII redaction log tests.

---

## 4. Definition of Done

1. Next.js application boots cleanly with `pnpm --filter @visahobe/website dev` and builds with `pnpm --filter @visahobe/website build`.
2. Landing page, assessment wizard, and login shell match the White + Dark-Green (`#0D3B2E`) + Liquid Glass visual identity.
3. `/api/intake` endpoint handles submissions and scrubs PII from logs.
4. All unit and component tests pass via `pnpm test`.
5. Monorepo lint, format check, typecheck, build, and Phase 0 regression suite all pass with exit code 0.
6. Changes committed and pushed to `feature/ticket-p1-002-nextjs-public-website-and-intake` for PR review.
