# TICKET-P1-005: Android Mobile App Capacitor Packaging & Unified WebView Bridge

**Ticket ID:** TICKET-P1-005  
**Phase:** Phase 1 — Design System & Public Website  
**Priority:** P0 (Blocker)  
**Status:** In Progress  
**Estimated Effort:** 2 Engineering Days  
**Dependencies:** `TICKET-P1-001` (Design Tokens & UI Kit), `TICKET-P1-002` (Next.js Public Website), `TICKET-P1-004` (Client Dashboard Workspace)  
**Related Architecture Documents:**

- [Final Architecture Blueprint v2.0 (Section 4.1 — Applicant / Client Surface)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#4-core-roles--rbac-matrix)
- [Final Architecture Blueprint v2.0 (Section 10 — UI/UX Design System)](../blueprints/VisaHobe_Final_Architecture_Blueprint_v2.0.md#10-uiux-design-system)
- [ADR-001: Monorepo Architecture and Product Surfaces](../decisions/ADR-001-product-surfaces.md)
- [ADR-009: UI Design System, Color Palette, and Liquid Glass Specification](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)

---

## 1. Objective

Deliver the enterprise-grade Android mobile packaging and native WebView bridge in `apps/mobile` (`@visahobe/mobile`) using Capacitor 6. Provide a secure, high-performance hybrid mobile container configured for `com.visahobe.app` ("VisaHobe"), brand-aligned with White + Deep Emerald Dark-Green (`#0D3B2E`) + Liquid Glass visual identity, strict domain navigation allowlisting, and a strongly typed TypeScript bridge SDK covering camera/document capture, biometric availability verification, and deep-link routing without PII leaks.

---

## 2. Architectural Guardrails & Invariants

1. **Capacitor Android Shell Configuration:**
   - Package ID: `com.visahobe.app`, App Name: `VisaHobe`.
   - Brand Theme: Status bar and splash screen background strictly styled in Deep Emerald Dark-Green (`#0D3B2E`) and Pure White (`#FFFFFF`).
   - Domain Navigation Allowlist: Restrict WebView navigation strictly to `visahobe.com`, `*.visahobe.com`, and local development origins (`localhost`, `10.0.2.2`). External non-approved origins must be blocked or launched in system browser.
   - Enforce HTTPS across all non-localhost remote origins.
2. **Unified Native Bridge SDK:**
   - Detects execution environment cleanly (`isNativeAndroid()` vs web browser).
   - Document Capture (`captureDocumentFromBridge()`): Enforces MIME type allowlist (`application/pdf`, `image/jpeg`, `image/png`), validates size limits (<= 10MB), and strips filesystem traversal paths/EXIF via `sanitizeUploadFilename()` from `@visahobe/core`.
   - Biometrics Readiness (`checkBiometricAvailability()`): Provides strongly typed platform queries for Biometric / Passkey hardware capabilities.
   - Deep Link Router (`resolveAppDeepLink(url)`): Canonical URL router mapping incoming mobile deep links (`/assess`, `/countries/:slug`, `/documents`, `/messages`) between public marketing and client workspace flows with ZERO sensitive PII query parameters.
3. **Web Fallback Shell (`www/index.html`):**
   - Lightweight, standalone offline/loading shell with Deep Emerald (`#0D3B2E`) accents and Liquid Glass frosted container card.
4. **Security & PII Rules:**
   - Zero raw PII in deep-link URLs, intent extras, or logger outputs.
   - Zero modifications to database schema or migrations.

---

## 3. Scope of Work

### 3.1 Capacitor 6 Android Configuration (`apps/mobile`)

- `apps/mobile/package.json`: Configure `@visahobe/mobile` with `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and workspace linkages.
- `apps/mobile/capacitor.config.ts`: Strongly typed Capacitor configuration.
- `apps/mobile/tsconfig.json` & `vitest.config.ts`: TypeScript and testing configurations.

### 3.2 Unified Native Bridge SDK (`apps/mobile/src/bridge/native-bridge.ts`)

- Environment detection (`isNativeAndroid()`, `getBridgePlatform()`).
- Document picker/camera bridge (`captureDocumentFromBridge()`).
- Biometric hardware readiness check (`checkBiometricAvailability()`).
- Safe deep-link router (`resolveAppDeepLink()`).

### 3.3 Offline & Fallback Web Shell (`apps/mobile/www/index.html`)

- Standalone HTML shell with inline CSS matching `#0D3B2E` brand and Liquid Glass styling.

### 3.4 Verification & Unit Tests (`apps/mobile/test/`)

- Unit tests validating configuration invariants, allowed navigation origins, deep-link mapping, MIME validation, and filename sanitization.

---

## 4. Acceptance Criteria

- [ ] `apps/mobile/capacitor.config.ts` exports valid Capacitor config with `com.visahobe.app` and `#0D3B2E` theme.
- [ ] Navigation allowlist restricts navigation to authorized `visahobe.com` origins and localhost.
- [ ] Native bridge provides typed `captureDocumentFromBridge()`, `checkBiometricAvailability()`, and `resolveAppDeepLink()`.
- [ ] Deep-link resolution validates path safety and strips any accidental PII query parameters.
- [ ] Fallback web shell renders White + Deep Emerald theme with Liquid Glass badge.
- [ ] Vitest test suite passes across all bridge and config checks.
- [ ] Monorepo build, lint, format, typecheck, and Phase 0 baseline verification pass cleanly.
