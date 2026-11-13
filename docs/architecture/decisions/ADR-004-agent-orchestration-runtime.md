# ADR-004: Agent Orchestration Runtime, Tool Contracts, and Human Approval Gates

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Lead Architect, AI Systems Lead  
**Consulted:** Final Architecture Blueprint v2.0 (Sections 1, 4, 11), Master System Blueprint v1.0 (Sections 4, 15)  

---

## 1. Context and Problem Statement

VisaHobe incorporates AI agents as core operational collaborators, including the **Client Main Agent** (client orchestrator), the **Super Main Agent** (internal operations and engineering orchestrator), and six specialist backend agents (A1 Intake, A2 Consultant, A3 Policy & Eligibility, A4 Preparation, A5 Verification Assistant, A6 Follow-up).

Traditional LLM agent implementations that rely on stateless loops or conversational memory fail catastrophically in production:
- Workflows lose state when servers restart or network drops occur.
- Agents hallucinate policy details or make unauthorized commitments (e.g. guaranteeing visa approval or issuing refunds).
- Lack of explicit human approval gates allows autonomous tools to take irreversible external actions.
- Chat messages are wrongly treated as the source of truth for business states.

The platform requires a durable, stateful, auditable agent orchestration framework with strict tool permission boundaries and non-bypassable human approval gates.

---

## 2. Decision Drivers

- **Durable Resumability:** Workflows must be capable of pausing for days (e.g. awaiting client document upload or consular decision) and resuming without losing context.
- **Safety & Non-Agency:** AI is a preparer, researcher, coordinator, and drafter; it must never be the final legal or financial authority.
- **Source-Grounded Policy:** Policy answers must cite versioned official sources and declare uncertainty for conflicting or stale rules.
- **Auditable Tool Contracts:** Every tool execution must be pre-authorized, schema-validated, logged, and attributed to an authenticated actor and tenant.

---

## 3. Decision

VisaHobe adopts **LangGraph (with durable PostgreSQL checkpointers) as the primary Agent Orchestration Runtime**, governed by strict Tool Permission Contracts and Human Approval Gates:

### 3.1 Orchestration Architecture
```
Client / Admin Request
         │
         ▼
[ Orchestrator / LangGraph State Graph ]
         │
         ├── Checkpointer (PostgreSQL Durable State)
         │
         ├── Policy & Permission Evaluator
         │
         ├── Tool Contract Validator (Zod Schema)
         │
         ├── [ HUMAN APPROVAL GATE ] ──(If high-impact action)──► Pauses in WAITING_FOR_HUMAN
         │                                                            │
         │◄───────────────── Approved by Human Staff ─────────────────┘
         │
         ▼
[ Bounded Tool Execution ]
         │
         ▼
[ Structured Output Validation & Audit Logging ]
```

### 3.2 Main Agents and Separation of Duties
1. **Client Main Agent:**
   - Multilingual interaction in Bangla, English, and Banglish.
   - Interprets client intent, links to case/service, creates durable tasks in `packages/workflows`.
   - Delegates tasks to specialist agents (A1 through A6); coordinates updates.
   - **Strict Guardrail:** Cannot approve cases, change prices, issue refunds, or access internal operational notes.

2. **Super Main Agent:**
   - Internal operations and engineering assistant accessible via Super Admin chat, authenticated CLI, and verified admin channels.
   - Inspects system health, investigates error traces, proposes code/migration changes via GitHub PRs.
   - **Strict Guardrail:** Cannot directly push to protected git branches, run raw destructive SQL, or bypass staging verification.

3. **Specialist Agents (A1–A6):**
   - Implemented as specialized LangGraph sub-graphs with minimal, task-specific tool allowlists.
   - Outputs are strictly treated as **draft recommendations** until verified by business validation or human staff.

### 3.3 Mandatory Human Approval Gates
Autonomous execution is strictly prohibited, and the graph pauses (`WAITING_FOR_HUMAN`) for:
- Document verification approval (`document.verify`).
- External visa/consular application submission (`submission.approve`).
- Partner contract or high-impact service assignment (`partner.assign`).
- Invoicing adjustments and payment refunds (`refund.approve`).
- Production database migration and code deployment (`deployment.approve`).
- High-risk browser automation actions (payment, contract signing, legal declaration).

### 3.4 Tool Permission Contract and Audit Schema
Every tool execution requires a formal definition:
```typescript
export interface AgentToolDefinition<TInput, TOutput> {
  name: string;
  version: string;
  description: string;
  requiredPermission: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  isHighImpact: boolean; // Requires Human Approval Gate
  execute: (input: TInput, context: AgentExecutionContext) => Promise<TOutput>;
}
```
Every run records an immutable audit entry in `agent_runs` and `tool_calls` tables containing `run_id`, `task_id`, `tenant_id`, prompt version, model ID, token usage, latency, tool arguments, approval status, and execution output.

---

## 4. Consequences

### Positive
- **Fault-Tolerant Operations:** If an agent step fails or waits on external input, the state is safely persisted in PostgreSQL; workers resume seamlessly from the exact state node.
- **Zero Hallucinated Actions:** Tools execute only with valid schemas and verified user/agent permissions.
- **Complete Accountability:** Every single suggestion, draft, and tool execution is permanently tied to an audit record.

### Negative / Trade-offs
- Graph definition and state serialization in LangGraph require rigorous schema modeling compared to simple ad-hoc LLM scripts.
- Execution latency includes checkpoint persistence overhead for every state transition.

### Mitigations
- Use optimized JSONB serialization and lightweight state checkpoints in PostgreSQL.
- Abstract LangGraph primitives inside `packages/agents` so that business logic remains clean and testable with mock checkpointers.

---

## 5. Compliance and Verification Criteria

- [ ] Automated tests confirm that LangGraph state survives worker process kill and resumes from PostgreSQL checkpoint.
- [ ] Attempting to execute a high-impact tool without an approved human gate record throws `ApprovalRequiredException` and halts the graph.
- [ ] Every agent invocation produces a corresponding record in `agent_runs` and `tool_calls` tables.
