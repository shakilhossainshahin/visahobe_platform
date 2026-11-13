# TICKET-P0-005: Authentication Baseline, Session Management, and Staff MFA

**Ticket ID:** TICKET-P0-005  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 2 Engineering Days  
**Dependencies:** [TICKET-P0-004](./TICKET-P0-004-database-and-migration-pipeline.md)  
**Related ADRs:** [ADR-008](../decisions/ADR-008-security-auth-and-permission-boundaries.md)  

---

## 1. Objective

Build the centralized authentication package (`packages/auth`) providing strict server-side cryptographic JWT claims validation, secure cookie session handling with CSRF protection, mandatory Multi-Factor Authentication (MFA) enforcement for internal staff roles (with optional client MFA for MVP), and a mock auth provider for deterministic testing.

---

## 2. Scope of Work

1. **Strict Cryptographic JWT Claims Validation (`packages/auth/src/token.ts`):**
   - Implement server-side JWT verification validating all standard and custom claims:
     - `iss` (Issuer): Must strictly match configured Supabase / Auth issuer URL.
     - `aud` (Audience): Must strictly match configured application audience (`authenticated`).
     - `exp` (Expiration): Reject expired tokens immediately; enforce clock skew tolerance ≤ 5 seconds.
     - `sub` (Subject / User ID): Must be a valid UUID matching an existing user record.
     - `tenant_id` / `org_id`: Must be present, non-empty, and a valid UUID.
   - **Immediate Rejection:** Any token with missing `tenant_id`, tampered signature, expired timestamp, or mismatched issuer/audience is rejected immediately with HTTP 401 Unauthorized. Client-supplied tenant ID request headers are explicitly ignored and overridden by the verified token claims.

2. **Session Cookie Security & CSRF Protection (`packages/auth/src/cookies.ts`):**
   - Session tokens are stored in secure HTTP cookies:
     - `HttpOnly: true` (prevents XSS access to tokens).
     - `Secure: true` (transmitted strictly over HTTPS; local dev allows localhost HTTP).
     - `SameSite: 'Lax'` (or `'Strict'` for sensitive operational routes).
     - `Path: '/'`.
   - **CSRF Defense:** Implement Double Submit Cookie or custom header verification (`x-requested-with` / `x-csrf-token`) on all state-changing HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`).

3. **Role-Differentiated MFA Enforcement:**
   - **Mandatory Staff MFA:** Users holding privileged operational roles (`owner`, `admin`, `case_manager`, `verifier`, `finance`, `browser_operator`, `developer_reviewer`) MUST complete MFA verification (TOTP / WebAuthn). If `isMfaVerified === false`, access to operational queues, cases, and actions is blocked with an `MfaChallengeRequired` response.
   - **Optional Client MFA:** Client portal accounts are not blocked by mandatory MFA during MVP onboarding; client MFA is supported as an opt-in security setting in profile preferences.

4. **Authentication Middleware (`packages/auth/src/middleware/`):**
   - Next.js and Fastify/API middleware:
     - `authenticateSession`: Validates cookies/headers, verifies JWT claims, and attaches `UserSession` to the request context.
     - `requireMfa`: Enforces completed MFA status for privileged staff roles.
     - `requireTenantScope`: Ensures a valid tenant scope is established before request handling.

5. **Mock Authentication Provider for Testing (`packages/auth/src/testing.ts`):**
   - Create `createMockAuthContext({ userId, tenantId, role, isMfaVerified })` to allow deterministic local integration and unit tests without external network dependencies.

---

## 3. Deliverables

- [ ] `packages/auth/src/token.ts` with strict claims validation.
- [ ] `packages/auth/src/cookies.ts` with secure cookie flags and CSRF utilities.
- [ ] `packages/auth/src/middleware/` (`authenticate-session.ts`, `require-mfa.ts`).
- [ ] `packages/auth/src/testing.ts` mock auth provider.
- [ ] Comprehensive test suite in `packages/auth/test/claims-validation.test.ts`.

---

## 4. Acceptance Criteria

1. **Strict Claims Validation:** A JWT with missing or invalid `iss`, `aud`, `exp`, `sub`, or `tenant_id` is rejected with HTTP 401. Client-supplied tenant header cannot override the token's `tenant_id`.
2. **Cookie Security:** Session cookies are set with `HttpOnly`, `Secure`, and `SameSite=Lax`.
3. **CSRF Protection:** State-changing requests without valid CSRF verification headers fail with HTTP 403.
4. **Mandatory Staff MFA:** Internal staff accounts cannot access admin endpoints without `isMfaVerified: true`.
5. **Optional Client MFA:** Client accounts without MFA can access their tenant workspace normally.
6. All auth unit tests execute and pass in CI with 100% deterministic results.

---

## 5. Verification Commands

```bash
pnpm --filter @visahobe/auth test
```
