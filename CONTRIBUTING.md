# VisaHobe — Engineering Contribution Guidelines

Thank you for contributing to VisaHobe. This document outlines our branch naming conventions, commit standards, Pull Request workflow, and the mandatory Single Migration-Owner Rule.

---

## 1. Core Engineering Principles

1. **Defense-in-Depth:** Every sensitive action must be checked at the UI layer, API layer, and database Row-Level Security (RLS) layer.
2. **AI Guardrails:** AI agents (including the Super Main Agent) prepare, research, coordinate, and draft; human staff approve high-impact actions.
3. **No Direct Production Pushes:** All changes must arrive via a feature branch, pass continuous integration, and receive human peer review.
4. **Single Migration-Owner Rule:** Concurrent schema edits are strictly forbidden.

---

## 2. Single Migration-Owner Rule

> [!IMPORTANT]
> **Only one designated migration owner may create or modify `packages/database/prisma/schema.prisma` or migration SQL files at a time.**
> 
> - Concurrent agent or human modifications to schema or migrations will result in immediate rejection of the Pull Request.
> - Every migration must be documented in `database/migrations/MIGRATION_LOG.md` with:
>   * Migration ID / Name
>   * Business Purpose
>   * Rollback / Forward-Fix Plan
>   * Row-Level Security (RLS) Impact
>   * Index & Query Performance Impact
>   * Verification Test Commands

---

## 3. Branch Naming Conventions

All Git branches must use lowercase alphanumeric characters and hyphens, prefixed by category:

| Prefix | Usage | Example |
|---|---|---|
| `feat/` | New platform feature or capability | `feat/p0-database-baseline` |
| `fix/` | Bug fix or issue resolution | `fix/jwt-claims-validation` |
| `chore/` | Tooling, dependencies, or configuration | `chore/update-vitest-config` |
| `docs/` | Architectural or user documentation | `docs/update-adr-005` |
| `refactor/` | Code refactoring without behavior change | `refactor/logger-middleware` |
| `test/` | Adding or updating test suites | `test/tenant-isolation-suite` |

---

## 4. Conventional Commits

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional scope>): <short description in imperative present tense>

[optional body explaining motivation and details]

[optional footer(s), e.g. Closes #123, Ticket: TICKET-P0-001]
```

### Allowed Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, white-space)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or auxiliary tools

### Examples
- `feat(auth): enforce mandatory MFA check on staff role endpoints`
- `fix(database): correct tenant_id foreign key constraint in cases table`
- `docs(adr): update ADR-004 with human approval gate specifications`

---

## 5. Pull Request (PR) Workflow & Template

When submitting a Pull Request, use the standard template below:

```markdown
## Summary of Changes
- Briefly describe the problem and solution.

## Associated Tickets / ADRs
- Closes TICKET-P0-XXX
- Ref: ADR-XXX

## Impact Assessment
- [ ] Database Schema Modified? (If yes, follow Single Migration-Owner Rule)
- [ ] RLS Policies Affected?
- [ ] API or Event Contracts Changed?
- [ ] Security / Permission Implications?

## Verification & Testing Performed
- [ ] `pnpm format:check` passed
- [ ] `pnpm lint` passed
- [ ] `pnpm typecheck` passed
- [ ] `pnpm test` passed
- [ ] Ephemeral PostgreSQL migration verified

## Zero-Secret Confirmation
- [ ] Verified that no passwords, private keys, API tokens, or unredacted PII are present in this commit.
```

---

## 6. Code Style & Tooling

- Format with Prettier before committing: `pnpm format:write`.
- Verify TypeScript types: `pnpm typecheck`.
- Run lint checks: `pnpm lint`.
- Never use `any` unless wrapped in explicit type assertion with documented justification.
