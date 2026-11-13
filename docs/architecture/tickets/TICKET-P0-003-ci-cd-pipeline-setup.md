# TICKET-P0-003: GitHub Actions CI/CD Pipeline and Branch Protection Rules

**Ticket ID:** TICKET-P0-003  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 1 Engineering Day  
**Dependencies:** [TICKET-P0-001](./TICKET-P0-001-monorepo-initialization.md), [TICKET-P0-002](./TICKET-P0-002-typescript-lint-format-testing.md)  
**Related ADRs:** [ADR-007](../decisions/ADR-007-deployment-ci-cd-engineering-workflow.md)

---

## 1. Objective

Implement an ironclad automated GitHub Actions Continuous Integration (CI) pipeline spinning up an ephemeral PostgreSQL 16 service container to validate migrations, RLS policies, code quality, type checks, unit/integration test suites, monorepo builds, and secret scanning, and document required GitHub branch protection policies.

---

## 2. Scope of Work

1. **Continuous Integration Pipeline (`.github/workflows/ci.yml`):**
   - Trigger on: `push` to `main`, `staging`, and `pull_request` to `main`, `staging`.
   - **PostgreSQL 16 Service Container:**
     - Runs official `postgres:16-alpine` service container with test database `visahobe_test`.
   - **Mandatory Pipeline Steps:**
     1. **Checkout & Setup:** `actions/checkout@v4`, `pnpm/action-setup@v3`, `actions/setup-node@v4` (Node.js 20 LTS with frozen lockfile caching).
     2. **Format & Lint:** `pnpm format:check` and `pnpm lint`.
     3. **Typecheck:** `pnpm typecheck` (`tsc --noEmit` across all workspace packages).
     4. **Database Migration Dry-Run:** `pnpm --filter @visahobe/database db:deploy` against the fresh PostgreSQL service container.
     5. **Migration Replay & Idempotency Check:** Re-runs migration deploy to confirm zero errors when applied to an already-migrated database.
     6. **RLS Policy Isolation Tests:** Executes `vitest run tests/security/tenant-isolation.test.ts` against the migrated database.
     7. **Unit & Integration Tests:** Executes `pnpm test` (Vitest across all packages).
     8. **Monorepo Build:** Executes `pnpm turbo build` ensuring all apps and packages build cleanly without bundling errors.
     9. **Secret & Credential Leak Scan:** Executes `trufflesecurity/trufflehog` scanning the PR commit diff and git history for API keys, passwords, or tokens.

2. **Branch Protection Specification (`docs/security/branch-protection.md`):**
   - Document mandatory GitHub repository settings for protected branches (`main`, `staging`):
     - **Strict PR Requirement:** Direct pushes to `main` or `staging` are disabled. All changes must arrive via Pull Request.
     - **Required Status Checks:** PR merge is blocked unless the following required status checks pass:
       - `CI / Lint and Format`
       - `CI / Typecheck`
       - `CI / Migration Deploy & Idempotency`
       - `CI / RLS Policy Isolation Tests`
       - `CI / Unit and Integration Tests`
       - `CI / Monorepo Build`
       - `CI / Secret Scan`
     - **Human Peer Review Gate:** Minimum of 1 authorized human engineering review approval required; self-approvals blocked.
     - **Up-to-Date Branches:** Branch must be up to date with target branch before merging.
     - **Linear History & No Force Pushes:** Force pushes and branch deletions are strictly disabled.

3. **Staging Continuous Deployment Workflow (`.github/workflows/deploy-staging.yml`):**
   - Trigger on merge to `staging` branch.
   - Executes deployment automation and post-deploy health check stubs.

---

## 3. Deliverables

- [ ] `.github/workflows/ci.yml` with PostgreSQL 16 service container and full check matrix.
- [ ] `.github/workflows/deploy-staging.yml` staging deployment workflow.
- [ ] `docs/security/branch-protection.md` branch protection policy documentation.

---

## 4. Acceptance Criteria

1. Every pull request targeting `main` or `staging` executes the full CI matrix against an ephemeral PostgreSQL 16 service container.
2. The CI pipeline fails immediately if:
   - Any migration fails or is non-idempotent.
   - Any RLS policy isolation test fails.
   - Any TypeScript compiler error or lint error occurs.
   - Any unit or integration test fails.
   - Any application build fails.
   - Any hardcoded secret, token, or unredacted credential is detected in the diff.
3. No PR merge is permitted unless all 7 mandatory status checks pass.

---

## 5. Verification Commands

```bash
# Local simulation of complete CI pipeline
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @visahobe/database db:deploy
pnpm test
pnpm exec vitest run tests/security/tenant-isolation.test.ts
pnpm turbo build
```
