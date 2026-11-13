# GitHub Branch Protection & Promotion Policy Runbook

**Document:** GitHub Branch Protection Manual Configuration Guide  
**Applies To:** `main`, `staging`, and production release branches  
**Author:** Antigravity Engineering Agent  
**Last Updated:** 13 November 2026 (Phase 0 — TICKET-P0-003)

---

## 1. Overview and Purpose

In accordance with **ADR-007 (Deployment Model, CI/CD, and Controlled Engineering Workflow)** and **CONTRIBUTING.md**, direct code pushes to the `main` branch are strictly prohibited. All modifications must arrive via a dedicated feature branch (`feature/ticket-...`), pass continuous integration checks on an ephemeral PostgreSQL 16 environment, and receive mandatory human peer review before merging.

This runbook provides the exact settings path and step-by-step instructions for the platform owner to configure branch protection rules in GitHub.

---

## 2. GitHub Branch Protection Settings Guide

### Navigation Path

1. Navigate to the GitHub repository: `https://github.com/shakilhossainshahin/visahobe_platform`
2. Click **Settings** (top navigation tab).
3. In the left sidebar, under **Code and automation**, click **Branches**.
4. Under **Branch protection rules**, click **Add branch ruleset** (or **Add branch protection rule**).

---

## 3. Configuration for `main` Branch

Set the following parameters exactly as specified below:

| Setting Field                                                        | Required Value                           | Rationale                                           |
| -------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| **Branch name pattern**                                              | `main`                                   | Protects the production baseline branch.            |
| **Require a pull request before merging**                            | **Checked (Enabled)**                    | Prohibits direct pushes to `main`.                  |
| **Require approvals**                                                | **1** (Minimum 1 review)                 | Enforces human peer review on all code.             |
| **Dismiss stale pull request approvals when new commits are pushed** | **Checked (Enabled)**                    | Ensures code re-review after new commits.           |
| **Require review from Code Owners**                                  | Optional (Enabled when CODEOWNERS added) | Ensures domain owners review critical packages.     |
| **Require status checks to pass before merging**                     | **Checked (Enabled)**                    | Blocks merge if CI fails.                           |
| **Require branches to be up to date before merging**                 | **Checked (Enabled)**                    | Prevents merge conflicts and baseline drift.        |
| **Status checks that are required**                                  | (See Section 4 below)                    | Enforces all 5 automated CI jobs.                   |
| **Require conversation resolution before merging**                   | **Checked (Enabled)**                    | Ensures all review comments are addressed.          |
| **Require signed commits**                                           | Optional (Recommended)                   | Cryptographic commit verification.                  |
| **Require linear history**                                           | **Checked (Enabled)**                    | Maintains clean Git commit log.                     |
| **Do not allow bypassing the above settings**                        | **Checked (Enabled)**                    | Applies rules to administrators and owners as well. |
| **Allow force pushes**                                               | **Disabled (Unchecked)**                 | Strictly prevents history overwrites.               |
| **Allow deletions**                                                  | **Disabled (Unchecked)**                 | Prevents accidental branch deletion.                |

---

## 4. Required Status Checks Specification

The GitHub Actions workflow (`.github/workflows/ci.yml`) registers the following five parallel jobs. In the **Status checks that are required** search box, select:

1. **`Lint and Format`**
   - Verifies Prettier code style and ESLint rules across all workspace packages.
2. **`TypeScript Typecheck`**
   - Verifies strict `tsc --noEmit` compiler checks across all 30 packages.
3. **`Tests and Monorepo Build`**
   - Executes Vitest unit tests and verifies successful `pnpm build` across all packages.
4. **`PostgreSQL Migration & RLS Check`**
   - Runs on an ephemeral PostgreSQL 16 Alpine container, tests connectivity, migration deploy idempotency, and RLS tenant isolation.
5. **`TruffleHog Secret Scan`**
   - Scans full commit history and diffs for leaked API keys, tokens, or private credentials.

> [!CAUTION]
> **No Pull Request may be merged if ANY of these five status checks fail.** `continue-on-error` is strictly forbidden for all CI jobs.

---

## 5. Configuration for `staging` Branch

When the `staging` environment is provisioned (Phase 0 / Phase 1):

1. Create a second branch protection rule for pattern: `staging`.
2. Apply the same status check requirements as `main`.
3. Require PR before merging into `staging` to validate integrated features before production sign-off.

---

## 6. Deployment Approval Gates

- **Staging Deployments:** Triggered automatically upon merge into `staging`, followed by automated health checks (`/healthz` and `/readyz`).
- **Production Deployments:** Strictly require manual owner sign-off in GitHub Actions Environment Protection Rules (`Settings` -> `Environments` -> `production` -> `Required reviewers`). Autonomous agents are prohibited from deploying to production without human confirmation.
