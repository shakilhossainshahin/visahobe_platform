\# VisaHobe --- Master System Blueprint



\*\*Document type:\*\* Architecture \& Implementation Source of Truth\\

\*\*Version:\*\* 1.0\\

\*\*Prepared:\*\* 13 November 2026\\

\*\*Status:\*\* Architecture baseline for implementation planning --- not a

claim that any component is already built.



\------------------------------------------------------------------------



\## 1. Executive Summary



VisaHobe is an AI-powered visa, travel-support, business-migration and

operations platform. It is not merely a marketing website or a chatbot.

It combines:



1\.  A public website for service discovery, education, lead generation

&#x20;   and conversion.

2\.  A multi-tenant Client SaaS Dashboard where each client manages their

&#x20;   profile, cases, documents, payments, tasks, conversations and

&#x20;   service orders.

3\.  A Super Admin Dashboard for platform operations, policy, partner,

&#x20;   finance, security, content, agent and engineering management.

4\.  A Client Main Agent that coordinates work for an individual

&#x20;   client/tenant.

5\.  A Super Main Agent that assists authorized platform administrators

&#x20;   with platform operations and controlled software engineering

&#x20;   workflows.

6\.  A network of specialist backend agents.

7\.  A workflow/task engine with explicit state transitions, deadlines,

&#x20;   retries, auditability and human approval gates.

8\.  A Browser Automation \& Remote Session Core for approved

&#x20;   partner-portal work, live observation, screenshots, client

&#x20;   information requests and human takeover.

9\.  Communication integrations including website chat, WhatsApp,

&#x20;   Telegram and email.

10\. Country policy, partner, travel, document, finance and compliance

&#x20;   data systems.



\*\*Core operating principle:\*\* AI may research, organize, draft,

recommend, prepare and execute specifically authorized low-risk actions.

It must not impersonate a human decision-maker, guarantee visa outcomes,

fabricate policy or fee information, bypass portal security, approve its

own high-impact work, or make legally binding decisions without the

required human approval.



This document consolidates the original VisaHobe Full Blueprint (v3.1,

dated 10 Nov 2026), the Business Visa Roadmap (11 Nov 2026), and the

additional requirements subsequently defined for the Client Main Agent,

Super Main Agent, live browser execution and GitHub-controlled

engineering.



\------------------------------------------------------------------------



\## 2. Product Surfaces and Workspaces



\### 2.1 Three primary product surfaces



The authoritative product structure is three primary surfaces:



&#x20; -----------------------------------------------------------------------

&#x20; Surface                 Purpose                 Main users

&#x20; ----------------------- ----------------------- -----------------------

&#x20; Public Website          Marketing, service      Visitors and

&#x20;                         information, country    prospective clients

&#x20;                         guides, pricing, lead   

&#x20;                         capture, free           

&#x20;                         eligibility/intake      



&#x20; Client Dashboard        Secure client workspace Client, authorized

&#x20;                         and service delivery    client team members

&#x20;                         interface               



&#x20; Super Admin Dashboard   Platform-wide control,  Owner, admins, case

&#x20;                         operations, approvals,  managers, verifiers,

&#x20;                         finance, policies,      finance and other staff

&#x20;                         partners, agents and    roles

&#x20;                         engineering oversight   

&#x20; -----------------------------------------------------------------------



These are the three top-level product surfaces. Operations and partner

capabilities may be implemented as role-based workspaces within the

Super Admin application initially. A dedicated Partner Portal can be

split into its own app later if partner scale, isolation or usability

requires it. This resolves the earlier five-dashboard wording without

discarding the original operational and partner functions.



\### 2.2 Public Website



Required capabilities: - Home, about, contact and trust/compliance

information. - Service catalogue and service detail pages. - Country and

visa-type guides. - Business migration and company-formation service

pages. - Pricing/packages and transparent fee breakdowns. - Free

eligibility/intake flow. - Lead capture and conversion tracking. - Blog,

knowledge base, FAQs and announcements. - SEO metadata, canonical URLs,

sitemap, robots rules and structured data. - CMS-managed content with

review/publish permissions. - Clear disclaimers: no visa guarantee;

official government/embassy fees are distinct from VisaHobe service

fees. - Localization-ready content architecture (Bangla and English

initially; more languages later).



\### 2.3 Client Dashboard



Client workspace modules: - Overview and case status. - Profile and

applicant/family information. - Case list and case details. - Country,

service and package selection. - Eligibility result and source

references. - Document checklist, upload, version history and

verification feedback. - Case timeline and progress updates. - Tasks and

client information requests. - Secure chat with Client Main Agent and

human support. - WhatsApp and Telegram connection settings. - Invoices,

payments, receipts and refund request status. - Travel requests and

bookings where offered. - Business registration / migration service

progress. - Partner work visibility where permitted. - Browser session

viewer when Super Admin grants client-specific read-only access. -

Consent, privacy and data-subject request controls. - Notifications and

communication preferences.



Client access is strictly tenant-scoped. A client must never see another

client's case, files, partner assignment, browser session, credentials,

internal staff notes or private operational information.



\### 2.4 Super Admin Dashboard



Super Admin workspaces: - Executive overview and operational KPIs. -

Leads and client management. - Client 360 view. - Cases and workflow

queues. - Task assignment, SLA and escalation. - Human verification and

approval queues. - Document review and OCR results. - Country policy

packs and official sources. - Service catalogue, packages and pricing. -

Partner directory, due diligence, contracts and performance. - Travel

and other service orders. - Invoices, payments, refunds, commissions and

reconciliation. - Client communications and support handover. -

Specialist agent configuration, runs, evaluations and cost monitoring. -

Client Main Agent and Super Main Agent settings. - Browser sessions,

live viewer, screenshots, event logs, recording retention and takeover

controls. - CMS and dynamic UI configuration. - Audit logs, security

events, access reviews and retention jobs. - GitHub engineering

workspace: repository status, branches, pull requests, CI results,

deployment approvals and rollback status.



\------------------------------------------------------------------------



\## 3. User Roles, Tenant Model and Permission Boundaries



\### 3.1 Initial roles



The original blueprint defines these core roles: - `owner`: platform

owner; broad access, emergency override with full audit. - `admin`:

operational and configuration administration within granted scope. -

`case\_manager`: manages assigned case queues, tasks, client

communication and partner coordination. - `verifier`: reviews documents,

verification evidence and approval gates. - `finance`: invoices,

payments, refunds and financial reconciliation. - `client`: access to

own tenant/client workspace and permitted records. - `partner`: access

only to assigned partner work, proof uploads and permitted statements.



Additional scoped roles may include `content\_editor`, `policy\_editor`,

`support\_agent`, `security\_auditor`, `browser\_operator` and

`developer\_reviewer`. Add roles only when a real separation of duties is

needed.



\### 3.2 Tenant isolation



\-   Use a tenant/org identifier on all tenant-owned records.

\-   Enforce PostgreSQL Row-Level Security (RLS) as a database-level

&#x20;   boundary, not merely frontend filtering.

\-   Derive tenant identity from authenticated server-side claims; never

&#x20;   trust a client-supplied `org\_id`.

\-   Test cross-tenant reads, writes, file access, search, exports, agent

&#x20;   tools and browser session access.

\-   Platform-wide Super Admin access must be explicit, role-scoped and

&#x20;   audited.

\-   Partner access is assignment-scoped and time-bounded where

&#x20;   practical.



\### 3.3 Permission design



Use permission checks at API/service boundaries and database policies.

Define actions such as: - `case.read`, `case.update`, `case.assign` -

`document.read`, `document.upload`, `document.verify` -

`submission.prepare`, `submission.approve`, `submission.execute` -

`invoice.read`, `invoice.issue`, `refund.approve` - `partner.manage`,

`policy.edit`, `policy.approve` - `browser.session.create`,

`browser.session.observe`, `browser.session.takeover`,

`browser.session.stop` - `github.branch.create`, `github.pr.create`,

`deployment.approve`



Separate preparation from approval and approval from execution. No agent

may grant itself new permissions.



\------------------------------------------------------------------------



\## 4. Agent Architecture



\### 4.1 Two central Main Agents



\#### Client Main Agent



One logical agent interface per client/tenant: - Available in Client

Dashboard chat. - Can be connected to the client's authorized WhatsApp

and Telegram identities. - Maintains the client's conversation context

and relevant case context under tenant permissions. - Interprets the

client's request and identifies the relevant case/service. - Creates a

trackable task or workflow run. - Delegates specialist work to approved

backend agents. - Coordinates dependencies and waits for results. -

Requests missing information from the client. - Sends progress updates

and blockers. - Presents outputs, evidence and next actions. - Escalates

to human support or verifier when required.



It is an orchestrator, not a universal unrestricted administrator. It

may only invoke tools and actions granted to its tenant and task scope.



\#### Super Main Agent



A platform-level assistant available through: - Super Admin chat

interface. - Restricted CLI interface. - Approved WhatsApp and/or

Telegram control channel for authorized administrators.



Responsibilities: - Explain platform status and operational metrics. -

Investigate system errors using authorized observability tools. -

Coordinate internal agents and approved operational workflows. - Manage

CMS content and versioned UI configuration within permissions. - Inspect

GitHub repository and propose code changes. - Create feature branches

and pull requests. - Run tests and report CI results. - Propose database

migrations through version-controlled migration files. - Prepare staging

deployment and production deployment requests. - Monitor health checks

and assist with rollback procedures.



\*\*It must not\*\* directly and silently rewrite production source files,

run arbitrary destructive SQL, alter production schema without a

reviewed migration, bypass code review, or deploy unapproved changes.



\### 4.2 Specialist backend agents



The original blueprint specifies six specialist agents. Preserve these

functional responsibilities:



&#x20; -------------------------------------------------------------------------

&#x20; Agent                   Responsibility            Guardrail

&#x20; ----------------------- ------------------------- -----------------------

&#x20; A1 Intake               Onboarding, profile,      Ask only for necessary

&#x20;                         intent and data           information; validate

&#x20;                         collection                inputs



&#x20; A2 Consultant           Country/service/package   Use approved policy and

&#x20;                         guidance and cost         pricing sources; no

&#x20;                         explanation               guarantees



&#x20; A3 Policy \& Eligibility Eligibility analysis,     Show sources, effective

&#x20;                         risk flags, checklists    dates and uncertainty;

&#x20;                         and policy interpretation human review for edge

&#x20;                                                   cases



&#x20; A4 Preparation          Forms, document sets,     Draft/prepare only;

&#x20;                         letters and appointment   approval before

&#x20;                         preparation               external submission



&#x20; A5 Verification         OCR, extraction,          Suggestions only; human

&#x20; Assistant               cross-document matching   verifier

&#x20;                         and missing-data          approves/rejects

&#x20;                         detection                 



&#x20; A6 Follow-up            Reminders, case updates,  Respect channel

&#x20;                         SLA monitoring and        consent, quiet hours

&#x20;                         escalation                and communication rules

&#x20; -------------------------------------------------------------------------



Other specialist capabilities can be implemented as bounded tools or

later agents: - Partner discovery and routing. - Travel booking

coordination. - Business registration coordination. -

Translation/notary/courier order coordination. - Finance reconciliation

assistant. - Knowledge-base retrieval. - Browser execution agent. -

Quality assurance/evaluation agent.



Do not create a separate autonomous agent for every small task. Start

with six specialist domains plus controlled tools and split further only

when ownership, evaluation or scaling justifies it.



\### 4.3 Agent execution contract



Every agent run must have: - `run\_id`, `task\_id`, tenant/client scope

and optional `case\_id`. - Agent name, model/provider and prompt/tool

version. - Explicit allowed tools and permission scope. - Input/output

schema. - Policy pack version and source references when policy is

involved. - Start/end timestamps, token/cost/latency metrics. -

Confidence or uncertainty indicators where meaningful. - Status, retry

count and error details. - Human review requirement and review

outcome. - Audit event references.



Agent outputs are untrusted until validated. Use schema validation,

policy checks, source checks and task-specific acceptance conditions

before marking work complete.



\------------------------------------------------------------------------



\## 5. Workflow, Task and Progress Engine



\### 5.1 One task lifecycle



Every request that requires work should become a durable task or

workflow instance. Suggested statuses:



`DRAFT â†’ QUEUED â†’ RUNNING â†’ WAITING\_FOR\_CLIENT / WAITING\_FOR\_PARTNER / WAITING\_FOR\_HUMAN / BLOCKED â†’ VALIDATING â†’ COMPLETED`



Terminal alternatives: `FAILED`, `CANCELLED`, `EXPIRED`.



Do not allow arbitrary direct status changes. Use explicit

commands/events and validate allowed state transitions.



\### 5.2 Task record



A task should capture: - Unique task ID. - Tenant and client. - Related

case/order/invoice where applicable. - Request summary and structured

intent. - Workflow definition/version. - Current status and stage. -

Assigned main agent and specialist agent. - Current owner (agent, staff

member, client or partner). - Completed steps and pending steps. -

Blockers and required information. - Human approval gates. - SLA/due

date and retry policy. - Client-visible progress messages. - Internal

operational notes (not client-visible). - Evidence/proof and final

output. - Created/updated/completed timestamps.



\### 5.3 Progress update rules



Client-facing progress should communicate: - What is being worked on. -

What has been completed. - What is waiting and from whom. - What the

client needs to provide. - The next expected step. - An ETA only when

supported by reliable operational data.



Do not expose internal prompts, credentials, staff-only notes, risk

scoring details that should remain internal, or another party's

confidential information.



A generated response is not task completion. Completion requires all

defined steps, validation, required human approvals and evidence to

pass.



\### 5.4 Workflow registry reconciliation



The original blueprint has inconsistent numbering: the overview

references W1--W26, later pages include W25--W30, and further workflows

W31--W36 appear. Do not carry forward this numbering as-is.



Create a canonical workflow registry with stable machine identifiers,

human-readable names, versions and definitions of done. Initial workflow

domains: 1. Lead capture and intake. 2. Client registration and consent.

3\. Profile completion. 4. Free eligibility assessment. 5.

Service/package selection. 6. Quote and invoice generation. 7. Payment

initiation and confirmation. 8. Case creation and assignment. 9.

Document checklist generation. 10. Secure document upload and malware

scanning. 11. OCR and extraction. 12. Human document verification. 13.

Missing-information request. 14. Preparation and consistency validation.

15\. Human approval gate. 16. Appointment preparation/booking where

permitted. 17. Submission coordination and proof capture. 18. External

status monitoring where available. 19. Decision/result recording. 20.

Travel service request and booking. 21. Translation/notary/courier

service order. 22. Business registration partner workflow. 23. Partner

assignment and SLA monitoring. 24. Client progress notifications. 25.

Human support handover. 26. Case closure and post-service follow-up. 27.

Refund/complaint workflow. 28. Data access/correction/deletion request.

29\. Browser session lifecycle. 30. Client information request/response

during browser execution. 31. Human takeover and session recovery. 32.

GitHub code-change workflow for Super Main Agent. 33. CMS/UI

configuration publishing workflow. 34. Country policy review and

approval. 35. Partner due-diligence and renewal. 36. Audit, retention

and compliance review.



This is a proposed normalized registry, not a claim that the original

PDF already contained these exact 36 definitions. Each workflow must be

specified and tested before production use.



\------------------------------------------------------------------------



\## 6. Case, Document, Order and Finance Lifecycles



\### 6.1 Separate business objects



Keep separate lifecycles for: - Visa/business-migration case. - Travel

request and travel booking. - Translation/notary/courier/medical service

order. - Package booking. - Invoice. - Payment. - Refund. - Partner

assignment.



Closing a case must not delete or automatically close unrelated travel

orders, invoices or payment records.



\### 6.2 Case lifecycle



Use a controlled state machine. Example states: `LEAD`, `INTAKE`,

`ELIGIBILITY\_REVIEW`, `QUOTED`, `AWAITING\_PAYMENT`, `ONBOARDING`,

`DOCUMENT\_COLLECTION`, `DOCUMENT\_REVIEW`, `PREPARATION`,

`READY\_FOR\_APPROVAL`, `SUBMISSION\_COORDINATION`, `SUBMITTED`,

`DECISION\_RECEIVED`, `POST\_SERVICE`, `CLOSED`, `MANUAL\_REVIEW`,

`CANCELLED`.



Final state definitions and transitions must be reviewed against the

original state tables before implementation.



\### 6.3 Document lifecycle



Example:

`REQUIRED â†’ UPLOADED â†’ PROCESSING â†’ PENDING\_REVIEW â†’ VERIFIED / REJECTED â†’ EXPIRED`



Malware-positive files move to `QUARANTINED`; never allow download or

agent processing until safely handled. Replacements must preserve

version history. OCR extraction must not silently overwrite user-entered

verified data.



Document pipeline: 1. Upload to private object storage. 2. Validate file

type, size and MIME signature. 3. Malware scan. 4. Quarantine suspicious

files. 5. OCR/extract into a structured draft. 6. Match against expected

document type and case requirements. 7. Flag missing, inconsistent or

expired information. 8. Human verifier reviews and approves/rejects. 9.

Record reviewer, timestamp, reason and document version.



\### 6.4 Finance principles



\-   Separate VisaHobe service fees, government/embassy fees, partner

&#x20;   fees and supplier charges.

\-   Clearly identify who receives each amount.

\-   Use immutable payment events and idempotency keys.

\-   Support payment gateway adapters.

\-   Reconcile gateway settlement against invoices and ledger entries.

\-   Require authorization for refunds and financial adjustments.

\-   Keep a complete audit trail.

\-   Do not present estimates as confirmed fees.

\-   Do not let agents issue refunds or change prices without explicit

&#x20;   permission and approval.



\------------------------------------------------------------------------



\## 7. Country Policy and Knowledge System



\### 7.1 Versioned country policy packs



Country-specific policy data must be versioned, reviewed and

effective-dated. A policy pack may include: - Country and service

line. - Visa/business-registration category. - Eligibility rules. -

Document requirements. - Timeline estimates and dependencies. - Official

government fees and third-party fees. - Appointment rules and booking

policy. - Process chains and partner requirements. - Restrictions,

caveats and legal gates. - Official/secondary source references. -

Effective date and expiry date. - Last verified date. - Created by,

reviewed by, approved by. - Change history and rollback capability.



\### 7.2 Source hierarchy



Prefer: 1. Official government or regulator source. 2. Embassy/high

commission/official visa centre. 3. Licensed/contracted partner's

written current policy. 4. Reputable legal/professional secondary

source. 5. General web content only as leads requiring verification.



Store source URL, source type, publication/effective dates, last

checked, verification status, reviewer and notes.



\### 7.3 Initial country coverage



The Business Visa Roadmap includes: - Serbia. - Georgia. - UAE. -

Turkey. - Singapore.



The source roadmap compares company formation, business/visitor visa

routes, work/residence permissions, banking, tax and partner options. It

is a research starting point, not a legally authoritative live policy

database. Every operational rule, fee, processing time, partner claim

and legal requirement must be rechecked against official sources and

qualified local professionals before activation.



Do not silently assume that a company registration automatically grants

a visa, residence permit, work authorization or right to employ foreign

nationals.



\### 7.4 Policy safety



\-   No "100% visa guarantee" language.

\-   Separate VisaHobe service fee from government fee.

\-   Display policy version and last verified date.

\-   If a source is stale or conflicting, mark the answer

&#x20;   `NEEDS\_VERIFICATION`.

\-   High-risk, unusual or ambiguous cases go to human review.

\-   AI cannot approve a visa or make a government decision.



\------------------------------------------------------------------------



\## 8. Partner Network and External Agency Integration



\### 8.1 Partner categories



Potential partner classes: - Visa/document processing partners. -

Business formation and corporate service providers. - Local legal and

immigration professionals. - Translation, notary, attestation and

courier providers. - Travel agencies, airlines, hotels and insurers. -

Recruitment/employment partners where lawfully licensed.



\### 8.2 Partner onboarding and due diligence



Before activation, collect and verify: - Legal name and registration. -

License number/type and validity where required. - Authorized services

and territory. - Beneficial ownership/contact details as appropriate. -

Contract, SLA, service scope and fee schedule. - Data-sharing agreement

and confidentiality terms. - Security and incident contact. - References

and performance evidence. - Complaint and dispute process. -

Renewal/reverification date.



Partner names in the Business Visa Roadmap are research candidates only.

Do not present them as contracted, approved or integrated partners until

due diligence and contract approval are complete.



\### 8.3 Partner routing



Routing should consider: - Country and service capability. -

License/authorization status. - Current availability and capacity. -

Price and currency. - SLA and historical performance. - Client

preference and consent. - Conflict-of-interest rules. - Data-sharing

permission.



Use manual review until enough verified partner performance data exists.



\### 8.4 Integration adapters



Support different integration modes: 1. Official partner API. 2. Secure

file exchange or partner portal integration. 3. Approved browser

automation for a specific portal. 4. Human-assisted manual processing.



Never assume every agency provides an API or permits automation.



\------------------------------------------------------------------------



\## 9. Browser Automation \& Remote Session Core



This is an additional product requirement beyond the original PDF. It is

a first-class subsystem, not merely a video preview.



\### 9.1 Main capabilities



\-   Create an isolated browser session linked to a task/case and

&#x20;   partner.

\-   Open only approved domains and portals.

\-   Execute approved browser actions using a browser agent runtime.

\-   Stream a live view to authorized Super Admin users.

\-   Allow Super Admin to grant a specific client read-only visibility.

\-   Capture screenshots and action/event history.

\-   Ask the client for missing information with a relevant screenshot

&#x20;   and explanation.

\-   Receive and validate client response.

\-   Continue the approved workflow.

\-   Pause, stop or hand over the session to a human.

\-   Record a tamper-evident audit trail.



\### 9.2 Example flow: Singapore business registration



1\.  Client asks the Client Main Agent to coordinate Singapore company

&#x20;   registration or business-visitor support.

2\.  Agent creates a task and identifies the requested service.

3\.  Policy/eligibility agent checks approved policy sources and flags

&#x20;   missing information.

4\.  Partner routing selects only a verified, active partner with the

&#x20;   relevant service capability.

5\.  Human approval is obtained where required by the service policy.

6\.  Browser Session Manager creates an isolated session for the approved

&#x20;   partner portal.

7\.  Browser Agent Runtime performs permitted steps.

8\.  Super Admin can monitor the session live.

9\.  If client visibility is approved, the client sees a read-only live

&#x20;   viewer for that session only.

10\. If required information is missing, the agent pauses at the relevant

&#x20;   step, captures a redacted screenshot and creates a

&#x20;   `client\_information\_request`.

11\. Client receives the screenshot, field description, reason and secure

&#x20;   response form.

12\. Response is validated and attached to the task.

13\. Agent resumes only after required checks.

14\. Submission or legally significant action pauses for the required

&#x20;   human approval.

15\. Proof/reference is captured, validated and attached to the case.

16\. Task is marked complete only after workflow acceptance conditions

&#x20;   pass.



\### 9.3 Browser subsystem components



\-   Browser Session Manager.

\-   Browser Agent Runtime.

\-   Isolated browser/container pool.

\-   Approved-domain and action policy engine.

\-   Live Stream Gateway.

\-   Screenshot Capture Service.

\-   Activity Event Recorder.

\-   Client Permission Manager.

\-   Human Takeover Controller.

\-   Session recording/retention manager.

\-   Secure Credential Vault.

\-   Portal adapter registry.

\-   Browser session health/recovery worker.



\### 9.4 Browser session roles



\-   Super Admin: observe all authorized platform sessions; pause/stop;

&#x20;   take over subject to permission.

\-   Case manager/browser operator: observe/manage assigned sessions

&#x20;   only.

\-   Client: read-only view of a specific session when explicitly

&#x20;   granted.

\-   Partner: only the partner's own permitted portal interactions or

&#x20;   submitted records; no access to other partner sessions.



Human takeover must pause automation to prevent concurrent conflicting

actions. On release, require an explicit resume decision and revalidate

page state.



\### 9.5 Security and operational boundaries



\-   Use isolated browser containers and short-lived session credentials.

\-   Credentials belong in an encrypted vault, not prompts, chat logs or

&#x20;   general agent memory.

\-   Use domain allowlists and action allowlists.

\-   Redact passwords, tokens, passport numbers, bank data and other PII

&#x20;   from screenshots and streams when not required.

\-   Never expose credentials to clients.

\-   Never expose one client's screenshot/session to another client.

\-   CAPTCHA, MFA, identity checks and anti-bot controls must not be

&#x20;   bypassed. Pause and request authorized human intervention.

\-   Respect partner portal terms, client consent and applicable law.

\-   Do not automate payment, contract acceptance, legal declarations or

&#x20;   final submission without explicit authorization and required human

&#x20;   approval.

\-   Record actor, action, timestamp, URL/domain, task ID, screenshot

&#x20;   reference, result and approval.

\-   Define recording retention and access policy before enabling

&#x20;   recording by default.



\### 9.6 Suggested data entities



\-   `browser\_sessions`

\-   `browser\_session\_permissions`

\-   `browser\_session\_events`

\-   `browser\_screenshots`

\-   `browser\_recordings`

\-   `browser\_agent\_actions`

\-   `browser\_human\_takeovers`

\-   `external\_agency\_accounts`

\-   `external\_agency\_portals`

\-   `portal\_adapters`

\-   `client\_information\_requests`

\-   `client\_information\_responses`

\-   `credential\_vault\_references`



These are logical entities; final schema names and relationships must be

normalized during database design.



\------------------------------------------------------------------------



\## 10. Communication Core



\### 10.1 Channel model



One logical conversation thread should be usable across: - Client

Dashboard chat. - WhatsApp. - Telegram. - Email for formal notices and

longer documents.



Use a channel adapter, message normalizer, shared thread/conversation

service and channel-specific formatter.



\### 10.2 Channel requirements



\-   Verify ownership of connected WhatsApp/Telegram accounts.

\-   Store channel connection status and consent.

\-   Respect WhatsApp business messaging windows and approved templates.

\-   Support Telegram bot commands and secure account linking.

\-   Do not assume that WhatsApp Business coexistence or any specific

&#x20;   Meta capability is available in every country/account; validate

&#x20;   current provider eligibility and API status before rollout.

\-   Keep sensitive documents in the secure dashboard whenever possible;

&#x20;   explain that third-party messaging platforms process messages/files

&#x20;   under their own terms.

\-   Provide message delivery status and retry handling.

\-   Maintain a consistent conversation/task reference across channels.



\### 10.3 Human handover



Client can request a human. The system should: - Pause relevant

autonomous conversation/actions. - Create a support task. - Route to an

available authorized staff member. - Preserve conversation context and

relevant case summary. - Notify the client of handover status. - Resume

AI assistance only when explicitly appropriate.



\------------------------------------------------------------------------



\## 11. Super Main Agent: GitHub and Platform Engineering



\### 11.1 Controlled code workflow



1\.  Receive a software change request.

2\.  Classify it as content, UI configuration, application code, database

&#x20;   schema or infrastructure.

3\.  Inspect repository and relevant docs.

4\.  Create a feature branch.

5\.  Implement bounded changes.

6\.  Run lint, type checks, unit tests, integration tests and security

&#x20;   checks as relevant.

7\.  Produce a change summary and risk assessment.

8\.  Create a Pull Request.

9\.  Wait for required human review/approval.

10\. Merge through protected branch rules.

11\. Deploy to staging.

12\. Run smoke/e2e tests and health checks.

13\. Obtain production approval.

14\. Deploy using CI/CD.

15\. Verify health and monitor.

16\. Roll back if acceptance/health checks fail.



\### 11.2 Change categories



\*\*Content layer\*\* - Service descriptions, FAQs, blog, country content,

SEO metadata. - Use CMS drafts, review and publish workflow.



\*\*UI configuration layer\*\* - Navigation, page sections, feature flags,

widget visibility and supported layout settings. - Use schema-validated,

versioned configuration with preview and rollback.



\*\*Application code layer\*\* - New components, business logic, APIs,

integrations and core UI behavior. - Requires Git branch, PR, tests and

review.



\*\*Database schema layer\*\* - Versioned migration files. - Backup/PITR

readiness. - Staging migration and validation. - Human approval before

production migration. - Rollback or forward-fix plan.



\*\*Infrastructure layer\*\* - Version-controlled IaC/configuration where

practical. - Least-privilege credentials and approval gates.



\### 11.3 CLI and messaging control



\-   CLI commands must be authenticated and permission-scoped.

\-   Destructive actions require explicit confirmation and, where

&#x20;   appropriate, second-person approval.

\-   WhatsApp/Telegram commands must use verified admin identity, strong

&#x20;   linking, step-up authentication and action confirmation.

\-   Sensitive outputs should not be sent to personal messaging channels;

&#x20;   send secure dashboard links instead.

\-   Every command and tool invocation must be logged.



\------------------------------------------------------------------------



\## 12. Data Architecture and Initial Domain Model



\### 12.1 Core domain groups



\*\*Identity and access\*\* - users, organizations/tenants, memberships,

roles, permissions, sessions, MFA, channel identities.



\*\*CRM and client\*\* - leads, applicants, client profiles, contacts,

consents, notes, communication preferences.



\*\*Case management\*\* - cases, case applicants, case stages, case events,

case tasks, assignments, SLA records.



\*\*Policy and knowledge\*\* - countries, service catalogues, country policy

packs, policy versions, official sources, knowledge documents.



\*\*Documents\*\* - document types, requirements, document records,

versions, storage references, OCR extractions, verification reviews.



\*\*Agent and workflow\*\* - workflow definitions/versions, workflow runs,

tasks, task events, agent runs, tool calls, evaluations, approvals.



\*\*Partner\*\* - suppliers/partners, licenses, contracts, capabilities,

service regions, rate cards, assignments, partner proofs, statements.



\*\*Travel and service orders\*\* - travel requests, bookings, itineraries,

service orders, package catalogues and bookings.



\*\*Finance\*\* - fee catalogue, quotes, invoices, invoice lines, payments,

refunds, ledger/reconciliation entries, commissions.



\*\*Communication\*\* - chat threads, messages, attachments, channel links,

notifications, notification preferences, handovers.



\*\*Browser automation\*\* - browser sessions, permissions, events,

screenshots, recordings, actions, takeovers, portal adapters, client

information requests/responses.



\*\*Platform engineering\*\* - repositories, code-change requests, branch/PR

references, CI runs, deployment records, approvals, rollback records.



\*\*Governance\*\* - audit logs, security events, data-subject requests,

retention jobs, subprocessors, policy approvals.



\### 12.2 Data design rules



\-   UUID primary keys for core entities unless a justified exception

&#x20;   exists.

\-   `created\_at`, `updated\_at`, actor attribution and tenant scope where

&#x20;   applicable.

\-   Use foreign keys and explicit constraints.

\-   Use numeric decimal types for money, never floating-point.

\-   Store currency as ISO 4217 code.

\-   Use idempotency keys for payment and external action requests.

\-   Use append-only event/audit records for sensitive lifecycle changes.

\-   Avoid storing duplicate PII in logs and agent traces.

\-   Store files in private object storage; database stores metadata and

&#x20;   references.

\-   Use migrations as the only schema-change mechanism.

\-   Define retention and deletion behavior per data class.



\### 12.3 Original blueprint schema



The original PDF includes detailed SQL/schema examples for applicants,

cases, documents, country packs, official sources, suppliers, travel

requests/bookings, itineraries, service orders, packages, fee catalogue,

invoices, invoice lines, payments, refunds, audit logs, agent runs,

data-subject requests and subprocessors. Treat those as a starting

schema, not as a finalized production schema. Review relationships,

uniqueness, tenant scoping, deletion semantics, indexes and RLS before

migration.



\------------------------------------------------------------------------



\## 13. API, Events and Background Workers



\### 13.1 API groups



\-   Public: countries, services, pricing, lead and eligibility intake.

\-   Client: own profile, cases, documents, tasks, invoices, payments,

&#x20;   chat and notifications.

\-   Admin: cases, clients, approvals, partners, policies, finance,

&#x20;   agents, CMS and browser sessions.

\-   Partner: assigned work, proof uploads, permitted statements and

&#x20;   profile.

\-   Webhooks: payment, WhatsApp, email, courier, partner and other

&#x20;   approved providers.

\-   Engineering: GitHub/CI/deployment status through restricted internal

&#x20;   APIs.



\### 13.2 API rules



\-   Validate every input and output schema.

\-   Use authenticated, permission-checked endpoints.

\-   Enforce tenant isolation server-side and in the database.

\-   Use idempotency for payment, booking and external action endpoints.

\-   Use signed webhook verification and replay protection.

\-   Version APIs and event schemas.

\-   Do not allow arbitrary direct status PATCH for state-machine

&#x20;   entities; use explicit domain commands.

\-   Use consistent error structure with code, message, field errors and

&#x20;   request/correlation ID.

\-   Rate-limit public and sensitive endpoints.



\### 13.3 Event-driven operations



Publish domain events such as: - `LEAD\_CREATED` - `CASE\_CREATED` -

`DOCUMENT\_UPLOADED` - `DOCUMENT\_SCAN\_CLEAN` - `DOCUMENT\_VERIFIED` -

`CLIENT\_INFORMATION\_REQUESTED` - `CLIENT\_INFORMATION\_RECEIVED` -

`HUMAN\_APPROVAL\_REQUIRED` - `HUMAN\_APPROVAL\_GRANTED` -

`PARTNER\_ASSIGNED` - `BROWSER\_SESSION\_STARTED` -

`BROWSER\_ACTION\_COMPLETED` - `BROWSER\_SESSION\_PAUSED` - `TASK\_BLOCKED` -

`TASK\_COMPLETED` - `PAYMENT\_CONFIRMED` - `INVOICE\_ISSUED` -

`POLICY\_VERSION\_APPROVED` - `DEPLOYMENT\_APPROVED`



Use a transactional outbox or equivalent reliable event publication

mechanism.



\### 13.4 Background workers



Initial worker domains: - OCR/document processing. - Malware scan. -

Agent task execution. - Workflow orchestration. - Notification

delivery. - Reminder and follow-up. - SLA monitor/escalation. - Partner

rate/status sync. - Order routing. - Payment reconciliation. -

Commission calculation. - Browser session health and cleanup. -

Audit/PII access review. - Retention purge. - Backup verification. -

Quality sampling and agent evaluation.



\------------------------------------------------------------------------



\## 14. Recommended Technical Architecture



\### 14.1 Architecture style



Start with a \*\*Modular Monolith + independent workers + agent

orchestration runtime\*\*, not a fleet of microservices. Keep clear module

boundaries and stable internal contracts so high-load or independently

scaling modules can later be extracted.



\### 14.2 Suggested stack baseline



&#x20; -----------------------------------------------------------------------

&#x20; Layer                   Initial recommendation  Notes

&#x20; ----------------------- ----------------------- -----------------------

&#x20; Web applications        Next.js, React,         Public, client and

&#x20;                         TypeScript              admin apps; shared

&#x20;                                                 component system



&#x20; UI                      Tailwind CSS +          Accessible, responsive,

&#x20;                         shadcn/ui or equivalent consistent tokens



&#x20; Backend API             Node.js/TypeScript      Choose one primary

&#x20;                         modular API             backend language

&#x20;                                                 initially



&#x20; Database                PostgreSQL              RLS, constraints,

&#x20;                                                 transactions, JSONB

&#x20;                                                 where justified



&#x20; ORM/migrations          Prisma or equivalent    One migration owner and

&#x20;                                                 reviewed migrations



&#x20; Authentication          Supabase Auth or        MFA, RBAC, secure

&#x20;                         equivalent              session management



&#x20; Background jobs         pg-boss or equivalent   Durable retries,

&#x20;                                                 idempotency,

&#x20;                                                 dead-letter handling



&#x20; File storage            S3-compatible private   Signed URLs,

&#x20;                         object storage /        encryption, lifecycle

&#x20;                         Cloudflare R2           rules



&#x20; Agent orchestration     LangGraph or a          Human-in-the-loop,

&#x20;                         similarly durable       resumable workflows

&#x20;                         stateful orchestration  

&#x20;                         framework               



&#x20; Automation              n8n for suitable        Do not use as the

&#x20;                         integrations only       source of truth for

&#x20;                                                 case state



&#x20; Browser automation      Playwright + isolated   Portal-specific

&#x20;                         Chromium containers     adapters, policy

&#x20;                                                 restrictions



&#x20; Live browser stream     Secure                  Evaluate latency,

&#x20;                         WebRTC/remote-browser   access control and

&#x20;                         streaming gateway       infrastructure



&#x20; Realtime                WebSocket/SSE + event   Task updates, chat,

&#x20;                         infrastructure          browser session events



&#x20; OCR                     Provider-agnostic OCR   Compare accuracy on

&#x20;                         adapter                 Bangla/English

&#x20;                                                 documents



&#x20; LLM                     Provider-agnostic model PII redaction,

&#x20;                         adapter                 versioning, evals, cost

&#x20;                                                 controls



&#x20; Messaging               WhatsApp Business       Verify country/account

&#x20;                         Platform, Telegram Bot  availability

&#x20;                         API, email provider     



&#x20; Payments                Adapter-based local     Provider contracts and

&#x20;                         gateways                reconciliation



&#x20; Observability           Structured logs,        Redact PII; monitor

&#x20;                         Sentry, OpenTelemetry   cost and latency



&#x20; Deployment              CI/CD + managed         Separate staging and

&#x20;                         database + container    production

&#x20;                         workers                 

&#x20; -----------------------------------------------------------------------



The original blueprint mentioned Next.js 15, PostgreSQL 16, Prisma,

Supabase Auth, pg-boss, Cloudflare R2/Supabase Storage,

provider-agnostic LLM/OCR, WhatsApp Cloud API, Telegram, Resend and

Vercel/Railway/Fly.io. These are candidate choices; confirm current

versions, operational fit, cost and data residency before locking them.



\### 14.3 Avoid premature complexity



\-   Do not split every domain into a microservice at launch.

\-   Do not build every country and every partner integration before the

&#x20;   core case lifecycle works.

\-   Do not give agents unrestricted database access.

\-   Do not make n8n the primary state machine.

\-   Do not let browser automation run without isolated sessions and

&#x20;   audit.

\-   Do not introduce a custom self-hosted control plane before the core

&#x20;   product and security model are stable.



\------------------------------------------------------------------------



\## 15. Security, Privacy and Compliance



\### 15.1 Baseline controls



\-   MFA for staff and privileged accounts.

\-   RBAC + scoped permissions + tenant RLS.

\-   Encryption in transit and at rest.

\-   Private file storage and short-lived signed links.

\-   Malware scanning and quarantine.

\-   PII redaction in logs, prompts and analytics.

\-   Secret manager/vault for provider and partner credentials.

\-   Key rotation and least privilege.

\-   Audit trail for access and changes.

\-   Rate limiting, abuse prevention and secure webhook validation.

\-   Regular backups, point-in-time recovery and restore tests.

\-   Vulnerability scanning and dependency updates.

\-   Incident response and access revocation process.

\-   Data-subject access/correction/deletion workflow, subject to lawful

&#x20;   retention requirements.

\-   Vendor/subprocessor inventory and data-processing review.



\### 15.2 AI-specific controls



\-   Retrieval from approved, versioned knowledge sources.

\-   Cite source and policy version for material policy claims.

\-   Never invent government fees, requirements or timelines.

\-   Tool allowlists and strict structured schemas.

\-   Prompt-injection resistance for documents and websites.

\-   Treat web pages, uploaded files and partner content as untrusted

&#x20;   data.

\-   No arbitrary shell, SQL or unrestricted browser tools.

\-   Separate internal notes from client-visible content.

\-   Human approval for high-impact external actions.

\-   Evaluation sets for accuracy, refusal behavior, privacy and tool

&#x20;   permissions.

\-   Model/prompt version tracking and rollback.



\### 15.3 Human approval gates



Human approval is required for at least: - Final document

verification. - High-impact eligibility exceptions. - Submission/filing

or legally significant declarations. - Partner contract approval. -

Refunds and material financial adjustments. - Production deployment. -

Production database migrations. - Sensitive browser actions as defined

by service policy. - Any action where the system's legal authority or

client consent is unclear.



\------------------------------------------------------------------------



\## 16. UI/UX and Design System



The original PDF proposed a dark navy/cyan visual direction. The later

product design decision supersedes it for the current redesign: use a

\*\*white + dark green\*\* theme with a refined iOS Liquid Glass-inspired

interface. Do not retain the earlier cyan accent as the primary brand

color.



Design principles: - Clean, premium, calm and trustworthy. - Liquid

Glass effects used selectively for overlays, panels and contextual

controls; avoid reducing readability. - Strong typography and accessible

contrast. - Responsive layouts for desktop, tablet and mobile. - Clear

hierarchy: current stage, next action, owner and due date. - Every major

component needs normal, loading, empty, error and disabled states. -

Distinguish client-facing progress from internal operational detail. -

Use consistent tokens for color, spacing, radius, shadows, typography

and motion. - Avoid excessive glass blur on dense data tables and

document review screens.



Core reusable components: - Case card and status pipeline. - Task card

and task timeline. - SLA countdown. - Document tile and upload

dropzone. - Verification report and approval bar. - Client information

request card. - Browser live viewer with permission indicator. -

Screenshot/annotation viewer. - Human takeover banner. - Chat and agent

activity cards. - Quote/package comparison. - Order tracker. -

Invoice/payment row. - Partner card and license status. - Policy

source/version panel. - KPI tile, filter bar, empty state, skeleton,

toast, modal, drawer, stepper, checklist, consent block and disclaimer

strip.



\------------------------------------------------------------------------



\## 17. Proposed Repository Structure



``` text

visahobe/

â”œâ”€â”€ apps/

â”‚   â”œâ”€â”€ website/

â”‚   â”œâ”€â”€ client-dashboard/

â”‚   â”œâ”€â”€ super-admin/

â”‚   â””â”€â”€ super-agent-console/

â”œâ”€â”€ services/

â”‚   â”œâ”€â”€ api/

â”‚   â”œâ”€â”€ agent-runtime/

â”‚   â”œâ”€â”€ orchestrator/

â”‚   â””â”€â”€ realtime/

â”œâ”€â”€ packages/

â”‚   â”œâ”€â”€ database/

â”‚   â”œâ”€â”€ auth/

â”‚   â”œâ”€â”€ core/

â”‚   â”œâ”€â”€ agents/

â”‚   â”œâ”€â”€ workflows/

â”‚   â”œâ”€â”€ ui/

â”‚   â”œâ”€â”€ design-system/

â”‚   â”œâ”€â”€ cms/

â”‚   â”œâ”€â”€ integrations/

â”‚   â”œâ”€â”€ browser-automation/

â”‚   â””â”€â”€ shared/

â”œâ”€â”€ workers/

â”‚   â”œâ”€â”€ document-processing/

â”‚   â”œâ”€â”€ task-execution/

â”‚   â”œâ”€â”€ notifications/

â”‚   â”œâ”€â”€ follow-up/

â”‚   â”œâ”€â”€ sla-monitor/

â”‚   â”œâ”€â”€ partner-sync/

â”‚   â”œâ”€â”€ finance-reconciliation/

â”‚   â””â”€â”€ browser-session/

â”œâ”€â”€ self-hosted/

â”‚   â””â”€â”€ super-agent/

â”‚       â”œâ”€â”€ runtime/

â”‚       â”œâ”€â”€ cli/

â”‚       â”œâ”€â”€ github/

â”‚       â”œâ”€â”€ tools/

â”‚       â”œâ”€â”€ security/

â”‚       â””â”€â”€ docker/

â”œâ”€â”€ database/

â”‚   â”œâ”€â”€ migrations/

â”‚   â”œâ”€â”€ seeds/

â”‚   â””â”€â”€ policies/

â”œâ”€â”€ docs/

â”‚   â”œâ”€â”€ architecture/

â”‚   â”œâ”€â”€ database/

â”‚   â”œâ”€â”€ api/

â”‚   â”œâ”€â”€ agents/

â”‚   â”œâ”€â”€ workflows/

â”‚   â”œâ”€â”€ security/

â”‚   â””â”€â”€ runbooks/

â””â”€â”€ tests/

&#x20;   â”œâ”€â”€ unit/

&#x20;   â”œâ”€â”€ integration/

&#x20;   â”œâ”€â”€ e2e/

&#x20;   â”œâ”€â”€ security/

&#x20;   â””â”€â”€ agent-evals/

```



This is a proposed monorepo layout. The actual repository can be

adjusted after the initial architecture and deployment model are

selected.



\------------------------------------------------------------------------



\## 18. Implementation Roadmap



Build in vertical slices with working acceptance criteria. Do not start

by building all agents or all dashboards in parallel.



\### Phase 0 --- Architecture and project foundation



Deliverables: - Confirmed product surfaces and role matrix. - Domain

glossary and architecture decision records. - Monorepo and coding

standards. - CI pipeline, lint/typecheck/test. - Development and staging

environments. - Database migration process. - Authentication, MFA and

tenant isolation baseline. - Logging, monitoring and secret management.



Definition of done: - A user can authenticate in staging. -

Tenant-scoped test proves cross-tenant access is denied. - CI runs on

every pull request. - Database migrations are reproducible.



\### Phase 1 --- Public website and service catalogue



Deliverables: - Public pages and CMS foundation. - Country/service

catalogue. - Pricing and disclaimers. - Lead capture and free intake. -

SEO foundations.



Definition of done: - Visitor can browse services and submit a lead. -

Lead is stored and visible to authorized admin. - CMS changes have

draft/review/publish flow.



\### Phase 2 --- Client workspace and case foundation



Deliverables: - Client dashboard shell. - Profile and consent. - Case

creation and status timeline. - Secure document upload. - Basic

invoices/payment status. - Notifications.



Definition of done: - Client can create/track a case, upload a document

and see status. - Tenant isolation and file access tests pass.



\### Phase 3 --- Workflow and human operations



Deliverables: - Task engine and workflow registry. - Case manager

queues. - Verifier queue and approval gates. -

SLA/reminders/escalation. - Internal and client-visible activity

separation.



Definition of done: - Case can progress through defined stages. - No

protected transition bypasses required approval. - Every task has an

owner, status and event history.



\### Phase 4 --- Main Agent and first specialist agents



Deliverables: - Client Main Agent. - A1 Intake and A2 Consultant

initially. - Approved knowledge retrieval. - Agent tool permission

contract. - Structured agent run logs and evaluation tests.



Definition of done: - Agent answers only from approved sources for

policy-sensitive claims. - Agent can create a task and request missing

information. - It cannot approve or submit protected actions.



\### Phase 5 --- Policy, documents and verification



Deliverables: - Versioned country policy packs. - Official source

registry. - OCR and extraction pipeline. - A3 Policy \& Eligibility. - A4

Preparation and A5 Verification Assistant. - Human review and document

versioning.



Definition of done: - Document upload-to-review pipeline works. - OCR

output is a draft, not automatic verification. - Policy response

includes source/version and uncertainty.



\### Phase 6 --- Communication and follow-up



Deliverables: - Unified conversation/thread model. - Website chat. -

Telegram integration. - WhatsApp integration after account/provider

eligibility verification. - A6 Follow-up. - Human handover.



Definition of done: - Conversation continuity works across enabled

channels. - Consent, delivery status and message audit work. - Human

handover pauses relevant automation.



\### Phase 7 --- Partner and business/travel operations



Deliverables: - Partner onboarding and due diligence. - Partner

assignment and scoped portal/workspace. - Business registration

workflow. - Travel and service-order lifecycle. - Finance reconciliation

and commissions.



Definition of done: - Only approved partners can be assigned. - Partner

sees only assigned work. - Invoice lines clearly separate company,

government and partner amounts.



\### Phase 8 --- Browser Automation and live viewer



Deliverables: - Isolated browser runtime. - Portal adapter registry. -

Browser session manager. - Super Admin live viewer. - Client read-only

permission flow. - Screenshot-based client information request. - Human

pause/takeover/resume. - Audit and retention.



Definition of done: - Test portal session can be monitored securely. -

Client cannot control the browser or see another client's session. -

Sensitive fields are redacted. - MFA/CAPTCHA pauses for human

intervention. - Session actions are auditable.



\### Phase 9 --- Super Main Agent and GitHub engineering



Deliverables: - Super Admin chat and restricted CLI. - GitHub read and

branch/PR workflow. - CI result inspection. - CMS/UI configuration

actions. - Migration proposal workflow. - Staging and production

approval gates. - Deployment health checks and rollback.



Definition of done: - Agent can create a PR and report test results. -

It cannot merge/deploy protected changes without approval. - Production

schema changes only through approved migrations.



\### Phase 10 --- Hardening and controlled launch



Deliverables: - Security review and penetration testing. - Backup

restore exercise. - Load and performance tests. - Agent evaluation and

red-team tests. - Data retention and incident runbooks. - Pilot client

and partner onboarding. - Monitoring, support and rollback readiness.



Definition of done: - Critical security findings resolved. - Operational

support and incident procedures tested. - Pilot workflows meet

acceptance criteria.



\------------------------------------------------------------------------



\## 19. Testing Strategy



\### 19.1 Application tests



\-   Unit tests for domain rules and state transitions.

\-   Integration tests for database, RLS, storage, payments and webhooks.

\-   E2E tests for public intake, client case flow, document upload,

&#x20;   approvals and finance.

\-   Contract tests for partner/provider adapters.

\-   Migration tests against clean and representative databases.



\### 19.2 Security tests



\-   Cross-tenant access attempts.

\-   Privilege escalation.

\-   Signed URL expiry and access control.

\-   Malware quarantine.

\-   PII leakage in logs, prompts and screenshots.

\-   Webhook replay/signature validation.

\-   Browser domain allowlist and session isolation.

\-   Human takeover concurrency.

\-   Secret exposure through agent output.

\-   Production deployment and migration approval bypass.



\### 19.3 Agent evaluations



\-   Policy factuality and citation correctness.

\-   Stale/conflicting source handling.

\-   Correct escalation and refusal.

\-   Tool permission boundary enforcement.

\-   Prompt injection in uploaded documents and websites.

\-   Bangla, English and Banglish understanding.

\-   Progress accuracy and no false completion.

\-   Sensitive-data minimization.

\-   Cost, latency and retry behavior.



\------------------------------------------------------------------------



\## 20. Risks and Decisions That Must Be Closed



\### 20.1 Known source-document inconsistencies



1\.  Original document cover says V2.0 while footer says v3.1.

2\.  Workflow count and numbering conflict.

3\.  Original PDF lists five dashboards while the latest product

&#x20;   direction defines three primary surfaces.

4\.  Original UI design uses navy/cyan; latest design decision is

&#x20;   white/dark green.

5\.  Original technical stack includes multiple possible backend/hosting

&#x20;   approaches; one must be selected.

6\.  Original schema is a starting point and needs normalization,

&#x20;   security and lifecycle review.

7\.  Country roadmap claims and partner references are not proof of

&#x20;   current legal status or contractual relationships.



\### 20.2 Decisions required before production implementation



\-   Confirm business entity/tenant model: one VisaHobe operator with

&#x20;   client tenants, or future multi-agency SaaS where multiple service

&#x20;   providers operate independently.

\-   Confirm whether Partner Portal is a dedicated app or role-based

&#x20;   workspace in Super Admin for MVP.

\-   Confirm first launch countries and first service line.

\-   Confirm initial pilot case volume and staffing/verifier capacity.

\-   Confirm payment providers and refund/reconciliation process.

\-   Confirm hosting region, data residency and backup requirements.

\-   Confirm LLM/OCR providers and whether sensitive data may be sent to

&#x20;   them under approved contracts.

\-   Confirm WhatsApp provider and coexistence eligibility.

\-   Confirm browser streaming technology and retention policy.

\-   Confirm which actions require one-person versus two-person approval.

\-   Confirm legal counsel review for each active country/service.



Do not block all development on every long-term decision. Close the

decisions needed for the next vertical slice, record them in

Architecture Decision Records (ADRs), and avoid hard-coding assumptions.



\------------------------------------------------------------------------



\## 21. Instructions for Antigravity Engineering Agent



This file is the system-level reference. It is not permission to

implement every module immediately.



\### 21.1 Required working method



1\.  Read this entire document before changing code.

2\.  Inspect the existing repository and report its current state.

3\.  Compare existing code with this blueprint; do not overwrite working

&#x20;   features blindly.

4\.  Produce an implementation plan for the next phase only.

5\.  Identify ambiguities and propose ADRs.

6\.  Implement one vertical slice at a time.

7\.  Keep migrations, API contracts and UI components consistent.

8\.  Add tests with every feature.

9\.  Run lint, typecheck, tests and build before reporting completion.

10\. Report changed files, migration IDs, tests run, test results, known

&#x20;   gaps and manual steps.

11\. Never claim a feature works unless it is implemented and verified.

12\. Do not expose secrets, real client data or partner credentials in

&#x20;   source control or logs.



\### 21.2 Agent role separation



Suggested engineering roles: - Architect: architecture, ADRs and

dependency decisions. - Backend engineer: APIs, domain logic, database

and migrations. - Frontend engineer: public/client/admin UI and design

system. - AI engineer: agents, orchestration, retrieval, evaluations and

tool contracts. - Automation engineer: workers, integrations and browser

subsystem. - QA/security engineer: tests, threat modelling and release

checks. - DevOps engineer: CI/CD, environments, secrets, monitoring and

backups.



A single migration owner must coordinate schema changes. Multiple agents

must not edit the same files or shared schema concurrently without

explicit coordination.



\### 21.3 Mandatory reporting format



At the end of each task, report: - Objective. - What was implemented. -

Files changed. - Database migrations. - API/events changed. - Tests

executed and results. - Security/permission implications. - Screenshots

or preview links where relevant. - Remaining blockers. - Exact next

recommended task.



\### 21.4 First Antigravity task



Do not begin with the entire application. First: 1. Inspect the

repository and runtime. 2. Produce a repository audit. 3. Create

`docs/architecture/` and store this blueprint there. 4. Create ADRs for

product surfaces, tenant model, backend stack, agent orchestration,

deployment and browser runtime. 5. Propose Phase 0 implementation

tickets and acceptance criteria. 6. Wait for human approval before major

code generation or destructive changes.



\------------------------------------------------------------------------



\## 22. Source and Interpretation Notes



This master document is a consolidated implementation specification

based on: - \*\*VisaHobe Full Blueprint v3.1\*\* (document cover says V2.0;

footer says v3.1; dated 10 Nov 2026). - \*\*Business Visa Roadmap\*\* (dated

11 Nov 2026). - Additional product requirements defined after those

documents: Client Main Agent, Super Main Agent, three primary product

surfaces, live browser execution/monitoring, client-specific read-only

browser visibility, screenshot-based information requests, human

takeover, and GitHub-controlled software changes.



Where this document proposes a normalized structure or additional

subsystem not explicitly specified in the PDFs, it is marked as a

proposed design or additional requirement. Country information, provider

availability, legal interpretations, fees and partner status must be

verified independently before production use.



\*\*End of Master System Blueprint.\*\*

