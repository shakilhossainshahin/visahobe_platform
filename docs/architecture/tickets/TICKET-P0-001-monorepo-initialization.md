# TICKET-P0-001: Monorepo Workspace Initialization and Directory Skeleton

**Ticket ID:** TICKET-P0-001  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 1 Engineering Day  
**Dependencies:** None  
**Related ADRs:** [ADR-001](../decisions/ADR-001-product-surfaces.md), [ADR-003](../decisions/ADR-003-backend-stack-and-architecture-style.md), [ADR-009](../decisions/ADR-009-ui-design-system-and-liquid-glass.md)  

---

## 1. Objective

Initialize the Git repository, scaffold the complete monorepo workspace structure using `pnpm` workspaces and `Turborepo` (configuration-only without installing heavy `node_modules`), establish core contribution, security, and local development standards, and define the minimal design token foundation in `packages/design-system`.

---

## 2. Scope of Work

1. **Git Initialization & Standard Controls:**
   - Run `git init -b main`.
   - Create standard `.gitignore` (ignoring `node_modules`, `.next`, `dist`, `.turbo`, `.env*` except `.env.example`, `coverage`, OS files).
   - Create `.gitattributes` and `.editorconfig` for consistent LF line endings and UTF-8 encoding across Windows and Linux.

2. **Workspace Root Configuration:**
   - Create root `package.json` with `"private": true`, `"packageManager": "pnpm@9.x"`, and baseline build/lint scripts.
   - Create `pnpm-workspace.yaml` defining package locations:
     ```yaml
     packages:
       - 'apps/*'
       - 'services/*'
       - 'packages/*'
       - 'workers/*'
       - 'self-hosted/super-agent/*'
     ```
   - Create `turbo.json` with pipeline definitions for `build`, `lint`, `typecheck`, `test`, `dev`, and `clean`.

3. **Core Governance & Runbook Documents:**
   - `CONTRIBUTING.md`: Branch naming conventions (`feat/`, `fix/`, `chore/`), Conventional Commits specification, GitHub PR template, and the **Single Migration-Owner Rule**.
   - `SECURITY.md`: Vulnerability reporting channels, secret management policy, and PII handling invariants.
   - `.env.example`: Complete template of all required environment variables with documentation and dummy/mock values (zero real secrets).
   - `docs/runbooks/local-development.md`: Step-by-step developer onboarding, Docker setup, correlation ID conventions (`x-correlation-id`), and standard probe endpoints (`/healthz`, `/readyz`).

4. **Directory Skeleton Scaffolding:**
   Create empty package directories with minimal `package.json` and `README.md` manifests:
   ```text
   visahobe/
   ├── apps/
   │   ├── website/
   │   ├── client-dashboard/
   │   └── super-admin/
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
   │       ├── cli/
   │       ├── runtime/
   │       └── tools/
   ├── database/
   │   ├── migrations/
   │   ├── seeds/
   │   └── policies/
   └── tests/
       ├── unit/
       ├── integration/
       ├── e2e/
       ├── security/
       └── agent-evals/
   ```

5. **Minimal Design Token Foundation (`packages/design-system/src/tokens/`):**
   - Implement the foundational design token contract without building the full UI component library:
     - Color Tokens: White base (`#FDFDFD`), surface (`#FFFFFF`), muted (`#F4F6F4`), brand dark-green (`--color-brand-700`: `#0D3B2E`, `--color-brand-900`: `#07211A`, `--color-brand-500`: `#16654F`, `--color-brand-100`: `#E3EFEA`).
     - Semantic Tokens: Success (`#15803D`), warning (`#B45309`), danger (`#B91C1C`), info (`#0369A1`).
     - Typography Scale: Font families (`Inter`, `Plus Jakarta Sans`, `JetBrains Mono`, `Noto Sans Bengali`), font weights, line heights.
     - Spacing, Radius, Shadow, and Motion Tokens.
     - Liquid Glass specification rules and utility classes.

---

## 3. Deliverables

- [ ] Initialized Git repository on branch `main`.
- [ ] Root `.gitignore`, `.gitattributes`, `.editorconfig`.
- [ ] Root `package.json`, `pnpm-workspace.yaml`, and `turbo.json`.
- [ ] `CONTRIBUTING.md` with single migration-owner rule and commit standards.
- [ ] `SECURITY.md` vulnerability disclosure and secret policy.
- [ ] `.env.example` with zero actual secrets.
- [ ] `docs/runbooks/local-development.md` with healthz/readyz and correlation ID conventions.
- [ ] Complete directory skeleton with package manifests.
- [ ] `packages/design-system/src/tokens/index.ts` minimal design token contract.

---

## 4. Acceptance Criteria

1. Running `git status` shows an initialized Git repository with clean untracked file filtering.
2. The monorepo directory tree matches the blueprint structure across `apps/`, `services/`, `packages/`, `workers/`, `self-hosted/`, `database/`, and `tests/`.
3. `CONTRIBUTING.md` explicitly documents the Single Migration-Owner Rule and Conventional Commits.
4. `.env.example` contains all required variables with zero real credentials or keys.
5. `packages/design-system/src/tokens/index.ts` exports the complete White + Dark-Green token contract and Liquid Glass constraints.

---

## 5. Verification Commands

```bash
git status
Get-ChildItem -Path apps, services, packages, workers, self-hosted, database, tests
```
