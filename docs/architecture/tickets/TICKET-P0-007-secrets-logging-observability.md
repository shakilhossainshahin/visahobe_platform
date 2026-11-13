# TICKET-P0-007: Secret Vault Interface, Structured Logging, and Defense-in-Depth PII Redaction

**Ticket ID:** TICKET-P0-007  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 1.5 Engineering Days  
**Dependencies:** [TICKET-P0-001](./TICKET-P0-001-monorepo-initialization.md), [TICKET-P0-002](./TICKET-P0-002-typescript-lint-format-testing.md)  
**Related ADRs:** [ADR-008](../decisions/ADR-008-security-auth-and-permission-boundaries.md)  

---

## 1. Objective

Build the secret management abstraction and a defense-in-depth structured logging and redaction pipeline (including field allowlists/denylists, regex filters, prompt/agent-trace sanitization, screenshot metadata scrubbing, and error stack cleaning) to guarantee that PII and credentials are never exposed in logs, traces, or source control.

---

## 2. Scope of Work

1. **Secret Management Interface (`packages/core/src/secrets/`):**
   - Implement `SecretVault` interface:
     - `getSecret(key: string): Promise<string>`
     - `getVaultReference(refId: string): Promise<EncryptedCredential>`
   - Provide `EnvSecretProvider` with strict schema validation using Zod (`DATABASE_URL`, `JWT_SECRET`, `STORAGE_SECRET`, `SENTRY_DSN`).
   - Abort application startup immediately if mandatory secrets are missing or malformed.

2. **Defense-in-Depth PII Redaction Pipeline (`packages/core/src/security/pii/`):**
   - **Defense-in-Depth Principle:** Regex pattern matching is treated as a fallback safety layer, NOT the sole protection. Redaction operates through five coordinated layers:
     1. **Field Denylist / Sensitive Schema Keys:** Automatically redact fields named `password`, `token`, `secret`, `authorization`, `creditCard`, `pan`, `cvv`, `passport`, `nid`, `dob`, `bankAccount`, `ssn`, `taxId`.
     2. **Field Allowlists on Public Logging:** High-volume operational loggers only emit pre-approved metadata keys (`service`, `level`, `tenantId`, `userId`, `correlationId`, `action`, `statusCode`, `durationMs`).
     3. **Regex Pattern Redaction Filter:** Scans all string messages and nested objects for:
        - Bangladesh Passport numbers (e.g. `[A-Z]{1,2}[0-9]{7}`) and International passports (`[A-Z0-9]{6,9}`).
        - Bangladesh National ID (NID) (10-digit smart cards and 13/17-digit legacy formats).
        - Credit Card PANs (Visa, MasterCard, Amex via Luhn algorithm filter).
        - Bank account numbers, IBANs, and routing codes.
        - Phone numbers (+880 Bangladesh format and international E.164 formats).
        - Personal email addresses and client names in unstructured error strings.
     4. **Prompt & Agent-Trace Redaction:** Agent traces, LangGraph checkpoints, and LLM prompt histories scrub raw personal identification before persistence to `agent_runs` or external logging.
     5. **Screenshot & Document Metadata Scrubbing:** File uploads, OCR outputs, and browser screenshots strip EXIF metadata, camera identifiers, and original client file paths before storage.
     6. **Error Stack Trace Sanitization:** Exception handler scrubs file paths containing username directories, database connection strings, and authorization query parameters from stack traces.

3. **Structured JSON Logger (`packages/core/src/logger/`):**
   - Implement structured logger (Pino) outputting standardized JSON logs with correlation IDs (`x-correlation-id`) tracked via `AsyncLocalStorage`.
   - Redaction pipeline is baked directly into the logger's serializer.

4. **Sentry Error Reporting Scrubbing (`packages/core/src/monitoring/`):**
   - Configure Sentry `beforeSend` hook to execute the same defense-in-depth scrubbing pipeline before transmitting events to external monitoring.

5. **Automated "No Raw PII in Logs" Test Suite (`packages/core/test/pii-redaction.test.ts`):**
   - Test harness feeds representative datasets and asserts that zero unmasked values appear in log output:
     - Bangla & English full applicant names (e.g. "মোহাম্মদ রহিম", "Rahim Uddin").
     - Bangladeshi Passport numbers ("A01234567").
     - Bangladeshi National ID (NID) ("19871234567890123").
     - Phone numbers ("+8801712345678", "01812345678").
     - Email addresses ("client.applicant@example.com").
     - Credit card numbers ("4111222233334444").
     - Bank account numbers ("102.101.98765").

---

## 3. Deliverables

- [ ] `packages/core/src/secrets/` secret vault interface and Zod environment validator.
- [ ] `packages/core/src/security/pii/` with field denylist, regex redactors, and stack sanitizer.
- [ ] `packages/core/src/logger/` structured logger with correlation ID tracking.
- [ ] `packages/core/src/monitoring/sentry.ts` with pre-send scrubbing hooks.
- [ ] Comprehensive test suite in `packages/core/test/pii-redaction.test.ts`.

---

## 4. Acceptance Criteria

1. Attempting to start the application with missing or malformed required secrets immediately aborts with code 1.
2. Structured logger redacts 100% of sensitive keys via field denylists and regex fallbacks.
3. Automated test suite proves that Bangla/English names, passports, BD NIDs, phone numbers, emails, credit cards, and bank account numbers are redacted to `[REDACTED_*]`.
4. Screenshot metadata and document filenames are sanitized before persistence.
5. Error stack traces never contain database credentials, query strings, or local filesystem usernames.

---

## 5. Verification Commands

```bash
pnpm --filter @visahobe/core test
```
