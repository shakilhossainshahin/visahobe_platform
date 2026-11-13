# ADR-005: Browser Automation Architecture and Browser Use Integration

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Lead Architect, Automation Systems Lead, Security Lead  
**Consulted:** Final Architecture Blueprint v2.0 (Sections 1, 5.3, 6, 11), Master System Blueprint v1.0 (Section 9)  

---

## 1. Context and Problem Statement

Visa, corporate registration, and consular support frequently require interacting with government portals, embassy portals, and partner agency web interfaces. Many of these portals lack public REST APIs or structured webhooks. 

To automate approved portal tasks (e.g. appointment availability checks, draft form entry, verification proof capture), the platform requires a browser automation core with vision capabilities, live human observation, client-visible read-only streams, screenshot-based client information requests, and real-time human takeover.

However, browser automation introduces extreme risks:
- Vendor lock-in to proprietary hosted browser models.
- Credential leakage in prompts, DOM logs, or screenshots.
- Anti-bot / CAPTCHA bypass violations that jeopardize legal compliance and client accounts.
- Uncontrolled autonomous submissions or payments without human sign-off.
- Cross-tenant observation or session hijacking.

The architecture must define how the open-source **Browser Use** framework is integrated securely without compromising platform sovereignty or security boundaries.

---

## 2. Decision Drivers

- **Platform Sovereignty:** VisaHobe must own the source of truth (tenant identity, case state, approval state, task lifecycle, and audit logs). The browser framework must remain a replaceable execution engine.
- **Model Flexibility:** The browser agent must utilize VisaHobe's selected vision models (Anthropic Claude 3.5/3.7 Sonnet, Google Gemini 2.0/3.8 Flash/Pro, OpenAI, or local Ollama endpoints via `BaseChatModel` or Model Gateway) rather than being locked into a proprietary hosted provider.
- **Strict Security Boundaries:** Containerized browser isolation, domain allowlists, action allowlists, and encrypted credential vault references.
- **Zero Anti-Bot Bypass:** The platform must never solve or bypass CAPTCHAs, MFA, or anti-bot challenges; it must pause and request authorized human intervention.
- **Human Takeover & Observability:** Real-time WebRTC/stream observation by Super Admin, optional client read-only view, and instant pause/takeover controls.

---

## 3. Decision

VisaHobe adopts **Browser Use as an isolated browser execution engine behind an internal `BrowserExecutionAdapter` abstraction**, executed in containerized workers and governed by VisaHobe's Model Gateway:

### 3.1 Architectural Boundary & Separation of Ownership
```
[ VisaHobe Core Orchestrator ]
  ├── Owns: Tenant identity, Case/Task State, Approval Gates, Credential References, Audit Log
  │
  ▼
[ BrowserExecutionAdapter (packages/browser-automation) ]
  │
  ▼ (gRPC / Internal Queue Contract)
[ Isolated Browser Worker (workers/browser-session) ]
  ├── Browser Use Framework (Runtime Engine)
  ├── Chromium in Sandbox Container
  ├── Model Gateway Adapter (Connects to approved Vision LLM)
  ├── Live Stream WebRTC Gateway
  ├── Screenshot & Redaction Pipeline
  └── Human Takeover Controller
```

- **VisaHobe Core Owns:**
  - Case, applicant, and task lifecycle.
  - Domain allowlists (e.g. `*.gov.sg`, `acra.gov.sg`).
  - Action permissions (`browser.session.create`, `browser.session.observe`, `browser.session.takeover`).
  - Human approval records for legally binding or financial steps.
  - Encrypted credential references from HashiCorp Vault / KMS.
  
- **Browser Use Execution Engine Owns:**
  - DOM tree parsing and coordinate generation.
  - Page navigation and vision model interaction.
  - Element clicking, text entry, and form population.
  - Browser-level retry and element recovery logic.

### 3.2 Integration Strategy (No Direct Code Inlining)
Browser Use will not be pasted directly into the core application codebase. Instead:
1. `packages/browser-automation` defines the abstract TypeScript contract (`BrowserExecutionAdapter`, `BrowserSessionOptions`, `BrowserActionResult`).
2. An isolated worker service (`workers/browser-session`) runs the Browser Use execution environment inside sandboxed Docker containers.
3. Portal-specific interaction scripts (e.g. Singapore ACRA, Dubai DED, Serbian APR) reside in VisaHobe's portal adapter registry.

### 3.3 Security, Privacy, and Human Gates
1. **Domain & Action Allowlists:** Browser sessions are restricted to explicitly configured domain patterns. Arbitrary web browsing is rejected.
2. **Credential Protection:** Credentials are injected directly into active input fields via isolated vault references; raw passwords and API keys are never exposed in prompt strings, chat logs, or agent traces.
3. **Automated PII Redaction:** Passports, credit card details, and confidential identity markers are masked on captured screenshots and live streams.
4. **Anti-Bot & CAPTCHA Protocol:** When a CAPTCHA, SMS OTP, or MFA prompt is detected, the browser worker immediately sets session status to `WAITING_FOR_HUMAN`, triggers an alert, and halts execution until an authorized human operator acts.
5. **Human Takeover:** Super Admin operators can click "Take Over" in the live viewer, instantly disengaging the AI agent, providing direct manual browser control, and requiring explicit resumption confirmation with state re-verification.

---

## 4. Consequences

### Positive
- **Vendor Independence:** The underlying browser execution engine can be replaced (e.g. with Playwright, Skyvern, or direct partner APIs) without impacting VisaHobe's core domain models.
- **Multi-Model Support:** The vision model powering browser navigation can be swapped dynamically based on task complexity, speed, and cost.
- **Robust Compliance:** Eliminates the legal risks of automated bot challenges and unauthorized filings.

### Negative / Trade-offs
- Running containerized Chromium instances alongside real-time video streaming requires dedicated worker infrastructure and memory resources.
- Network latency between the core orchestrator and the browser worker must be minimized.

### Mitigations
- Maintain a warm pool of pre-warmed, isolated browser containers in `workers/browser-session`.
- Enforce strict session timeouts (e.g. 15-minute maximum session duration with automatic teardown).

---

## 5. Compliance and Verification Criteria

- [ ] Browser session container fails to connect to any URL outside the registered domain allowlist.
- [ ] Detecting a CAPTCHA element emits a `BROWSER_SESSION_PAUSED` event with `reason: CAPTCHA_DETECTED` and pauses automation.
- [ ] Triggering human takeover immediately disarms the agent and locks out automated input commands.
- [ ] Client dashboard users can only access live streams for sessions where explicit client read permission has been granted by Super Admin.
