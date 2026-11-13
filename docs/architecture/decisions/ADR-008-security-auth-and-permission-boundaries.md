# ADR-008: Security Architecture, Authentication, and Permission Boundaries

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Security & Compliance Lead, Lead Architect  
**Consulted:** Final Architecture Blueprint v2.0 (Sections 2.1, 3, 8.2, 9), Master System Blueprint v1.0 (Sections 3, 15)  

---

## 1. Context and Problem Statement

VisaHobe operates at the intersection of legal identity processing, international travel documentation, and government filings. The platform is an attractive target for account takeover, document tampering, credential theft, and cross-tenant data exfiltration.

In addition, AI-driven automation introduces novel security vulnerabilities: prompt injection in client-uploaded documents, unintentional data leakage through LLM training or logs, and unauthorized tool invocation by autonomous agents.

A comprehensive security architecture is required that enforces strict authentication, role-based access control (RBAC), multi-factor authentication (MFA), secret isolation, and end-to-end auditability.

---

## 2. Decision Drivers

- **Three-Tier Defense-in-Depth:** Security must be validated at the presentation layer, the application service layer, and the database persistence layer.
- **Privilege Minimization:** Granular permissions rather than monolithic admin roles.
- **Confidentiality of Biometric & Legal Documents:** Strict encryption in transit and at rest with short-lived access links.
- **AI Tool Hardening:** AI agents must never possess elevated execution rights beyond their active, authenticated human caller.

---

## 3. Decision

VisaHobe implements a **Three-Tier Permission Architecture with Supabase Auth, Strict RBAC, Encrypted Secret Vaulting, and Mandatory PII Redaction**:

### 3.1 Three-Tier Permission Enforcement
```
[ Tier 1: UI / Client Layer ]
  └── Hides buttons, routes, and menu items based on user role and permissions.
         │
         ▼
[ Tier 2: API / Middleware Layer ]
  └── Validates cryptographic session JWT, verifies MFA status for staff,
      evaluates fine-grained permission keys (e.g. `case.update`, `document.verify`).
         │
         ▼
[ Tier 3: Database Persistence Layer ]
  └── PostgreSQL Row-Level Security (RLS) restricts access based on `app.current_tenant_id`
      and `app.current_user_role`. Unauthorized queries return zero rows or throw errors.
```

### 3.2 Role and Permission Hierarchy
1. **Primary Role Definitions:**
   - `owner`: Full platform sovereignty, emergency overrides, billing management (audited).
   - `admin`: Operational administration, system configuration, staff management.
   - `case_manager`: Case intake, client communication, workflow assignment, task tracking.
   - `verifier`: Document authenticity verification, OCR correction, verification sign-offs.
   - `finance`: Invoicing, payment confirmation, refund approvals, ledger reconciliation.
   - `browser_operator`: Live monitoring of browser automation sessions, manual takeover.
   - `developer_reviewer`: PR inspection, migration review, staging deployment authorization.
   - `client`: Strictly tenant-scoped access to own cases, documents, invoices, and chats.
   - `partner`: Assignment-scoped access to assigned cases and proof document uploads.

2. **Explicit Permission Keys:**
   Permissions are granular machine keys rather than generic roles:
   - `case.read`, `case.create`, `case.update`, `case.close`
   - `document.upload`, `document.read`, `document.verify`, `document.delete`
   - `submission.prepare`, `submission.approve`, `submission.execute`
   - `invoice.issue`, `payment.record`, `refund.approve`
   - `browser.session.create`, `browser.session.observe`, `browser.session.takeover`
   - `github.pr.create`, `deployment.approve`, `migration.propose`

### 3.3 Authentication and MFA Baseline
- Authentication provided by **Supabase Auth** (or self-hosted equivalent) using JWTs stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- **Mandatory MFA (Time-based One-Time Password / WebAuthn)** for all internal staff accounts (`owner`, `admin`, `case_manager`, `verifier`, `finance`, `browser_operator`, `developer_reviewer`).
- Session timeouts: Maximum 15 minutes of inactivity for privileged internal sessions; 7 days with sliding refresh for client portal sessions.

### 3.4 Secret Management and Credential Vault
- Application secrets (database credentials, third-party API keys) are injected via environment variables managed through Doppler / Infisical / cloud secret managers.
- Portal credentials for external partner and government sites are stored in an **Encrypted Credential Vault** (AES-256-GCM / KMS). Agents and browser workers only ever receive short-lived tokenized vault references (`vault_ref_id`), never plaintext passwords.

### 3.5 Automated PII Redaction Pipeline
- Passports, national ID numbers, tax IDs, credit card numbers, and banking details are processed through a redaction utility before any string is written to application logs, Sentry error traces, or LLM prompt histories.

---

## 4. Consequences

### Positive
- **Immunity to Single-Point Failures:** If a developer misses an authorization check in an API route handler, PostgreSQL RLS prevents data exfiltration at Tier 3.
- **Audit Compliance:** Granular permission keys make every administrative action accountable to an exact permission check.
- **Zero Raw Credentials in Code:** Eliminates accidental secret leaks into GitHub or developer workstations.

### Negative / Trade-offs
- Managing granular permissions across all modules requires comprehensive seeding and testing.
- Mandatory staff MFA requires an initial onboarding and enrollment workflow.

### Mitigations
- Reusable auth middleware and decorator helpers in `packages/auth` (`requirePermission('case.update')`).
- Mock authentication provider for automated integration tests to bypass MFA during CI test runs.

---

## 5. Compliance and Verification Criteria

- [ ] Unauthenticated API requests receive HTTP 401 Unauthorized.
- [ ] Authenticated client requests attempting staff actions receive HTTP 403 Forbidden.
- [ ] Attempting to login to any staff role without completing MFA verification is denied.
- [ ] Automated regex scanner confirms zero unmasked passport or credit card numbers in test log streams.
