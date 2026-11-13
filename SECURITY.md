# VisaHobe — Platform Security Policy

VisaHobe handles highly confidential personal identification, biometric documents, international travel records, and financial transactions. Security and confidentiality are non-negotiable core invariants of the system architecture.

---

## 1. Reporting Security Vulnerabilities

If you discover a security vulnerability within VisaHobe, please do **NOT** open a public issue on GitHub. Instead, report it immediately to our security response team:

- **Email:** `security@visahobe.com` (Encrypted PGP key available on request)
- **Response SLA:** Within 24 hours of receipt.

Please include:
- A description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal proof of concept.
- Affected components (apps, services, packages, or database policies).

---

## 2. Core Security Invariants

All engineers and automated agents working on VisaHobe must strictly comply with the following invariants:

### 2.1 Zero Hardcoded Secrets
- Never commit API keys, database passwords, private encryption keys, or authentication tokens to version control.
- All secrets must be injected via environment variables or resolved via the secure Credential Vault interface (`packages/core/src/secrets/`).
- Automated CI scans (TruffleHog) reject any commit diff containing credential patterns.

### 2.2 Defense-in-Depth Tenant Isolation
- Every tenant record is protected by PostgreSQL Row-Level Security (RLS) policies.
- Tenant context is derived strictly from server-validated cryptographic session tokens, never from client-supplied headers or URL query parameters.
- Private object storage files are accessed exclusively through short-lived (max 15 minutes) pre-signed URLs verified against tenant ownership.

### 2.3 Strict PII Redaction
- Unredacted Personally Identifiable Information (PII) — including passport numbers, national ID numbers (NID), credit card PANs, bank accounts, and client contact details — must never be written to application logs, Sentry error traces, or LLM agent prompts.
- All log streams pass through the defense-in-depth redaction filter before emission.

### 2.4 Browser Automation Hardening
- Browser automation sessions run in isolated containers restricted by domain allowlists.
- The platform strictly forbids solving, clicking through, or circumventing CAPTCHAs, MFA, or anti-bot verification challenges. When encountered, the session pauses immediately for authorized human intervention.
- High-impact browser actions (application submission, fee payment, legal declarations) require explicit human approval.

### 2.5 Mandatory Staff Multi-Factor Authentication (MFA)
- All privileged operational accounts (`owner`, `admin`, `case_manager`, `verifier`, `finance`, `browser_operator`, `developer_reviewer`) must complete MFA verification. Access to administrative APIs without active MFA status is blocked at Tier 2 middleware.
