# ADR-011: Super AI Agent Autonomy Matrix, Consular Review Gates, and Dynamic Partner Connectors

**Status:** Accepted  
**Date:** 15 November 2026  
**Deciders:** Core Architecture Team, AI Systems Lead, Operations & Legal Compliance Lead  
**Consulted:** Final Architecture Blueprint v2.0, ADR-004 (Agent Orchestration), ADR-005 (Browser Use Integration)

---

## 1. Context and Problem Statement

Visa filing requirements vary radically across jurisdictions:

- **Category A (Digital-First / Standard e-Visas):** Countries such as Singapore, UAE, Turkey, Malaysia, and Vietnam feature programmatic portals or standard web forms where document requirements are deterministic, OCR verification is reliable, and automated submission is legally permissible.
- **Category B (Complex / Consular / In-Country Legal Representation):** Jurisdictions such as the United States (DS-160, consular interview, biometrics), United Kingdom, Canada, and Schengen states frequently require in-person appointment booking (VFS/TLScontact), statutory legal affidavits, local registered immigration solicitors, or physical passport submission.

Relying entirely on manual human agents creates operational bottlenecks and destroys software margins. Conversely, granting autonomous AI unconstrained authority to submit consular visa packages or execute government payments introduces unacceptable legal liability, financial risk, and visa rejection hazards.

A hybrid fulfillment architecture with tiered autonomy levels, non-negotiable human review gates, and a pluggable external partner connector registry is required.

---

## 2. Decision Drivers

- **Zero Unintended Legal Exposure:** High-risk consular filings, biometrics bookings, and live government fee payments must never occur without human authorization.
- **High-Throughput Autonomous Efficiency:** Low-risk standard e-visas with verified high confidence should be processed end-to-end autonomously by the AI runtime.
- **Pluggable Global Partner Network:** When local legal representation or specialized manual handling is required, the platform must delegate to external law firms and regional partners via standardized connectors.
- **Executive Observability:** Leadership and operations managers must receive automated daily synthesized digests of platform health, case bottlenecks, and agent performance.

---

## 3. Decision

VisaHobe adopts a **Hybrid Fulfillment Architecture** governed by a **Confidence-Based Agent Autonomy Matrix** and a **Dynamic Partner Connector Registry**, supplemented by an **Executive Digest Dispatcher**.

### 3.1 Confidence-Based Agent Autonomy Matrix

The platform classifies agent actions into three tiered autonomy levels:

| Autonomy Level | Level Name                | Target Scope                                                                             | Operational Protocol                                                                                                   | Safety Gate Requirement                                                                                             |
| :------------- | :------------------------ | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Level 1**    | **Assisted Draft**        | Complex legal filings, business migration, appeals, applicant discrepancy review.        | AI parses documents via OCR, extracts applicant fields, prepares draft forms, and generates an audit log diff.         | Mandatory human staff review before saving form state.                                                              |
| **Level 2**    | **Semi-Autonomous**       | Standard tourist/business visas requiring verifier review or consular booking.           | AI performs end-to-end validation, checklists, and payload preparation. Case transitions to `in_review`.               | **Verifier Gate (`in_review`):** Human verifier or case manager must inspect diff and click "Authorize Submission". |
| **Level 3**    | **Autonomous Submission** | Standardized electronic visas (Singapore SGAC/e-Visa, UAE 30/60-day tourist visa, etc.). | AI validates documents (confidence >= 0.95), generates submission payload, and dispatches directly or via Browser Use. | **Fully Autonomous:** Dispatched without human intervention; results logged with full audit snapshot.               |

### 3.2 Non-Negotiable Human-in-the-Loop Consular Safety Gates

Regardless of confidence score, the AI runtime is **strictly prohibited** from autonomously executing:

1. **Live Consular Payments:** Executing credit card transactions or debiting corporate accounts on external government/embassy portals.
2. **Biometrics & Interview Scheduling:** Final booking of irreversible in-person consular appointment slots without applicant and case manager sign-off.
3. **Legal Attestations / Criminal History Declarations:** Signing statutory declarations under penalty of perjury.

Any workflow step involving these actions must halt execution, set case status to `in_review`, notify assigned staff, and await human verification.

### 3.3 Dynamic Partner Connector Registry

When a case requires external processing (licensed overseas law firms, specialized regional agencies, or VFS/TLS booking partners), the platform routes fulfillment through the Dynamic Partner Connector Registry (`@visahobe/integrations` + `workers/partner-sync`):

```typescript
export interface IPartnerConnector {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly supportedCountryCodes: string[];
  readonly supportedServiceTypes: string[];

  /** Dispatch case package to external partner system */
  dispatchCase(payload: PartnerCaseSubmissionPayload): Promise<PartnerSubmissionResult>;

  /** Fetch latest status and government tracking updates from partner */
  fetchCaseStatus(externalReference: string): Promise<PartnerStatusUpdate>;

  /** Securely transmit supplementary documents */
  syncDocuments(
    externalReference: string,
    documents: PartnerDocumentPayload[],
  ): Promise<PartnerSyncResult>;

  /** Handle and verify incoming partner webhook callbacks */
  handleWebhook(rawBody: string, signature: string): Promise<PartnerWebhookEvent>;
}
```

1. **Connector Isolation:** Partner integrations run in isolated worker tasks (`workers/partner-sync`) with tenant context preservation and rate limiting.
2. **Standardized Status Mapping:** External partner status codes are mapped into VisaHobe's canonical 5-stage case lifecycle: `intake` -> `review` -> `processing` -> `submitted` -> `decided`.

### 3.4 Automated Executive Digest Dispatcher

To maintain platform oversight across autonomous and partner workflows, an automated scheduled worker (`workers/sla-monitor` + `@visahobe/orchestrator`) compiles a daily executive digest dispatched to the Super Admin Command Center:

- **Volume Metrics:** Active cases, new intakes, completed decisions, and breakdown by country/visa category.
- **Agent Autonomy Ratios:** Percentage of cases processed at Level 1, Level 2, and Level 3 autonomy.
- **SLA Breach Warnings:** Applications stalled beyond government benchmarks or partner response deadlines.
- **Financial Balances:** Partner agency prepaid wallet balances, low-balance warnings (< $500), and top-up volumes.
- **Model Efficiency & Error Rates:** Model latency, token usage, and Browser Use execution exception rates.

---

## 4. Consequences and Invariants

### Positive Consequences

- **Operational Scalability:** Routine e-visas process with minimal human labor, drastically lowering operational costs.
- **Zero Consular Liability:** High-risk actions cannot execute without human oversight, shielding the platform from legal and financial harm.
- **Global Reach:** Standardized connector interfaces enable rapid onboarding of overseas immigration law firms.
- **Proactive Management:** Super Admin leadership possesses real-time visibility into operational bottlenecks via the daily Executive Digest.

### Negative Consequences / Trade-offs

- **Connector Maintenance:** Third-party partner APIs and webhook schemas require continuous version tracking and error handling.
- **State Machine Complexity:** Managing asynchronous transitions between internal agents and external partners requires durable state orchestration (LangGraph / Temporal).

---

## 5. Security & Safety Invariants

1. **Confidence Threshold Enactment:** An agent must never execute Level 3 autonomous submission if the OCR extraction confidence or document validity score is below `0.95`.
2. **Audit Snapshot:** Every autonomous submission must persist an immutable audit snapshot in `audit_logs` capturing the exact payload, timestamp, agent ID, and model configuration.
3. **No Credential Exposure:** Partner API tokens and government portal credentials must be resolved through `@visahobe/core` secret vault and never logged or exposed in client payloads.
