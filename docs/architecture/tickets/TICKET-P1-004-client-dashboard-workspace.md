# TICKET-P1-004: Client Dashboard Workspace & Live Case Tracker

**Ticket ID:** TICKET-P1-004  
**Phase:** Phase 1 — Design System & Public Website  
**Priority:** P0 (Blocker)  
**Status:** In Progress  
**Estimated Effort:** 3 Engineering Days  
**Dependencies:** `TICKET-P1-001` (Design Tokens & UI Kit), `TICKET-P1-002` (Next.js Public Website & Core Primitives)  
**Related Architecture Documents:**

- [Final Architecture Blueprint v2.0 (Section 4.1 — Applicant / Client Surface)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#4-core-roles--rbac-matrix)
- [Final Architecture Blueprint v2.0 (Section 10 — UI/UX Design System)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#10-uiux-design-system)
- [ADR-001: Monorepo Architecture and Product Surfaces](../decisions/ADR-001-product-surfaces.md)
- [ADR-009: UI Design System, Color Palette, and Liquid Glass Specification](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)

---

## 1. Objective

Build the authenticated applicant workspace and case operational command center in `apps/client-dashboard` running on port 3001. Deliver an enterprise-grade, high-trust White + Deep Emerald Dark-Green (`#0D3B2E`) + Selective Liquid Glass experience featuring an active visa case timeline, 5-stage milestone tracker, structured document vault with safe filename sanitization, PII-scrubbed document upload API route, and real-time case specialist communications.

---

## 2. Architectural Guardrails & Invariants

1. **Design System & ADR-009 Compliance:**
   - Deep Emerald Dark-Green (`#0D3B2E`) authoritative branding, Pure White (`#FFFFFF`) primary surfaces, Soft Off-White (`#F8FAFC`) secondary surfaces.
   - **Solid High-Contrast Tables Rule:** Dense data tables (e.g. Document Vault checklist, filing fee records) must be rendered on solid white surfaces with crisp 1px borders (`#E2E8F0`). Liquid Glass (`backdrop-blur`) is strictly forbidden on data table rows to prevent text distortion and eye fatigue.
   - Selective Liquid Glass reserved exclusively for sticky top navigation (`NavbarShell`), hero milestone indicators, upload modals, and summary status badges.
2. **Defense-in-Depth PII & Upload Security:**
   - All file uploads to `/api/documents/upload` must validate file MIME types (`application/pdf`, `image/jpeg`, `image/png`) and enforce a 10MB size ceiling.
   - All uploaded filenames must be sanitized using `sanitizeUploadFilename()` from `@visahobe/core` to strip Windows/POSIX directory traversal sequences (`../`, `..\`) and dangerous shell characters.
   - Server-side logging must route through `@visahobe/core` structured logger to guarantee zero raw PII (emails, phone numbers, passport numbers) leaks to log streams.
3. **Tenant Context & RBAC:**
   - Active applicant session context bound to client role permissions.
   - Zero modifications to database schema or migrations.
4. **Port Configuration & Monorepo Linkage:**
   - Runs locally on port 3001 (`next dev --port 3001`).
   - Workspace packages linked via `transpilePackages` and path aliases.

---

## 3. Scope of Work

### 3.1 Next.js 15 App Router & Workspace Configuration (`apps/client-dashboard`)

- Configure `package.json` with Next.js 15, React 18, `@visahobe/ui`, `@visahobe/design-system`, `@visahobe/auth`, `@visahobe/core`, `@visahobe/shared`, and port 3001 dev/start scripts.
- Configure `next.config.mjs` with `transpilePackages`.
- Configure `tailwind.config.mjs` inheriting `visahobeTailwindPreset`.
- Configure `app/globals.css` with CSS custom properties.
- Configure `tsconfig.json` with path aliases and `next typegen && tsc --noEmit`.
- Configure `vitest.config.ts`.

### 3.2 Dashboard Shell & Navigation (`app/layout.tsx`)

- Sticky translucent `NavbarShell` with Client Portal badge, navigation links (`Overview`, `My Cases`, `Document Vault`, `Messages`), and user profile pill.
- Standardized `FooterShell` with security disclaimers and portal support links.

### 3.3 Overview & Live Case Timeline (`app/page.tsx`)

- Active case header with Reference ID (`VH-2026-SG-4921`), target country, visa stream, and stage pill.
- Visual 5-stage application milestone progress tracker:
  1. `Intake Submitted`
  2. `AI & Specialist Document Audit`
  3. `Embassy File Preparation`
  4. `Biometrics & Consular Submission`
  5. `Decision & Passport Dispatch`
- "Action Required" urgent callout cards (missing documents, upcoming embassy biometric appointment).
- Recent case activity timeline (verified timestamps and human-specialist review notes with zero raw PII).

### 3.4 Document Vault & Safe Upload Intake (`app/documents/` & `app/api/documents/upload/`)

- `app/documents/page.tsx`:
  - Solid white high-contrast document checklist table.
  - Status badges (`Verified`, `Pending Review`, `Action Required`).
  - Interactive upload modal with drag-and-drop file selector.
- `app/api/documents/upload/route.ts`:
  - Multi-part form-data intake validating file size (<= 10MB) and allowed MIME types.
  - Filename sanitization via `sanitizeUploadFilename()`.
  - PII-redacted structured audit log.
  - Safe response returning sanitized filename, document category, and status.

### 3.5 Case Messages & Specialist Updates (`app/messages/page.tsx`)

- Secure communication channel between the applicant and their assigned immigration case manager and legal verifier.
- Message thread view with verified staff badges, timestamps, and interactive reply composer.

### 3.6 Automated Testing (`apps/client-dashboard/test/`)

- Vitest unit and component tests verifying:
  - Milestone tracker step calculation and rendering.
  - Document Vault checklist status rendering and table accessibility.
  - Upload API endpoint security (path traversal sanitization, size limits, invalid MIME rejection).
  - PII-redacted audit logging on document receipt.

---

## 4. Acceptance Criteria

- [ ] `apps/client-dashboard` starts and builds cleanly on port 3001 with Next.js 15 App Router.
- [ ] Active case timeline accurately renders all 5 progression stages with current status indicators.
- [ ] Document Vault table adheres strictly to ADR-009 (solid white surface, zero blur on dense data).
- [ ] Upload API route (`/api/documents/upload`) rejects traversal attacks, validates file types, and scrubs PII from logs.
- [ ] All local verifications (`format:check`, `lint`, `typecheck`, `test`, `build`, `verify:phase-0`) pass with exit code 0.
