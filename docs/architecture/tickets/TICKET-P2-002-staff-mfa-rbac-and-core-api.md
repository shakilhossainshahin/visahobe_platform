# TICKET-P2-002: Staff MFA Authentication, Granular RBAC Guard & Core Case Operations API

## 1. Ticket Metadata

- **Ticket ID**: `TICKET-P2-002`
- **Component**: `services/api`, `apps/super-admin`, `packages/auth`
- **Priority**: P0 (Milestone Blocking)
- **Status**: In Progress
- **Estimated Effort**: 3 days
- **Dependencies**: `TICKET-P0-001` through `TICKET-P0-008`, `TICKET-P1-001` through `TICKET-P1-005`, `TICKET-P2-001`

---

## 2. Objective & Scope

Establish the operational backend service foundation and staff security perimeter for the VisaHobe internal command center:

1. **Core Operations API Service (`services/api`)**:
   - Provide strongly typed case management handlers (`listCases`, `getCaseById`, `updateCaseStatus`, `assignCaseSpecialist`) with strict cryptographic tenant isolation (`tenant_id` extracted exclusively from validated JWT claims).
   - Document verification workflows (`approveDocument`, `requestDocumentResubmission`) with mandatory immutable audit log emission and zero raw PII in log payloads.
   - Presigned storage URL generation bridging `@visahobe/core` storage boundary service (TTL <= 15 minutes) and `sanitizeUploadFilename()`.
2. **Staff MFA & Granular RBAC Guard (`apps/super-admin` & `@visahobe/auth`)**:
   - Enforce mandatory staff JWT validation with valid `tenant_id`.
   - Enforce `mfaVerified: true` (AAL2) claim across all command center routes (`/`, `/audit`, `/cms`, `/logs`), redirecting unverified staff to `/mfa-verify`.
   - Enforce granular RBAC policies (`admin`, `case_manager`, `verifier`, `cms_editor`) on privileged operations.
   - Deliver interactive TOTP/Passkey MFA challenge page at `apps/super-admin/app/mfa-verify/page.tsx`.
3. **Verification**:
   - Comprehensive unit and integration test coverage verifying tenant header spoofing rejection, MFA redirects, RBAC permission enforcement, audit trails, and zero PII leaks.

---

## 3. Architecture Constraints & Invariants

- **Cryptographic Tenant Isolation**: Client HTTP headers (e.g., `x-tenant-id`) are strictly rejected as authoritative tenant sources.
- **MFA Invariant**: Privileged staff roles (`owner`, `admin`, `case_manager`, `verifier`, `cms_editor`) must have verified MFA (AAL2) to access operations routes.
- **Zero Raw PII**: Audit logs and error messages must be sanitized via `@visahobe/core` before emission.
- **ADR-009 Compliance**: High-contrast solid white surfaces for data tables, Liquid Glass permitted only on modals, badges, and MFA challenge card.
- **Single Migration-Owner Rule**: Zero modifications to Prisma schema or database migrations.
