# TICKET-P4-001: Payment Gateway Adapters (Pay Station & Stripe), Idempotent Webhook Security & End-to-End Case-to-Submission Pipeline

- **Ticket ID:** `TICKET-P4-001`
- **Phase:** Phase 4 — Payment Gateways, Webhook Idempotency & Case-to-Submission Pipeline
- **Priority:** `P0`
- **Status:** `Completed & Verified`
- **Governing ADRs:** `ADR-010` (Prepaid Agency Wallet Ledger & 3-Tier Multi-Tenancy), `ADR-011` (Super AI Agent Autonomy Matrix & Consular Review Gates), `ADR-012` (Scoped MCP Servers & B2C Client Shielding)

---

## 1. Objective

Deliver production-grade payment gateway integration, cryptographic webhook verification with strict idempotency and replay protection, and the complete end-to-end autonomous visa application vertical slice connecting intake questionnaire to consular submission:

1. **Payment Gateway Adapters (`packages/integrations`)**: Provider-agnostic `PaymentGatewayAdapter` with concrete adapters for **Pay Station** (local BDT gateway with bKash/Nagad/cards) and **Stripe** (international multi-currency USD/SGD/EUR gateway), supporting both upfront full payments and milestone-based split payment schedules.
2. **Invoicing & Webhook Security Service (`services/api`)**: Multi-tenant `InvoiceService` and cryptographically authenticated `PaymentWebhookService` enforcing constant-time HMAC-SHA256 signature verification (`crypto.timingSafeEqual`), 300-second timestamp replay window validation (`WebhookReplayAttackError`), and strict idempotency deduplication preventing double-credits.
3. **End-to-End Case-to-Submission Lifecycle Pipeline (`packages/workflows`)**: Orchestrated vertical slice connecting Lead/Intake -> Case Creation -> Document OCR Verification -> Autonomy Routing & Consular Safety Gate -> Payment Settlement -> Consular Form Mapping & Dry-Run Trace -> Immutable Audit Logging & B2C Client Shielding.

---

## 2. Core Deliverables

### Step A — Payment Gateway Adapters (`packages/integrations`)

- **Domain Types & Contracts (`packages/integrations/src/payments/types.ts`)**:
  - `PaymentGatewayAdapter`: Standardized interface defining `createPaymentSession`, `verifyWebhookSignature`, `generateWebhookSignature`, and optional `refundPayment`.
  - `PaymentCurrency`: Multi-currency definitions (`BDT`, `USD`, `SGD`, `EUR`).
  - `PaymentScheduleType`: Support for `upfront_full` and `milestone_split`.
  - `PaymentMilestone`: Milestone scheduling with percentage allocation and settlement states.
  - Strict security error hierarchy: `InvalidWebhookSignatureError`, `WebhookReplayAttackError`, and `DuplicateWebhookEventError`.
- **Pay Station Concrete Adapter (`packages/integrations/src/payments/pay-station-adapter.ts`)**:
  - Concrete adapter for Bangladesh's primary local payment gateway (Pay Station).
  - HMAC-SHA256 signature verification using constant-time buffer comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
  - 300-second timestamp replay window verification (`WebhookReplayAttackError`).
- **Stripe Concrete Adapter (`packages/integrations/src/payments/stripe-adapter.ts`)**:
  - Concrete adapter for global international payments (USD, SGD, EUR).
  - Formatted Stripe webhook signature parser (`t=timestamp,v1=signature`).
  - Computes HMAC-SHA256 over concatenated payload `${t}.${rawPayload}`.
- **Dynamic Payment Gateway Registry (`packages/integrations/src/payments/registry.ts`)**:
  - Automatic currency routing: `BDT` routes to `pay_station`; `USD`, `SGD`, and `EUR` route to `stripe`.
  - Extensible registration for future payment providers.

### Step B — Invoicing & Idempotent Webhook Security (`services/api`)

- **Multi-Tenant Invoicing Service (`services/api/src/payments/invoice-service.ts`)**:
  - `createCaseInvoice`: Creates case invoices supporting upfront and milestone schedules with tenant isolation (`StorageAccessDeniedError`).
  - `settleInvoiceFull`: Transitions invoice to `paid` upon verified webhook arrival.
  - `settleMilestone`: Transitions specific milestone to `paid` and marks invoice fully paid once all milestones settle.
- **Hardened Webhook Processing Service (`services/api/src/payments/payment-webhook-service.ts`)**:
  - Cryptographic signature verification over incoming payloads.
  - 300-second timestamp replay attack prevention.
  - In-memory and ledger idempotency key deduplication: repeated webhook deliveries return `{ status: 'already_processed', idempotentReplay: true }` without balance alterations or double-credits.
  - Automatic event dispatch: routes `case_fee` and `invoice` payments to `InvoiceService`, and `wallet_topup` payments to `WalletService.topUp`.
  - Case status advancement: automatically transitions associated case status from `draft` to `specialist_review`.
- **Inbound HTTP Webhook Endpoints (`services/api/src/http/handlers.ts`)**:
  - `POST /api/v1/webhooks/pay-station`: Public webhook receiver authenticated via `x-paystation-signature` header.
  - `POST /api/v1/webhooks/stripe`: Public webhook receiver authenticated via `stripe-signature` header.
  - `POST /api/v1/invoices` and `GET /api/v1/invoices/:id`: Scoped invoice retrieval and creation endpoints.
  - `POST /api/v1/payments/checkout-session`: Checkout session provisioning endpoint.

### Step C — End-to-End Case Lifecycle Workflow (`packages/workflows`)

- **Full Vertical Slice Orchestrator (`packages/workflows/src/case-lifecycle/case-lifecycle-workflow.ts`)**:
  - **Stage 1: Intake Assessment**: Calculates eligibility qualification score and assigns service tier (`standard`, `premium`, `priority`).
  - **Stage 2: Case Provisioning**: Generates tenant-scoped `CaseRecord` via `CaseService.createCase`.
  - **Stage 3: Document OCR Verification**: Verifies passport data via `DocumentOcrVerifier.verifyPassport`, validates MRZ format, checks 6-month validity, and masks sensitive passport numbers.
  - **Stage 4: Autonomy Routing & Consular Safety Gate**:
    - Evaluates jurisdiction rules via `AutonomyRouter.evaluateAutonomy`.
    - Enforces `ADR-011` safety boundaries: high-risk restricted actions (`portal_payment`, `schedule_biometrics`, `sign_perjury_affidavit`) immediately halt autonomy and route the case to `specialist_review` (`requiresHumanVerification: true`).
    - Approves autonomous filing (`level_3_autonomous_submission` -> `consular_filing`) for standard e-visa jurisdictions (Singapore SGAC, UAE, Turkey) when OCR confidence >= 0.95.
  - **Stage 5: Payment Settlement**:
    - B2B Partner Agencies: Atomically debits case processing fee from pre-funded wallet via `WalletService.deductCaseFee` (enforcing zero overdraft).
    - Retail Applicants: Issues invoice via `InvoiceService` and provisions gateway checkout session via `PaymentGatewayRegistry`.
  - **Stage 6: Consular Form Mapping & Dry-Run Trace**:
    - Maps applicant profile to government portal fields via `ConsularFieldMapper`.
    - Generates and executes dry-run trace via `DryRunTracer.executeDryRunTrace`, producing cryptographic trace hash.
  - **Stage 7: Audit Commitment & Data Shielding**:
    - Commits immutable audit log via `AuditService.recordLog`.
    - Applies `ClientShieldingService`: strips internal caseworker confidence scores, autonomy levels, and dry-run execution internals for B2C retail applicants (`toShieldedView`).

---

## 3. Verification & Test Suite

All unit and integration tests pass with zero regressions:

```bash
# Payment Gateway Adapters Suite
pnpm vitest run packages/integrations/test/payment-adapters.test.ts
# ✓ 12 tests passed (Stripe & Pay Station session creation, signature verification, tampering rejection, replay attack window)

# Invoice & Webhook Service Suite
pnpm vitest run services/api/test/invoice-and-webhook.test.ts
# ✓ 8 tests passed (Invoice lifecycle, webhook idempotency, milestone settlement, replay attack rejection)

# End-to-End Case Lifecycle Pipeline Suite
pnpm vitest run packages/workflows/test/case-lifecycle-workflow.test.ts
# ✓ 9 tests passed (Autonomous Level 3 Singapore flow, Consular Safety Gate intercept, B2B wallet debit, zero overdraft rejection, milestone schedule, B2C client shielding)
```

---

## 4. Architecture Invariants Preserved

1. **Single Migration-Owner Rule (`ADR-004`/`ADR-007`)**:
   - Zero modifications to `packages/database/prisma/schema.prisma` or migration SQL files.
2. **Consular Safety Review Gates (`ADR-011 §3.2`)**:
   - Autonomous AI execution of live portal payments, biometric appointment bookings, or statutory affidavits is strictly prohibited and halts the case to `specialist_review`.
3. **Atomic Financial Ledger & Zero Overdraft (`ADR-010`)**:
   - Agency wallet debits enforce `balance >= feeAmount` with double-entry `wallet_transactions` ledger tracking. Overdrafts throw `InsufficientFundsError`.
4. **Idempotency & Replay Window Security**:
   - Webhook signatures verified using constant-time comparison (`crypto.timingSafeEqual`).
   - Timestamps older than 300 seconds rejected (`WebhookReplayAttackError`).
   - Processed idempotency keys return `{ status: 'already_processed', idempotentReplay: true }` without re-crediting or re-settling.
5. **B2C Retail Data Shielding (`ADR-012`)**:
   - Internal caseworker notes, agent confidence scores, and raw internal dry-run traces are strictly stripped from retail client views.
