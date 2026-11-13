# VisaHobe — Final Architecture Blueprint & Implementation Plan

**Version:** 2.0 (Final Planning Baseline)  
**Date:** 13 November 2026  
**Status:** Ready for engineering-agent implementation planning  
**Purpose:** This document defines the complete system architecture, browser-automation/model strategy, Super Admin CLI model policy, UI/UX direction, repository structure, and the first implementation plan for VisaHobe.

This blueprint supersedes conflicting earlier assumptions and is the source of truth for the engineering agent before code generation begins.

---

## 1. Executive Decision Summary

VisaHobe will be built as a **premium, secure, multi-tenant AI operations platform** for visa, travel-support, business-migration and related services.

The platform will have:

1. A public marketing and intake website.
2. A secure Client Dashboard.
3. A powerful Super Admin Dashboard.
4. A Client Main Agent for each client tenant.
5. A Super Main Agent for authorized internal operators.
6. Specialist backend agents for intake, consulting, policy, preparation, verification and follow-up.
7. A durable workflow/task engine.
8. A secure Browser Automation and Remote Session Core.
9. A controlled GitHub engineering workflow through the Super Main Agent CLI.
10. A premium white + dark-green Liquid Glass-inspired UI system.

### Confirmed architectural decisions

| Decision | Final direction |
|---|---|
| Product surfaces | Public Website, Client Dashboard, Super Admin Dashboard |
| Partner Portal | Role-based workspace inside Super Admin for MVP; separate app later if needed |
| Architecture style | Modular monolith + independent workers + agent orchestration runtime |
| Database | PostgreSQL with Row-Level Security, migrations and auditability |
| Frontend | Next.js, React, TypeScript, Tailwind CSS and a shared design system |
| Agent orchestration | Durable stateful orchestration, preferably LangGraph or equivalent |
| Browser automation | Browser Use as the browser-agent execution layer, integrated through an internal abstraction |
| Browser model | Any approved model can be connected through Browser Use’s provider adapter/custom provider interface |
| Super Admin CLI | A restricted, authenticated engineering and operations CLI; model selection is configurable per task |
| Code changes | GitHub branch → PR → CI → human review → staging → production approval |
| UI theme | White base, dark-green primary brand, selective Liquid Glass effects |
| Initial rollout | One vertical slice at a time; no premature microservices |

Browser Use supports multiple LLM providers and explicitly supports custom provider implementation through its `BaseChatModel` interface; it also supports local/self-hosted models through Ollama and OpenAI-compatible endpoints. [web:2][web:5][web:10][web:16]

---

## 2. Product Architecture

### 2.1 Three primary surfaces

| Surface | Primary purpose | Users |
|---|---|---|
| Public Website | Service discovery, education, lead capture, eligibility intake, SEO and conversion | Visitors, prospective clients |
| Client Dashboard | Case tracking, documents, tasks, communication, payments and service progress | Clients and authorized client users |
| Super Admin Dashboard | Operations, cases, approvals, finance, partners, policies, agents, browser sessions and engineering | Owner, admins, case managers, verifiers, finance, browser operators, developers |

The Client Dashboard must be strictly tenant-scoped. A client must never access another client’s case, documents, agent conversation, browser session, credentials, internal notes or partner information.

### 2.2 Core modules

The system will contain the following first-class modules:

- Identity, authentication, MFA, roles and permissions.
- Tenant/client management.
- Lead capture and intake.
- Case management.
- Country, visa and service policy knowledge base.
- Document management, OCR and verification.
- Workflow/task engine.
- Agent runtime and tool-permission system.
- Partner management and assignment.
- Travel, business-registration and service-order management.
- Finance, invoicing, payments, refunds and reconciliation.
- Communication: dashboard chat, WhatsApp, Telegram and email.
- Browser automation and live session monitoring.
- CMS and configurable UI.
- Audit, security, retention and compliance.
- GitHub engineering control plane.

---

## 3. Role and Permission Model

### 3.1 Initial roles

- `owner`: platform owner; broad access with audited emergency override.
- `admin`: operational administration within granted scope.
- `case_manager`: assigned case queues, client communication and partner coordination.
- `verifier`: document review, verification evidence and approval gates.
- `finance`: invoices, payments, refunds and reconciliation.
- `client`: access only to its own tenant workspace.
- `partner`: access only to assigned work and permitted records.
- `browser_operator`: assigned browser-session monitoring and controlled operations.
- `developer_reviewer`: code review, CI inspection and deployment approval.
- `content_editor`: CMS content within approval workflow.
- `policy_editor`: country policy packs within approval workflow.

### 3.2 Permission principles

Permissions must be enforced at three layers:

1. UI layer: hides unauthorized actions.
2. API/service layer: validates authorization before execution.
3. Database layer: PostgreSQL RLS prevents unauthorized data access even if application logic fails.

Every sensitive action must have an explicit permission key, for example:

- `case.read`
- `case.update`
- `document.verify`
- `submission.approve`
- `invoice.issue`
- `refund.approve`
- `partner.manage`
- `browser.session.create`
- `browser.session.observe`
- `browser.session.takeover`
- `github.branch.create`
- `github.pr.create`
- `deployment.approve`

No agent may grant itself permissions, bypass approval, access another tenant’s data, or execute a high-impact action without explicit authorization.

---

## 4. Agent Architecture

### 4.1 Client Main Agent

The Client Main Agent is the primary AI interface for a client.

It will:

- Understand the client request in Bangla, English or Banglish.
- Identify the relevant case, service or task.
- Ask for missing information.
- Create and update durable tasks.
- Delegate work to specialist agents.
- Provide progress updates.
- Present policy information with source and version references.
- Escalate to a human when required.
- Never make a final visa decision, approve a submission, issue a refund, or perform an unauthorized external action.

The Client Main Agent is an orchestrator, not an unrestricted administrator.

### 4.2 Super Main Agent

The Super Main Agent is the internal AI operations and engineering assistant.

It will be available through:

- Super Admin chat.
- A restricted CLI.
- Approved WhatsApp/Telegram admin control channels, only after strong identity verification.

It will support:

- Platform status and operational investigation.
- Case, task and workflow analysis.
- CMS and UI configuration changes.
- GitHub repository inspection.
- Feature branch creation.
- Code implementation within bounded scope.
- Test execution and CI reporting.
- Pull-request creation.
- Migration proposal.
- Staging deployment preparation.
- Production deployment request.
- Health monitoring and rollback assistance.

It must not directly deploy to production, merge protected branches, run destructive SQL, alter production schema without reviewed migrations, or bypass human approval.

### 4.3 Specialist agents

The initial specialist agents will be:

| Agent | Responsibility | Guardrail |
|---|---|---|
| A1 Intake Agent | Onboarding, profile completion and information collection | Minimum necessary data; schema validation |
| A2 Consultant Agent | Service, country, package and cost guidance | Approved policy sources only; no guarantees |
| A3 Policy & Eligibility Agent | Eligibility analysis, risk flags and document checklists | Source citations, effective dates and uncertainty |
| A4 Preparation Agent | Forms, letters, document sets and appointment preparation | Draft only; approval before external submission |
| A5 Verification Assistant | OCR, extraction, consistency checks and missing-data detection | Suggestions only; human verifier approves |
| A6 Follow-up Agent | Reminders, progress updates, SLA monitoring and escalation | Consent, quiet hours and communication rules |

Additional capabilities should first be implemented as bounded tools, not separate autonomous agents.

### 4.4 Agent execution contract

Every agent run must record:

- `run_id`
- `task_id`
- tenant/client scope
- optional `case_id`
- agent name
- selected model/provider
- prompt version
- tool version
- allowed tools
- input/output schema
- policy-pack version
- source references
- start/end time
- token usage, latency and cost
- confidence/uncertainty
- status
- retries
- human-review requirement
- audit references

Agent output is untrusted until schema validation, business-rule validation, source validation and task-specific acceptance checks pass.

---

## 5. Super Admin CLI and Model Strategy

### 5.1 CLI purpose

The Super Admin CLI will be a controlled internal engineering and operations interface.

It will support commands such as:

```bash
visahobe status
visahobe case inspect --case-id
visahobe task inspect --task-id
visahobe agent run --agent policy --task-id
visahobe github inspect
visahobe github branch create
visahobe github pr create
visahobe ci inspect
visahobe migration propose
visahobe deploy staging
visahobe deploy production --requires-approval
visahobe rollback --requires-approval
```

The CLI must be authenticated, permission-scoped, logged and protected by confirmation for destructive or high-impact operations.

### 5.2 Model selection policy

Yes — the Super Main Agent CLI should support selectable models.

The system will maintain a model registry:

```json
{
  "model_id": "claude-sonnet",
  "provider": "anthropic",
  "capabilities": ["reasoning", "coding", "vision"],
  "allowed_tasks": ["code_generation", "architecture", "browser_agent"],
  "max_output_tokens": 8000,
  "cost_tier": "high",
  "requires_approval": false
}
```

Recommended model routing:

| Task | Preferred model class | Reason |
|---|---|---|
| Architecture and complex coding | High-reasoning coding model | Better planning and implementation quality |
| Routine code edits | Fast coding model | Lower cost and latency |
| Policy explanation | High-reliability model with retrieval | Reduces hallucination risk |
| Document extraction | OCR model + structured extraction model | Accuracy and auditability |
| Browser agent | Vision-capable model | Screenshots and UI understanding |
| Simple chat/support | Cost-efficient model | Lower operating cost |
| Sensitive decision support | Human-reviewed model output | Safety and accountability |

The user must be able to choose the model from the Super Admin CLI, for example:

```bash
visahobe agent run \
  --agent engineering \
  --model claude-sonnet \
  --task "Implement document upload API and tests"
```

The system must validate:

- Whether the selected model is approved.
- Whether the model has permission for the requested tool.
- Whether the task requires vision, coding, long context or browser control.
- Whether cost limits and rate limits allow the run.
- Whether the output requires human approval.

### 5.3 Browser model integration

Browser Use can be used with the platform’s own selected model.

Browser Use natively supports multiple providers, including Anthropic, Google, OpenAI-compatible endpoints, Ollama for local models, OpenRouter, DeepSeek, Groq, Mistral, Cerebras and others. It also supports custom provider implementation through the `BaseChatModel` interface. [web:2][web:5][web:10][web:16]

Therefore, VisaHobe will not be locked to Browser Use’s hosted model.

The integration design will be:

```text
VisaHobe Browser Agent
        |
        v
Browser Use Runtime
        |
        +-- VisaHobe Model Gateway
                |
                +-- Anthropic
                +-- OpenAI-compatible endpoint
                +-- Google Gemini
                +-- Ollama / self-hosted model
                +-- OpenRouter
                +-- Custom VisaHobe model provider
```

The Browser Agent Runtime will receive:

- Task objective.
- Approved domain allowlist.
- Allowed action list.
- Redaction rules.
- Credential references, never raw credentials.
- Approval requirements.
- Screenshot and event-capture policy.
- Stop conditions.
- Human-takeover rules.

Browser Use gives an agent a real browser and supports running with local or hosted LLMs. [web:9][web:10]

---

## 6. Browser Automation Architecture

### 6.1 Confirmed answer

Yes, the Browser Use repository can be integrated into VisaHobe, and VisaHobe can connect its own selected model to the browser agent.

However, Browser Use should be treated as a **browser execution engine**, not as the platform’s source of truth.

VisaHobe will own:

- Tenant identity.
- Case state.
- Task state.
- Approval state.
- Permissions.
- Audit logs.
- Client communication.
- Policy rules.
- Credential vault references.
- Partner and portal configuration.

Browser Use will own:

- Browser session execution.
- Page interaction.
- DOM/visual interpretation through the selected model.
- Screenshot capture support.
- Browser action execution.
- Browser-level recovery behavior.

### 6.2 Browser session lifecycle

```text
REQUEST_CREATED
      |
      v
POLICY_AND_PERMISSION_CHECK
      |
      v
HUMAN_APPROVAL_IF_REQUIRED
      |
      v
ISOLATED_BROWSER_SESSION_CREATED
      |
      v
BROWSER_AGENT_RUNS_APPROVED_STEPS
      |
      +--> MISSING_INFO --> CLIENT_INFORMATION_REQUEST
      |
      +--> CAPTCHA/MFA/SECURITY_CHECK --> HUMAN_INTERVENTION
      |
      +--> HIGH_RISK_ACTION --> HUMAN_APPROVAL_GATE
      |
      v
PROOF_AND_REFERENCE_CAPTURED
      |
      v
TASK_VALIDATED
      |
      v
COMPLETED / FAILED / ESCALATED
```

### 6.3 Browser security boundaries

The browser subsystem must enforce:

- Isolated browser containers.
- Short-lived session credentials.
- Encrypted credential vault references.
- Domain allowlists.
- Action allowlists.
- No arbitrary shell or SQL access.
- No credential exposure in prompts, chat, screenshots or logs.
- PII redaction in screenshots and streams.
- No CAPTCHA, MFA or anti-bot bypass.
- Pause on unclear legal, financial or identity-related actions.
- Human approval before final submission, payment, contract acceptance or legally significant declaration.
- Full audit trail for actor, action, URL, timestamp, task, screenshot and result.
- Client read-only access only when explicitly granted for that specific session.

A client may see a live read-only view of its own authorized browser session, but must not be able to control the browser or access another client’s session.

### 6.4 Browser Use integration approach

Do not copy Browser Use code directly into the VisaHobe application repository.

Instead:

1. Add Browser Use as a controlled dependency or run it in an isolated browser-worker service.
2. Create a `BrowserExecutionAdapter` interface inside VisaHobe.
3. Implement a Browser Use adapter behind that interface.
4. Keep portal-specific logic in VisaHobe’s adapter registry.
5. Keep model routing in VisaHobe’s Model Gateway.
6. Keep approvals, task state and audit logs in VisaHobe’s core system.

This prevents vendor lock-in and allows future replacement with Playwright, Skyvern, a partner API or another browser runtime.

---

## 7. Workflow and Task Engine

### 7.1 Task lifecycle

```text
DRAFT
  -> QUEUED
  -> RUNNING
  -> WAITING_FOR_CLIENT
  -> WAITING_FOR_PARTNER
  -> WAITING_FOR_HUMAN
  -> BLOCKED
  -> VALIDATING
  -> COMPLETED
```

Terminal states:

```text
FAILED
CANCELLED
EXPIRED
```

No direct arbitrary status updates will be allowed. Status changes must happen through validated domain commands and events.

### 7.2 Core workflow domains

The initial workflow registry will include:

1. Lead capture and intake.
2. Client registration and consent.
3. Profile completion.
4. Free eligibility assessment.
5. Service/package selection.
6. Quote and invoice generation.
7. Payment initiation and confirmation.
8. Case creation and assignment.
9. Document checklist generation.
10. Secure document upload and malware scanning.
11. OCR and extraction.
12. Human document verification.
13. Missing-information request.
14. Preparation and consistency validation.
15. Human approval gate.
16. Appointment preparation/booking.
17. Submission coordination and proof capture.
18. External status monitoring.
19. Decision/result recording.
20. Travel service request and booking.
21. Translation/notary/courier service order.
22. Business registration partner workflow.
23. Partner assignment and SLA monitoring.
24. Client progress notifications.
25. Human support handover.
26. Case closure and follow-up.
27. Refund/complaint workflow.
28. Data access/correction/deletion request.
29. Browser session lifecycle.
30. Client information request/response.
31. Human takeover and session recovery.
32. GitHub code-change workflow.
33. CMS/UI configuration publishing.
34. Country policy review and approval.
35. Partner due diligence and renewal.
36. Audit, retention and compliance review.

---

## 8. Data Architecture

### 8.1 Core entity groups

- `tenants`
- `users`
- `memberships`
- `roles`
- `permissions`
- `sessions`
- `leads`
- `clients`
- `cases`
- `case_applicants`
- `case_events`
- `tasks`
- `task_events`
- `workflow_definitions`
- `workflow_runs`
- `agent_runs`
- `tool_calls`
- `approvals`
- `countries`
- `services`
- `policy_packs`
- `policy_versions`
- `official_sources`
- `documents`
- `document_versions`
- `ocr_extractions`
- `verification_reviews`
- `partners`
- `partner_assignments`
- `service_orders`
- `travel_requests`
- `bookings`
- `invoices`
- `invoice_lines`
- `payments`
- `refunds`
- `ledger_entries`
- `chat_threads`
- `messages`
- `channel_connections`
- `notifications`
- `browser_sessions`
- `browser_session_events`
- `browser_screenshots`
- `browser_agent_actions`
- `browser_human_takeovers`
- `client_information_requests`
- `client_information_responses`
- `audit_logs`
- `deployment_records`
- `code_change_requests`

### 8.2 Data rules

- Use UUID primary keys for core entities.
- Use `created_at`, `updated_at`, actor attribution and tenant scope.
- Use numeric decimal types for money.
- Store currency using ISO 4217 codes.
- Use idempotency keys for payment and external actions.
- Store files in private object storage; store only metadata and references in the database.
- Use append-only audit/event records for sensitive lifecycle changes.
- Use migrations as the only schema-change mechanism.
- Avoid storing PII in logs, prompts, analytics or agent traces.
- Define retention and deletion rules per data class.

---

## 9. Technical Stack

| Layer | Initial choice | Notes |
|---|---|---|
| Web apps | Next.js + React + TypeScript | Public, client and admin applications |
| UI | Tailwind CSS + shadcn/ui or equivalent | Shared design system |
| Backend | Node.js/TypeScript modular API | One primary backend language initially |
| Database | PostgreSQL | RLS, constraints, transactions and JSONB where justified |
| ORM | Prisma or equivalent | Reviewed migrations only |
| Auth | Supabase Auth or equivalent | MFA, RBAC and secure sessions |
| Jobs | pg-boss or equivalent | Durable retries and dead-letter handling |
| Storage | S3-compatible private object storage / Cloudflare R2 | Signed URLs and encryption |
| Agent orchestration | LangGraph or equivalent durable runtime | Resumable, stateful workflows |
| Browser automation | Browser Use + isolated Chromium | Behind VisaHobe adapter |
| Browser streaming | Secure WebRTC/remote-browser gateway | Evaluate latency and access control |
| Realtime | WebSocket/SSE + event infrastructure | Chat, task and browser updates |
| OCR | Provider-agnostic OCR adapter | Bangla and English support |
| LLM | Provider-agnostic Model Gateway | Model routing, cost control and evaluations |
| Messaging | WhatsApp Business Platform, Telegram Bot API, email provider | Consent and delivery tracking |
| Payments | Adapter-based local gateways | Reconciliation required |
| Observability | Structured logs, Sentry, OpenTelemetry | PII redaction |
| Deployment | CI/CD + managed database + container workers | Separate staging and production |

Avoid making n8n the primary source of truth for case state. It may be used only for suitable integrations.

---

## 10. UI/UX Design System

### 10.1 Visual direction

VisaHobe will use a **premium white + dark-green** interface with selective **Liquid Glass-inspired** effects.

The design must feel:

- Premium.
- Calm.
- Trustworthy.
- Modern.
- Professional.
- International.
- Easy to use for non-technical clients.
- Efficient for internal operations teams.

The old navy/cyan direction is discontinued. Dark green is the primary brand color.

### 10.2 Color system

| Token | Usage |
|---|---|
| `--color-bg` | White / near-white background |
| `--color-surface` | Card and panel surface |
| `--color-surface-muted` | Secondary panels and subtle sections |
| `--color-brand-900` | Deep dark green |
| `--color-brand-700` | Primary dark green |
| `--color-brand-500` | Primary interactive green |
| `--color-brand-100` | Light green tint |
| `--color-success` | Verified, completed, healthy |
| `--color-warning` | Pending, needs attention |
| `--color-danger` | Rejected, failed, blocked |
| `--color-info` | Neutral informational state |
| `--color-text-primary` | High-contrast primary text |
| `--color-text-secondary` | Supporting text |
| `--color-border` | Subtle borders |

### 10.3 Liquid Glass rules

Liquid Glass will be used selectively for:

- Floating command palette.
- Agent activity panel.
- Browser live-view overlay.
- Modal dialogs.
- Drawer panels.
- Notification center.
- Approval action bar.
- Premium marketing hero sections.

Liquid Glass must not be used heavily on:

- Data tables.
- Document review screens.
- Financial records.
- Long forms.
- Dense admin queues.
- Accessibility-critical text areas.

### 10.4 Typography

Use a modern, highly readable type system:

- Primary UI font: Inter or equivalent.
- Display font: A refined premium sans-serif for marketing headlines.
- Mono font: For IDs, code, CLI output, migration names and technical references.
- Bangla support: Use a high-quality Bangla-compatible font stack.

Typography hierarchy:

- Display: Large, confident marketing headings.
- H1: Page titles.
- H2: Section titles.
- H3: Card and module titles.
- Body: Clear, readable content.
- Caption: Metadata, timestamps and helper text.
- Label: Form labels, filters and status labels.

### 10.5 Core UI components

The design system must include:

- App shell and sidebar.
- Top bar with search, notifications and profile.
- Command palette.
- KPI tile.
- Filter bar.
- Data table.
- Case card.
- Case status pipeline.
- Task card.
- Task timeline.
- SLA countdown.
- Document tile.
- Upload dropzone.
- Verification report.
- Approval bar.
- Client information request card.
- Chat interface.
- Agent activity card.
- Tool-call inspector.
- Browser live viewer.
- Screenshot annotation viewer.
- Human takeover banner.
- Quote/package comparison.
- Invoice/payment row.
- Partner card.
- Policy source/version panel.
- Empty state.
- Skeleton loader.
- Error state.
- Toast.
- Modal.
- Drawer.
- Stepper.
- Checklist.
- Consent block.
- Disclaimer strip.

### 10.6 UX principles

- Show the current stage clearly.
- Always show the next required action.
- Clearly identify the owner: client, agent, staff member or partner.
- Show deadlines only when reliable.
- Separate client-facing progress from internal operational detail.
- Never expose internal prompts, credentials or confidential staff notes.
- Every major component needs normal, loading, empty, error and disabled states.
- Maintain accessible contrast and keyboard navigation.
- Support desktop, tablet and mobile.
- Use motion sparingly and purposefully.

---

## 11. GitHub Architecture Research

### 11.1 Relevant reference patterns

Several open-source projects demonstrate parts of the desired architecture:

- **LangGraph** provides low-level orchestration for long-running, stateful agents. [web:26]
- **OrbitOps** demonstrates a multi-tenant AI business-operations control plane with LangGraph agents, human approval and append-only audit evidence. [web:18]
- **AIOps Hub** demonstrates a modular multi-tenant SaaS pattern using Next.js, NestJS, PostgreSQL, Prisma, LangGraph and AI agents. [web:25]
- **OpenBotX** demonstrates multi-agent orchestration, real-time task board, web control panel, browser automation, multi-provider models and scheduling. [web:22]
- **CortexPrism** demonstrates a self-hosted agent runtime with browser automation, multi-agent orchestration, sandboxed execution and session isolation. [web:27]
- **ai-browser-automation-framework** demonstrates multi-tenant browser automation with isolated tenant browser profiles, task queues, state machines, self-healing locators and human escalation. [web:19]
- **ai-gtm-browser-agent-case-study** demonstrates a multi-tenant browser-session automation architecture with scheduler, CRM integration, audit and kill switches. [web:20]
- **Skyvern** is another browser-automation platform using agents and computer vision for website workflows. [web:29]

### 11.2 What VisaHobe should adopt

VisaHobe should adopt the strongest patterns from these references:

- Multi-tenant isolation.
- Durable task/workflow state.
- Agent-tool permission boundaries.
- Human approval gates.
- Append-only audit evidence.
- Browser session isolation.
- Portal adapters.
- Screenshot-based client information requests.
- Human takeover.
- CI/CD-controlled engineering workflow.
- Model-provider abstraction.
- Evaluation and observability.

### 11.3 What VisaHobe should avoid

Do not copy an entire open-source project architecture blindly.

Avoid:

- Generic agent platforms without tenant-level security.
- Browser automation without domain/action allowlists.
- Autonomous agents with unrestricted shell, database or internet access.
- Using a chat message as the source of truth for a business workflow.
- Building all dashboards and all agents before the core case lifecycle works.
- Hard-coding a single LLM provider.
- Allowing agents to merge, deploy or migrate production systems without approval.

---

## 12. Repository Structure

```text
visahobe/
├── apps/
│   ├── website/
│   ├── client-dashboard/
│   ├── super-admin/
│   └── super-agent-console/
├── services/
│   ├── api/
│   ├── agent-runtime/
│   ├── orchestrator/
│   └── realtime/
├── packages/
│   ├── database/
│   ├── auth/
│   ├── core/
│   ├── agents/
│   ├── workflows/
│   ├── ui/
│   ├── design-system/
│   ├── cms/
│   ├── integrations/
│   ├── browser-automation/
│   └── shared/
├── workers/
│   ├── document-processing/
│   ├── task-execution/
│   ├── notifications/
│   ├── follow-up/
│   ├── sla-monitor/
│   ├── partner-sync/
│   ├── finance-reconciliation/
│   └── browser-session/
├── self-hosted/
│   └── super-agent/
│       ├── runtime/
│       ├── cli/
│       ├── github/
│       ├── tools/
│       ├── security/
│       └── docker/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── policies/
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── agents/
│   ├── workflows/
│   ├── security/
│   └── runbooks/
└── tests/
    ├── unit/
    ├── integration/
    ├── e2e/
    ├── security/
    └── agent-evals/
```

---

## 13. Implementation Plan

### Phase 0 — Foundation

**Goal:** Establish a secure, testable engineering foundation.

Deliverables:

- Monorepo initialization.
- TypeScript, lint, format and test setup.
- CI pipeline.
- Development and staging environments.
- Database migration workflow.
- Authentication and MFA baseline.
- RBAC and tenant isolation.
- Logging, monitoring and secret management.
- Architecture Decision Records.

Acceptance criteria:

- A user can authenticate in staging.
- Cross-tenant access is denied.
- CI runs on every pull request.
- Migrations are reproducible.
- Secrets are never committed to source control.

### Phase 1 — Public website and intake

**Goal:** Launch the public acquisition layer.

Deliverables:

- Public pages.
- Service catalogue.
- Country/service guides.
- Pricing and disclaimers.
- Lead capture.
- Free eligibility intake.
- CMS foundation.
- SEO foundation.

Acceptance criteria:

- A visitor can browse services and submit a lead.
- An authorized admin can see the lead.
- CMS changes follow draft/review/publish flow.

### Phase 2 — Client workspace

**Goal:** Build the secure client experience.

Deliverables:

- Client dashboard shell.
- Profile and consent.
- Case creation.
- Case timeline.
- Secure document upload.
- Basic invoice/payment status.
- Notifications.

Acceptance criteria:

- A client can create and track a case.
- A client can upload a document.
- Tenant isolation and file-access tests pass.

### Phase 3 — Workflow and operations

**Goal:** Build the operational backbone.

Deliverables:

- Task engine.
- Workflow registry.
- Case-manager queues.
- Verifier queue.
- Approval gates.
- SLA monitoring.
- Reminders and escalation.
- Internal versus client-visible activity separation.

Acceptance criteria:

- A case progresses through controlled stages.
- Protected transitions cannot bypass approval.
- Every task has owner, status and event history.

### Phase 4 — Client Main Agent

**Goal:** Launch the first useful AI agent experience.

Deliverables:

- Client Main Agent.
- A1 Intake Agent.
- A2 Consultant Agent.
- Approved knowledge retrieval.
- Tool permission contract.
- Agent run logs.
- Evaluation tests.

Acceptance criteria:

- The agent answers policy-sensitive questions only from approved sources.
- The agent can create a task and request missing information.
- The agent cannot approve or submit protected actions.

### Phase 5 — Policy, documents and verification

**Goal:** Build the core visa-service delivery engine.

Deliverables:

- Versioned country policy packs.
- Official source registry.
- OCR/extraction pipeline.
- A3 Policy & Eligibility Agent.
- A4 Preparation Agent.
- A5 Verification Assistant.
- Human review and document versioning.

Acceptance criteria:

- Document upload-to-review pipeline works.
- OCR output is a draft, not automatic verification.
- Policy responses include source, version and uncertainty.

### Phase 6 — Communication

**Goal:** Unify client communication.

Deliverables:

- Unified conversation/thread model.
- Website chat.
- Telegram integration.
- WhatsApp integration after eligibility verification.
- A6 Follow-up Agent.
- Human handover.

Acceptance criteria:

- Conversation continuity works across enabled channels.
- Consent, delivery status and message audit work.
- Human handover pauses relevant automation.

### Phase 7 — Partner and service operations

**Goal:** Enable partner-led and additional service workflows.

Deliverables:

- Partner onboarding and due diligence.
- Partner assignment.
- Business-registration workflow.
- Travel/service-order lifecycle.
- Finance reconciliation and commissions.

Acceptance criteria:

- Only approved partners can be assigned.
- Partners see only assigned work.
- Invoice lines clearly separate company, government and partner amounts.

### Phase 8 — Browser automation

**Goal:** Launch secure live browser operations.

Deliverables:

- Browser Use adapter.
- Isolated browser runtime.
- Portal adapter registry.
- Browser Session Manager.
- Super Admin live viewer.
- Client read-only permission flow.
- Screenshot-based client information request.
- Human pause/takeover/resume.
- Audit and retention.

Acceptance criteria:

- A test portal session can be monitored securely.
- A client cannot control the browser or see another client’s session.
- Sensitive fields are redacted.
- CAPTCHA/MFA pauses for human intervention.
- Browser actions are auditable.

### Phase 9 — Super Main Agent and GitHub

**Goal:** Enable controlled AI-assisted engineering.

Deliverables:

- Super Admin chat.
- Restricted CLI.
- Model selector.
- GitHub inspection.
- Branch and PR workflow.
- CI result inspection.
- CMS/UI configuration actions.
- Migration proposal workflow.
- Staging and production approval gates.
- Deployment health checks and rollback.

Acceptance criteria:

- The agent can create a PR and report test results.
- The agent cannot merge or deploy protected changes without approval.
- Production schema changes occur only through approved migrations.

### Phase 10 — Hardening and launch

**Goal:** Prepare for controlled production launch.

Deliverables:

- Security review.
- Penetration testing.
- Backup restore exercise.
- Load/performance testing.
- Agent red-team tests.
- Retention and incident runbooks.
- Pilot client and partner onboarding.
- Monitoring and rollback readiness.

Acceptance criteria:

- Critical security findings are resolved.
- Support and incident procedures are tested.
- Pilot workflows meet acceptance criteria.

---

## 14. First Engineering-Agent Task

The engineering agent must not begin by generating the entire application.

Its first task is:

1. Inspect the existing repository and runtime.
2. Produce a repository audit.
3. Create `docs/architecture/`.
4. Store this blueprint in the repository.
5. Create ADRs for:
   - Product surfaces.
   - Tenant model.
   - Backend stack.
   - Agent orchestration.
   - Browser Use integration.
   - Model gateway.
   - Deployment model.
   - Security model.
6. Propose Phase 0 implementation tickets.
7. Wait for human approval before major code generation or destructive changes.

### Required reporting format

After every task, the engineering agent must report:

- Objective.
- What was implemented.
- Files changed.
- Database migrations.
- API/events changed.
- Tests executed and results.
- Security/permission implications.
- Screenshots or preview links.
- Remaining blockers.
- Exact next recommended task.

---

## 15. Final Architectural Principle

VisaHobe is not a simple chatbot or a generic automation tool.

It is a **secure AI-operated service-delivery platform** where:

- AI prepares, researches, coordinates and drafts.
- Humans approve high-impact actions.
- The workflow engine owns truth.
- The browser executes only approved actions.
- Every client remains isolated.
- Every important action remains auditable.
- Every model remains replaceable.
- Every UI surface feels premium, clear and trustworthy.

This architecture allows VisaHobe to scale from an initial visa-service workflow into a full international business-migration and operations platform without rebuilding the foundation.

**End of Final Architecture Blueprint.**
