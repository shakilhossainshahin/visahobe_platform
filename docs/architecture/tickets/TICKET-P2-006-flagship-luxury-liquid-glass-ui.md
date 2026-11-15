# TICKET-P2-006: Flagship Luxury & Liquid Glass UI/UX Overhaul + Interactive Frontend Experience

- **Ticket ID:** `TICKET-P2-006`
- **Phase:** Phase 2 — Internal Operations & Case Management Command Center
- **Priority:** `P0`
- **Status:** `Completed & Verified`
- **Governing ADRs:** `ADR-009` (UI Design System & Liquid Glass), `ADR-010` (3-Tier B2B2C & Prepaid Wallet), `ADR-011` (Autonomy Matrix & Partner Connectors), `ADR-012` (Scoped MCP Boundaries)

---

## 1. Objective

Transform the VisaHobe frontend ecosystem (`@visahobe/ui`, `apps/website`, `apps/client-dashboard`, and `apps/super-admin`) into a flagship luxury global immigration platform combining a crisp pure white canvas (`#FFFFFF`), Deep Emerald (`#0D3B2E`), Champagne Gold (`#C8A951`), and Charcoal Ink (`#111827`) with strict `ADR-009` contrast compliance and rich client-side interactivity.

---

## 2. Core Deliverables

### Step A — Permanent Flagship UI/UX Design Standard (`AGENTS.md` & `.antigravity/rules.md`)

- Codified Section `4.1.1 Flagship Luxury & Liquid Glass UI/UX Design Standard (TICKET-P2-006)` in `AGENTS.md` and synchronized `.antigravity/rules.md` (`diff AGENTS.md .antigravity/rules.md` is empty).
- Enforced strict surface partitioning: Liquid Glass (`backdrop-blur-md`) for hero overlays, KPI summary cards, top navigation bars, and floating modals/drawers; crisp solid `#FFFFFF` with `#0D3B2E` headers for dense operational data tables, multi-step forms, and legal checklists.

### Step B — Shared Design System Upgrade (`packages/ui`)

- Upgraded `GlassCard`, `Card`, `Button` (`LuxuryButton`), and `Badge` (`EmeraldBadge`) with Champagne Gold (`#C8A951`) accent dividers, luxury borders, and accessible focus rings while maintaining 100% backward compatibility.
- Added new reusable luxury primitives exported from `@visahobe/ui`:
  - `StatKpiCard` (Liquid Glass, Solid, and Emerald executive KPI summary cards with Champagne Gold dividers and trend indicators).
  - `DataTableShell` (Strictly enforces `ADR-009` solid `#FFFFFF` tabular surface with `#0D3B2E` header readiness and Champagne Gold top accent bar).
  - `StepProgressRail` (Accessible multi-stage progression rail with `aria-current="step"` and interactive stage selection).

### Step C — Public Storefront Overhaul (`apps/website`)

- Upgraded `/` (`HomePage`) with an executive hero section, 4 live trust metric `StatKpiCard`s, interactive instant destination/visa selector with real-time tariff and approval preview, interactive pathway category filters, and rich destination cards displaying processing times, approval rates, and transparent pricing.
- Upgraded `/assess` (`AssessmentPage`) with a real-time consular eligibility score calculator, B2C vs B2B transparent fee breakdown estimator, dynamic document checklist preview, and direct CTA flow into the Client Dashboard.
- Upgraded `/countries` and `/countries/[slug]` with approval rate benchmarks, transparent pricing, and `DataTableShell` (`#0D3B2E` headers) on official fee schedules.

### Step D — Client & B2B Partner Agency Portal Overhaul (`apps/client-dashboard`)

- Added an interactive **Workspace Mode Switcher** (`B2C Applicant Mode` vs `B2B Partner Agency Workspace`) on `/` (`ClientDashboardOverviewPage`), enabling both direct retail applicants and subscribed B2B travel agencies (with prepaid wallet KPIs, custom domain status, and sub-client batch roster) to experience their tailored workflows.
- Upgraded the 5-stage Visa Application Progress Tracker with interactive stage inspection and added the **Built-in AI Visa Concierge Drawer** (`ADR-012` shielded) with quick-prompt chips and live conversational context.
- Upgraded `/documents` (`DocumentVaultPage`) with `StatKpiCard` metrics, an interactive Document & OCR Inspector panel, status filter tabs, and `DataTableShell` (`#0D3B2E` table headers).

### Step E — Super Admin Command Center Overhaul (`apps/super-admin`)

- Polished `/`, `/partners`, `/audit`, `/cms`, `/logs`, and `/mfa-verify` with cohesive Deep Emerald & Champagne Gold executive styling, `StatKpiCard` KPI strips, interactive live search and status/priority/balance filter controls, and crisp `#0D3B2E` table headers.

---

## 3. Verification & Pre-Push Gate

All 7 mandatory pre-push verification gates pass with exit code `0`:

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`
7. `pnpm verify:phase-0`
