# TICKET-P1-003: CMS Content Pipeline, Country Visa Policy Guides & Dynamic SEO Metadata

**Ticket ID:** TICKET-P1-003  
**Phase:** Phase 1 — Design System & Public Website  
**Priority:** P0 (Blocker)  
**Status:** In Progress  
**Estimated Effort:** 2 Engineering Days  
**Dependencies:** `TICKET-P1-001` (Design Tokens & UI Kit), `TICKET-P1-002` (Next.js Public Website & Assessment Engine)  
**Related Architecture Documents:**

- [Final Architecture Blueprint v2.0 (Section 4 — Core Roles & RBAC Matrix)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#4-core-roles--rbac-matrix)
- [Final Architecture Blueprint v2.0 (Section 14.2 — Phase 1 Public website and intake)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#phase-1--public-website-and-intake)
- [ADR-001: Monorepo Architecture and Product Surfaces](../decisions/ADR-001-product-surfaces.md)
- [ADR-009: UI Design System, Color Palette, and Liquid Glass Specification](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)

---

## 1. Objective

Deliver the structured visa content engine and public knowledge base for VisaHobe in `@visahobe/cms` and `apps/website`. Build a strongly typed policy and destination guide pipeline supporting editorial workflows (`draft`, `in_review`, `published`), authoritative baseline policies for 6 launch destinations (Singapore, Germany, United Kingdom, Canada, Australia, UAE), a dynamic public destinations directory (`/countries`), detailed destination guide pages (`/countries/[slug]`) styled with White + Dark-Green (`#0D3B2E`) + Liquid Glass surfaces, automated SEO metadata generation, and zero draft leakage to public consumers.

---

## 2. Architectural Guardrails & Invariants

1. **Content Lifecycle & Public Isolation:**
   - Public accessor functions (`getPublishedCountryGuides`, `getCountryGuideBySlug`, `getGuidesByStream`) must strictly filter out any country guide whose `editorialStatus !== 'published'`. Unpublished drafts and in-review packs must never leak to public pages or sitemaps.
2. **Visual Consistency & Design Tokens:**
   - Use `@visahobe/design-system` tokens and `@visahobe/ui` components (`Container`, `Section`, `Card`, `GlassCard`, `Badge`, `Button`).
   - Deep Emerald Dark-Green (`#0D3B2E`) authoritative typography, pure white surfaces, and selective translucent Liquid Glass for highlights and metrics.
3. **SEO & Accessibility:**
   - Every destination guide must dynamically provide complete OpenGraph metadata, structured summaries, and accessible heading hierarchies.
   - Non-existent or unpublished slugs must cleanly return HTTP 404 via Next.js `notFound()`.
4. **Security & Zero Database Mod:**
   - Do NOT modify `packages/database/prisma/schema.prisma` or migrations.
   - Zero PII handling in CMS guides.

---

## 3. Scope of Work

### 3.1 Structured Visa & Country Policy Engine (`packages/cms`)

- Define TypeScript schemas in `packages/cms/src/types/`:
  - `CountryVisaGuide`, `VisaStream`, `DocumentChecklistItem`, `OfficialFeeItem`, `EditorialStatus`, `Region`, `VisaCategory`.
- Populate authoritative launch datasets for 6 destinations:
  - Singapore (`singapore`), Germany (`germany`), United Kingdom (`united-kingdom`), Canada (`canada`), Australia (`australia`), UAE (`uae`).
- Implement public and internal query functions in `packages/cms/src/repository/`:
  - `getPublishedCountryGuides()`
  - `getCountryGuideBySlug(slug: string)`
  - `getGuidesByStream(streamCategory: VisaCategory)`
  - `getGuidesByRegion(region: string)`
  - `getAllCountryGuides(options?: { includeDrafts?: boolean })`
- Export barrel interface from `packages/cms/src/index.ts`.

### 3.2 Dynamic Destination & Guide Pages (`apps/website`)

- Create `apps/website/app/countries/page.tsx`:
  - All Destinations Directory with region and visa stream filters.
  - Responsive cards with flag emoji, processing time ranges, required liquid funds, and direct link to guide.
- Create `apps/website/app/countries/[slug]/page.tsx`:
  - Detailed destination page with dynamic `generateMetadata({ params })` and `generateStaticParams()`.
  - Display policy overview, visa streams, document checklist by category, official fee breakdown, last verified badge, and legal disclaimers.
  - Direct pre-filled assessment CTA linking to `/assess?country=<CountryName>`.
  - 404 handling via `notFound()`.
- Wire navigation in `apps/website/app/layout.tsx` and destination cards in `apps/website/app/page.tsx` to `/countries` and `/countries/[slug]`.

### 3.3 Test Suite & Coverage

- `packages/cms/test/`:
  - Schema validation, 6 baseline country integrity, draft exclusion verification.
- `apps/website/test/`:
  - Directory page rendering, dynamic slug guide rendering, SEO metadata verification, 404 behavior.

---

## 4. Acceptance Criteria

- [ ] All 6 launch destination guides are loaded with realistic, authoritative immigration requirements.
- [ ] Draft guides are strictly prevented from appearing in public query outputs or public routes.
- [ ] Dynamic SEO metadata (`generateMetadata`) generates valid titles, descriptions, and OpenGraph tags per country.
- [ ] Direct CTA buttons pre-fill the eligibility assessment wizard with the target country.
- [ ] All tests pass locally and in CI with zero type errors, lint warnings, or broken links.
