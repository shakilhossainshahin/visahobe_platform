# ADR-001: Product Surfaces and Workspace Architecture

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Core Architecture Team, Product Engineering  
**Consulted:** Final Architecture Blueprint v2.0, Master System Blueprint v1.0

---

## 1. Context and Problem Statement

Earlier draft specifications contained conflicting surface definitions: some referenced five independent dashboards (Public, Client, Operations, Partner, Super Admin), while others proposed merging operations into client portals. Managing five distinct web applications at the outset introduces excessive build overhead, redundant design implementations, complex cross-application authentication, and slow feature velocity.

The system requires an authoritative definition of its user-facing surfaces that satisfies operational separation of duties, strict tenant isolation, and engineering simplicity for MVP through scale.

---

## 2. Decision Drivers

- **Security & Separation of Duties:** Strict segregation between public prospective users, private client tenants, and privileged operational staff.
- **Tenant Isolation:** Client data and private operational notes must remain strictly isolated.
- **Operational Efficiency:** Internal staff (case managers, verifiers, finance, browser operators) need unified operational queues without jumping across multiple disjoint apps.
- **Velocity:** Minimize monorepo build complexity and code duplication during Phase 0 to Phase 2.

---

## 3. Decision

VisaHobe will be built with **three primary product surfaces**:

1. **Public Website (`apps/website`):**
   - Marketing, service discovery, country guides, business-migration overviews, pricing transparency, and SEO.
   - Lead capture and free intake eligibility assessment.
   - Public knowledge base, announcements, and trust/compliance documentation.
   - Built on Next.js App Router with server-rendered pages and CMS content hooks.

2. **Client Dashboard (`apps/client-dashboard`):**
   - Strictly tenant-scoped workspace for authenticated clients and their authorized team members.
   - Profile management, case creation, timeline tracking, and document upload/versioning.
   - Interactive chat with the **Client Main Agent** and human support handover.
   - Invoices, payments, service orders, and read-only browser session viewer (only when explicitly authorized).
   - Zero access to internal operational queues, partner contracts, or staff notes.

3. **Super Admin Dashboard (`apps/super-admin`):**
   - Unified operational control plane for internal roles: `owner`, `admin`, `case_manager`, `verifier`, `finance`, `browser_operator`, and `developer_reviewer`.
   - Workspaces for Case Queues, Verification Approval Gates, Document OCR, Country Policy Packs, Partner Due Diligence, Financial Reconciliation, and Browser Automation Live Streams.
   - Host for the **Super Main Agent** interactive operations console and the GitHub Engineering Control Plane.
   - **Partner Management:** For the MVP, external partner coordination is handled via role-based workspaces and scoped views inside Super Admin. A standalone `Partner Portal` application will be extracted only when partner volume or strict external security boundary requirements justify a separate application.

---

## 4. Consequences

### Positive

- **Streamlined Monorepo:** Reduces build targets from five applications down to three core applications sharing packages (`packages/ui`, `packages/core`, `packages/auth`).
- **Unified Authentication:** Client workspace uses standard end-user authentication; Super Admin enforces staff SSO/MFA and internal RBAC.
- **Clear Security Boundary:** Public (unauthenticated) vs Client (tenant RLS isolated) vs Internal Ops (RBAC + audit logged).

### Negative / Trade-offs

- Super Admin must implement robust internal role-based routing and permissions so that `finance` or `verifier` users only see their designated workspaces.
- Partners will initially access a restricted workspace under strict assignment-level permissions rather than a completely customized branded white-label portal.

### Mitigations

- Enforce the 3-layer permission model (UI, API middleware, and PostgreSQL Row-Level Security) across all Super Admin endpoints.
- Abstract partner views within `apps/super-admin` into modular components that can be migrated into a standalone `apps/partner-portal` without rewriting business logic.

---

## 5. Compliance and Verification Criteria

- [ ] Automated end-to-end routing tests verify that unauthenticated users cannot access Client or Super Admin paths.
- [ ] Automated tests verify that a user with role `client` receives an HTTP 403 Forbidden when accessing any Super Admin route.
- [ ] Monorepo structure conforms to `apps/website`, `apps/client-dashboard`, and `apps/super-admin`.
