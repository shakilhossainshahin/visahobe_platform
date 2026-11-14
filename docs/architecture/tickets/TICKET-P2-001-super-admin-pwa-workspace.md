# TICKET-P2-001: Super Admin PWA & Core Operations Workspace

**Ticket ID:** TICKET-P2-001  
**Phase:** Phase 2 — Internal Operations & Case Management Command Center  
**Priority:** P0 (Blocker)  
**Status:** In Progress  
**Estimated Effort:** 3 Engineering Days  
**Dependencies:** `TICKET-P1-001` (Design Tokens & UI Kit), `TICKET-P1-003` (CMS Policy Engine), `TICKET-P1-004` (Client Dashboard Workspace)  
**Related Architecture Documents:**

- [Final Architecture Blueprint v2.0 (Section 4.2 — Staff & Verifier Operations Surface)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#4-core-roles--rbac-matrix)
- [Final Architecture Blueprint v2.0 (Section 10 — UI/UX Design System)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#10-uiux-design-system)
- [ADR-001: Monorepo Architecture and Product Surfaces](../decisions/ADR-001-product-surfaces.md)
- [ADR-008: Security Architecture, Authentication, and Permission Boundaries](../decisions/ADR-008-security-auth-and-permission-boundaries.md)
- [ADR-009: UI Design System, Color Palette, and Liquid Glass Specification](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)

---

## 1. Objective

Construct the internal operations command center and Progressive Web Application (PWA) in `apps/super-admin` running on port 3002. Provide an authoritative, high-efficiency operations hub for case managers, document verifiers, and platform administrators. The workspace enforces mandatory staff MFA/RBAC guards, delivers high-contrast solid white data tables adhering strictly to ADR-009 (zero blur on tabular queues), provides a side-by-side document and OCR extraction audit workspace, integrates CMS editorial review with `@visahobe/cms`, and displays immutable system audit trails with zero raw PII exposure.

---

## 2. Architectural Guardrails & Invariants

1. **Strict ADR-009 Solid High-Contrast Table Rule:**
   - **Zero Blur on Tabular Queues:** Case queues, document verification tables, financial ledgers, and audit logs MUST be rendered on solid white surfaces (`bg-white`) with crisp 1px borders (`#E2E8F0`) and 0 blur.
   - Liquid Glass (`backdrop-filter: blur(...)`) is strictly prohibited on data tables to prevent visual fatigue and text distortion during high-density verification workflows.
   - Liquid Glass is reserved exclusively for the sticky navigation shell (`NavbarShell`), hero KPI badges, and modal action overlays.
2. **Staff MFA & RBAC Enforcement:**
   - Super Admin operations require privileged staff roles (`owner`, `admin`, `case_manager`, `verifier`) with verified Multi-Factor Authentication (AAL2).
   - Presentation layer displays active tenant boundary and staff role badge (`MFA Verified • Staff (admin)`).
3. **PWA Manifest Invariants:**
   - `public/manifest.webmanifest` must specify `name: "VisaHobe Command Center"`, `theme_color: "#0D3B2E"`, `background_color: "#FFFFFF"`, and `display: "standalone"`.
4. **Defense-in-Depth PII Redaction:**
   - Extracted OCR metadata, case reviews, and audit trails must strictly scrub and redact raw PII (emails, unformatted passport numbers, phone numbers).
   - Zero raw PII in URLs, query params, or client logs.
5. **Database & Monorepo Invariants:**
   - Port 3002 (`next dev --port 3002`).
   - Zero changes to `schema.prisma` or database migrations.

---

## 3. Scope of Work

### 3.1 Next.js 15 App Router & PWA Setup (`apps/super-admin`)

- Update `package.json` with Next.js 15, React 18, `@visahobe/ui`, `@visahobe/design-system`, `@visahobe/auth`, `@visahobe/cms`, `@visahobe/core`, `@visahobe/shared`, and port 3002 scripts.
- Configure `next.config.mjs` with `transpilePackages` and extension aliases.
- Configure `tailwind.config.mjs` and `postcss.config.mjs` using `visahobeTailwindPreset`.
- Create `public/manifest.webmanifest` for standalone installable PWA.
- Configure `app/globals.css` injecting `:root` design tokens.

### 3.2 Operations Shell & Layout (`app/layout.tsx`)

- Sticky translucent `NavbarShell` with VisaHobe Command Center branding.
- Navigation links: `Case Queue` (`/`), `Document Audit` (`/audit`), `CMS Editorial` (`/cms`), and `Audit Logs` (`/logs`).
- Active tenant selector and MFA-verified staff role pill.
- Standardized `FooterShell` with operations audit disclaimers.

### 3.3 High-Contrast Case Operations Queue (`app/page.tsx`)

- Executive KPI summary cards (Active Cases, Pending Verification, SLA Alerts, Approved Today).
- ADR-009 compliant solid high-contrast white table for operational case queue.
- Interactive status filter tabs (`All`, `Intake Submitted`, `Specialist Audit`, `Embassy File Prep`, `Consular Submission`, `Decision`).
- SLA priority badges (`URGENT`, `HIGH`, `STANDARD`), assigned caseworker indicators, and file review triggers.

### 3.4 Document Verification & OCR Diff Audit Workspace (`app/audit/page.tsx`)

- Side-by-side solid white document inspector and OCR extraction comparison diff.
- Checksum validation, document category, and status indicators.
- Quick action controls: `Approve Verification` and `Request Resubmission` with reason selection.

### 3.5 CMS Editorial Approval Queue (`app/cms/page.tsx`) & Audit Logs (`app/logs/page.tsx`)

- Connected to `@visahobe/cms` (`getAllCountryGuides({ includeDrafts: true })`).
- Visual review panel for `draft`, `in_review`, and `published` country visa policy packs.
- Read-only immutable Audit Log table displaying actor roles, actions, timestamps, and PII-redacted entity diffs.

### 3.6 Automated Unit & Component Tests (`apps/super-admin/test/`)

- Vitest suites validating PWA manifest invariants, ADR-009 solid white table rendering, MFA role guard behavior, and zero-PII audit log rendering.

---

## 4. Acceptance Criteria

- [ ] `apps/super-admin` builds and runs on port 3002 with Next.js 15 App Router.
- [ ] PWA manifest is present and valid with standalone display and `#0D3B2E` theme.
- [ ] Layout renders sticky navigation with MFA verified staff role badge and operations links.
- [ ] Case queue renders on solid white table with zero backdrop-filter blur per ADR-009.
- [ ] Document audit page provides side-by-side diff review with approve/resubmit actions.
- [ ] CMS editorial interface loads country guides from `@visahobe/cms` including drafts.
- [ ] Audit logs display immutable event trail with strict PII masking.
- [ ] Vitest test suite passes across all component and configuration tests.
- [ ] Monorepo verification gate (`format:check`, `lint`, `typecheck`, `test`, `build`, `verify:phase-0`) passes with exit code 0.
