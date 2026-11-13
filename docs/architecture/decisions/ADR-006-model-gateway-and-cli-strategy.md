# ADR-006: Model Gateway and Super Admin CLI Model Strategy

**Status:** Accepted  
**Date:** 13 November 2026  
**Deciders:** Lead Architect, AI Systems Lead, Security Lead  
**Consulted:** Final Architecture Blueprint v2.0 (Sections 1, 4.2, 5), Master System Blueprint v1.0 (Section 4, 11)

---

## 1. Context and Problem Statement

AI operations platforms that hardcode a single LLM provider face severe operational hazards:

- Service outages or rate-limit exhaustion at a single provider immediately paralyze the entire business.
- Inability to route tasks to cost-effective models for simple tasks versus high-reasoning models for complex tasks leads to runaway operational costs.
- Technical engineers operating the **Super Main Agent CLI** need the ability to select specific models suited for complex coding, architectural audits, or fast refactoring.
- Future data residency or privacy regulations may require routing sensitive cases to local, self-hosted models (e.g. via Ollama or private VPC endpoints).

The platform requires a centralized, provider-agnostic Model Gateway and a structured model registry with configurable selection for the Super Admin CLI and backend agents.

---

## 2. Decision Drivers

- **Zero Provider Lock-In:** Dynamic switching between Anthropic (Claude), Google (Gemini), OpenAI, OpenRouter, and self-hosted models (Ollama).
- **Task-Based Routing & Cost Efficiency:** Routing tasks to the optimal model class based on task capability requirements (reasoning, coding, vision, latency, cost).
- **CLI Model Selection:** Super Admin CLI users must be able to specify the execution model per task invocation while respecting authorization gates.
- **Observability & Guardrails:** Centralized tracking of token counts, latency, cost metrics, prompt versioning, and rate limiting across all providers.

---

## 3. Decision

VisaHobe establishes a **Provider-Agnostic Model Gateway and Configurable Model Registry**, integrated into the Super Admin CLI and agent execution pipeline:

### 3.1 Model Gateway Architecture

```
Agent / CLI Execution Request
  ├── Requested Model (e.g. claude-sonnet, gemini-flash, ollama-qwen)
  ├── Task Capability Requirements (e.g. [coding, vision, json_schema])
  │
  ▼
[ VisaHobe Model Gateway (packages/core/model-gateway) ]
  ├── 1. Registry & Capability Validator
  ├── 2. Authorization & Budget Check
  ├── 3. PII Redaction Filter
  ├── 4. Provider Adapter Dispatch:
  │     ├── Anthropic Adapter (Claude 3.5/3.7 Sonnet, Haiku)
  │     ├── Google GenAI Adapter (Gemini 2.0/3.8 Flash, Pro)
  │     ├── OpenAI / Compatible Adapter (GPT-4o, DeepSeek, Groq)
  │     └── Self-Hosted / Ollama Adapter (Local open-weight models)
  ├── 5. Response Schema Validator (Zod)
  └── 6. Cost, Token & Latency Metering (Emits AGENT_RUN_METRIC)
```

### 3.2 Model Registry Schema

Every approved model is cataloged in `packages/core/model-registry.json`:

```json
{
  "models": [
    {
      "modelId": "claude-3-7-sonnet",
      "provider": "anthropic",
      "displayName": "Claude 3.7 Sonnet",
      "capabilities": ["reasoning", "coding", "vision", "long_context"],
      "allowedTasks": ["architecture", "code_generation", "browser_agent", "complex_policy"],
      "costTier": "high",
      "maxOutputTokens": 8192,
      "requiresApproval": false
    },
    {
      "modelId": "gemini-2-flash",
      "provider": "google",
      "displayName": "Gemini 2.0 Flash",
      "capabilities": ["vision", "fast_reasoning", "multilingual"],
      "allowedTasks": ["intake_chat", "browser_vision", "document_ocr_check", "routine_support"],
      "costTier": "low",
      "maxOutputTokens": 8192,
      "requiresApproval": false
    },
    {
      "modelId": "ollama-qwen-coder-32b",
      "provider": "ollama",
      "displayName": "Qwen 2.5 Coder 32B (Self-Hosted)",
      "capabilities": ["coding", "air_gapped"],
      "allowedTasks": ["local_code_edits", "sensitive_file_analysis"],
      "costTier": "local_compute",
      "maxOutputTokens": 16384,
      "requiresApproval": true
    }
  ]
}
```

### 3.3 Task Routing Matrix

| Task Domain                                | Primary Model Class                                          | Fallback Model Class      | Rationale                                                       |
| ------------------------------------------ | ------------------------------------------------------------ | ------------------------- | --------------------------------------------------------------- |
| **Architecture & Complex Coding**          | High-Reasoning Coding Model (Claude 3.7 Sonnet / Gemini Pro) | OpenAI o3-mini            | Precision in complex multi-file changes and deep refactoring.   |
| **Routine Code Edits & Test Writing**      | Fast Coding Model (Claude 3.5 Haiku / DeepSeek Coder)        | Gemini Flash              | High throughput and minimal token cost.                         |
| **Policy & Eligibility Analysis**          | Grounded High-Fidelity Model with Strict Retrieval           | High-Fidelity Alternative | Minimizes hallucination in legal/visa policy evaluation.        |
| **Document Extraction & OCR Verification** | Multimodal Vision + Structured JSON Extraction               | Provider-agnostic OCR     | Accurate document field extraction and cross-field consistency. |
| **Browser Automation Agent**               | Vision-Capable Fast Agent Model                              | Multimodal Vision Model   | Rapid screen parsing and coordinate extraction.                 |
| **Client Intake & Multilingual Chat**      | Fast Multilingual Model (Bangla/English/Banglish)            | Cost-Efficient Chat Model | Native low-latency conversational response.                     |

### 3.4 Super Admin CLI Execution Policy

The Super Admin CLI (`visahobe`) allows authorized engineers to override or select the execution model via CLI flags:

```bash
# Example Super Admin CLI usage
visahobe agent run \
  --agent engineering \
  --model claude-3-7-sonnet \
  --task "Implement PostgreSQL RLS migration for case_applicants table"
```

The CLI runtime validates:

1. Whether the user has `engineering.agent.run` permission.
2. Whether the requested model is registered and enabled.
3. Whether the task capabilities match the model's registered capabilities.
4. If the selected model or task is flagged `requiresApproval: true`, the CLI requires a confirmation prompt or supervisor sign-off.

---

## 4. Consequences

### Positive

- **Resilience:** If one provider experiences downtime, the Model Gateway automatically routes traffic to the designated fallback model.
- **Budget Control:** Non-reasoning tasks default to low-cost models, dramatically cutting monthly LLM operational expenditures.
- **Developer Freedom with Guardrails:** Engineers can test cutting-edge models via the CLI without modifying production backend code.

### Negative / Trade-offs

- Different providers have minor differences in tool calling formats and JSON schema adherence.
- Prompt templates must be tested across multiple model providers to ensure consistent behavior.

### Mitigations

- Standardize all tool calling and structured output schemas on Zod with runtime validation.
- Implement automated model evaluation suites (`tests/agent-evals/`) to benchmark provider outputs on identical test prompts.

---

## 5. Compliance and Verification Criteria

- [ ] Model Gateway successfully dispatches requests to mock adapters for Anthropic, Google, OpenAI, and Ollama.
- [ ] Invoking an unregistered model ID returns an invalid model error and lists valid alternatives.
- [ ] Attempting to run a vision task on a model lacking the `vision` capability throws a capability mismatch error.
