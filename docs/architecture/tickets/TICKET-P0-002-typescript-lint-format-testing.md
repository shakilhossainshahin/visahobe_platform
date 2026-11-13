# TICKET-P0-002: Shared TypeScript, ESLint, Prettier, and Vitest Configuration

**Ticket ID:** TICKET-P0-002  
**Phase:** Phase 0 — Foundation  
**Priority:** P0 (Blocker)  
**Status:** Ready for Implementation  
**Estimated Effort:** 1 Engineering Day  
**Dependencies:** [TICKET-P0-001](./TICKET-P0-001-monorepo-initialization.md)  
**Related ADRs:** [ADR-003](../decisions/ADR-003-backend-stack-and-architecture-style.md)  

---

## 1. Objective

Establish strict type checking, consistent code formatting, architectural boundary linting, and a unified Vitest testing framework across all monorepo packages and applications.

---

## 2. Scope of Work

1. **TypeScript Tooling & Configuration:**
   - Create `tsconfig.base.json` in root with strict compiler options:
     ```json
     {
       "compilerOptions": {
         "target": "ES2022",
         "module": "NodeNext",
         "moduleResolution": "NodeNext",
         "strict": true,
         "noImplicitAny": true,
         "strictNullChecks": true,
         "noUnusedLocals": true,
         "noUnusedParameters": true,
         "exactOptionalPropertyTypes": true,
         "declaration": true,
         "sourceMap": true,
         "skipLibCheck": true
       }
     }
     ```
   - Create `tsconfig.json` in each package/service extending `tsconfig.base.json`.

2. **Linting & Code Formatting:**
   - Configure ESLint (flat config `eslint.config.mjs`) with TypeScript parser and plugins:
     - `@typescript-eslint/eslint-plugin`
     - Import boundary enforcement (disallow importing internal files across packages without using published package exports).
   - Configure `.prettierrc.json` and `.prettierignore` (single quotes, 2 spaces, 100 print width, trailing commas).

3. **Unified Testing Framework (Vitest):**
   - Install `vitest` and `@vitest/coverage-v8`.
   - Create `vitest.workspace.ts` at monorepo root to discover unit and integration tests across `apps/`, `services/`, `packages/`, and `workers/`.
   - Setup a sample passing test in `packages/core` to validate test execution pipeline.

4. **Root NPM Scripts in `package.json`:**
   - `"lint": "turbo run lint"`
   - `"typecheck": "turbo run typecheck"`
   - `"format:check": "prettier --check ."`
   - `"format:write": "prettier --write ."`
   - `"test": "vitest run"`
   - `"test:watch": "vitest"`
   - `"test:coverage": "vitest run --coverage"`

---

## 3. Deliverables

- [ ] `tsconfig.base.json` and package-level `tsconfig.json` configurations.
- [ ] `eslint.config.mjs` with import boundary rules.
- [ ] `.prettierrc.json` and formatting rules.
- [ ] `vitest.workspace.ts` with coverage thresholds.
- [ ] Baseline unit test in `packages/core` confirming Vitest execution.

---

## 4. Acceptance Criteria

1. Running `pnpm typecheck` successfully checks all workspace packages with zero errors.
2. Running `pnpm lint` and `pnpm format:check` passes cleanly across the entire workspace.
3. Running `pnpm test` discovers workspace test suites and exits with code 0.
4. Attempting to introduce a circular or forbidden import between packages triggers an ESLint or TypeScript error.

---

## 5. Verification Commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```
