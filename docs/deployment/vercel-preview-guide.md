# VisaHobe Platform — Vercel Monorepo Deployment Runbook

> **Scope:** Staging, Preview, and Production deployment configuration for the 3 Next.js applications (`apps/website`, `apps/client-dashboard`, `apps/super-admin`) in the `visahobe_platform` monorepo using `pnpm@9.12.3`, `Node.js 20.x`, and `Turborepo`.

---

## 1. Overview & Architecture on Vercel

The VisaHobe platform delivers three distinct customer-facing and operational product surfaces as independent Next.js 15 App Router applications within a unified Turborepo monorepo:

| Application          | Package Name                 | Target Role                                         | Local Port | Vercel Project Name         | Root Directory          |
| :------------------- | :--------------------------- | :-------------------------------------------------- | :--------: | :-------------------------- | :---------------------- |
| **Public Website**   | `@visahobe/website`          | Public acquisition, visa guides, eligibility intake |   `3000`   | `visahobe-website`          | `apps/website`          |
| **Client Dashboard** | `@visahobe/client-dashboard` | Authenticated applicant portal & Document Vault     |   `3001`   | `visahobe-client-dashboard` | `apps/client-dashboard` |
| **Super Admin**      | `@visahobe/super-admin`      | Internal command center, verifier desk & PWA        |   `3002`   | `visahobe-super-admin`      | `apps/super-admin`      |

Each application is linked to a separate Vercel Project while sharing internal workspace libraries (`@visahobe/ui`, `@visahobe/design-system`, `@visahobe/auth`, `@visahobe/cms`, `@visahobe/core`, `@visahobe/shared`).

---

## 2. Vercel Project Configuration Matrix

For each of the 3 Vercel projects, configure the project settings in the Vercel Dashboard under **Settings > General**:

### 2.1 General Settings (All 3 Projects)

- **Framework Preset:** `Next.js`
- **Node.js Version:** `20.x`
- **Package Manager:** `pnpm` (Automatically detected from root `packageManager: "pnpm@9.12.3"`)
- **Include source files outside Root Directory:** **ENABLED (Checked)**  
  _(Crucial for Turborepo: allows resolving shared `@visahobe/*` dependencies from root `/packages`)_

---

### 2.2 Project-Specific Build & Directory Settings

#### Project 1: `visahobe-website` (`apps/website`)

- **Root Directory:** `apps/website`
- **Install Command:** `pnpm install --frozen-lockfile` (defined in `apps/website/vercel.json`)
- **Build Command:** `turbo run build --filter=@visahobe/website...` (defined in `apps/website/vercel.json`)
- **Output Directory:** Automatically managed by Next.js preset (`.next`)

#### Project 2: `visahobe-client-dashboard` (`apps/client-dashboard`)

- **Root Directory:** `apps/client-dashboard`
- **Install Command:** `pnpm install --frozen-lockfile` (defined in `apps/client-dashboard/vercel.json`)
- **Build Command:** `turbo run build --filter=@visahobe/client-dashboard...` (defined in `apps/client-dashboard/vercel.json`)
- **Output Directory:** Automatically managed by Next.js preset (`.next`)

#### Project 3: `visahobe-super-admin` (`apps/super-admin`)

- **Root Directory:** `apps/super-admin`
- **Install Command:** `pnpm install --frozen-lockfile` (defined in `apps/super-admin/vercel.json`)
- **Build Command:** `turbo run build --filter=@visahobe/super-admin...` (defined in `apps/super-admin/vercel.json`)
- **Output Directory:** Automatically managed by Next.js preset (`.next`)

---

## 3. Environment Variables Specification

Configure the following environment variables in the Vercel Dashboard under **Settings > Environment Variables**:

### 3.1 Common Variables (Configure across all 3 apps)

| Variable         | Target Environments | Description                                     | Example / Fallback                                       |
| :--------------- | :------------------ | :---------------------------------------------- | :------------------------------------------------------- |
| `NODE_ENV`       | Production, Preview | Node execution environment                      | `production`                                             |
| `JWT_SECRET`     | Production, Preview | Cryptographic JWT signing secret (min 32 chars) | Safe fallback provided in build if missing in PR preview |
| `DATABASE_URL`   | Production, Preview | PostgreSQL 16 pooled connection string          | `postgresql://...`                                       |
| `STORAGE_SECRET` | Production, Preview | HMAC storage signing key (min 16 chars)         | Safe fallback provided in build if missing in PR preview |
| `SENTRY_DSN`     | Production, Preview | Sentry error monitoring DSN                     | `https://...@ingest.sentry.io/...`                       |

### 3.2 Public Acquisition Site (`visahobe-website`)

| Variable                           | Description                       | Value                                                                    |
| :--------------------------------- | :-------------------------------- | :----------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`              | Canonical URL of public website   | `https://visahobe.com` (Prod) / `https://preview.visahobe.com` (Staging) |
| `NEXT_PUBLIC_CLIENT_DASHBOARD_URL` | Destination link for client login | `https://app.visahobe.com`                                               |
| `NEXT_PUBLIC_API_URL`              | Core REST API gateway             | `https://api.visahobe.com`                                               |

### 3.3 Client Dashboard (`visahobe-client-dashboard`)

| Variable                  | Description                        | Value                        |
| :------------------------ | :--------------------------------- | :--------------------------- |
| `NEXT_PUBLIC_APP_URL`     | Canonical URL of client dashboard  | `https://app.visahobe.com`   |
| `NEXT_PUBLIC_WEBSITE_URL` | Link back to main acquisition site | `https://visahobe.com`       |
| `NEXT_PUBLIC_API_URL`     | Core REST API gateway              | `https://api.visahobe.com`   |
| `S3_ENDPOINT`             | Private object storage endpoint    | `https://vault.visahobe.com` |
| `S3_BUCKET_DOCUMENTS`     | Tenant document bucket             | `visahobe-documents-prod`    |

### 3.4 Super Admin Command Center (`visahobe-super-admin`)

| Variable              | Description                   | Value                        |
| :-------------------- | :---------------------------- | :--------------------------- |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of admin portal | `https://admin.visahobe.com` |
| `NEXT_PUBLIC_API_URL` | Core REST API gateway         | `https://api.visahobe.com`   |
| `SUPABASE_URL`        | Supabase auth server URL      | `https://<ref>.supabase.co`  |
| `SUPABASE_ANON_KEY`   | Public client key             | `<supabase-anon-key>`        |

---

## 4. Turborepo Remote Caching & Ignored Build Steps

### 4.1 Turborepo Remote Caching on Vercel

Because VisaHobe uses Turborepo, Vercel automatically enables Remote Caching:

- Build artifacts for compiled packages (`dist/*.d.ts`, `dist/*.js`) and unchanged Next.js outputs are cached remotely.
- If upstream packages have not changed since the last build, builds complete in seconds rather than minutes.

### 4.2 Ignored Build Step (`npx turbo-ignore`)

To optimize Vercel build minutes and prevent unnecessary rebuilds:

1. Navigate to **Project Settings > Git > Ignored Build Step**.
2. Select **Custom** and enter:
   ```bash
   npx turbo-ignore
   ```
3. `turbo-ignore` automatically analyzes Git commit diffs against the Turborepo dependency graph and cancels the build immediately if the application and none of its upstream dependencies were modified.

---

## 5. Preview Builds & Safe Fallback Secrets

During Pull Request preview builds (e.g., from forks or staging branches without production database credentials attached), `next.config.mjs` in all 3 apps automatically supplies safe fallback secrets for static pre-rendering:

- If `process.env.JWT_SECRET` is unset, a build-only fallback key (`preview_jwt_secret_key_minimum_32_chars_for_build_only`) is applied.
- If `process.env.STORAGE_SECRET` is unset, `preview_storage_secret_16_chars` is applied.
- If `process.env.DATABASE_URL` is unset, a dummy Postgres URL is applied.

This ensures Next.js static page generation (`next build`) completes cleanly during PR verification without triggering fatal environment schema validation failures, while strict runtime validation remains enforced in production environments.
