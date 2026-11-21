# VisaHobe Production Cutover, Infrastructure Checklist & Incident Response Runbook

> **Governing Standards:** `ADR-004` (Reproducible Migrations & Kernel RLS), `ADR-007` (Single Migration Owner), `ADR-009` (Flagship UI Standard), `ADR-010` (B2B2C Prepaid Wallet), `ADR-011` (Super AI Agent Autonomy & Consular Review Gates), `ADR-012` (Scoped MCP Servers & B2C Client Shielding).

---

## 1. Production Environment Configuration Checklist

Before initiating production cutover, verify every variable across production secret stores (Vercel Production, Supabase Vault, Docker secrets, GitHub Actions Secrets):

| Service Area                   | Variable Name                | Required Scope                          | Security Constraint                                             |
| :----------------------------- | :--------------------------- | :-------------------------------------- | :-------------------------------------------------------------- |
| **PostgreSQL 16 & Kernel RLS** | `DATABASE_URL`               | Production Pooler (PgBouncer port 6543) | Must connect as `visahobe_app` (`NOSUPERUSER NOBYPASSRLS`)      |
| **Direct Migration DB**        | `DIRECT_URL`                 | Session direct port 5432                | Restricted to authorized migration runner (`visahobe_admin`)    |
| **Session JWT Authentication** | `JWT_SECRET`                 | Next.js Apps, APIs, Workers             | Minimum 64-character high-entropy secret; HS256/EdDSA           |
| **Browser Stream Gateway**     | `STREAM_JWT_SECRET`          | Browser Session Worker, Gateway         | Short-lived stream tokens (15m TTL); separates stream auth      |
| **Pay Station (BDT Gateway)**  | `PAYSTATION_MERCHANT_ID`     | `services/api`, `packages/integrations` | Merchant identifier bound to platform corporate account         |
| **Pay Station Webhook**        | `PAYSTATION_WEBHOOK_SECRET`  | `services/api`                          | HMAC-SHA256 secret for constant-time signature validation       |
| **Stripe International**       | `STRIPE_SECRET_KEY`          | `services/api`, `packages/integrations` | `rk_live_...` restricted API key with charge and refund scope   |
| **Stripe Webhook**             | `STRIPE_WEBHOOK_SECRET`      | `services/api`                          | `whsec_...` endpoint secret for payload verification            |
| **Cloudflare R2 Object Vault** | `STORAGE_ENDPOINT`           | Document Vault, Document Workers        | Private S3-compatible API endpoint                              |
| **Cloudflare R2 Access Key**   | `STORAGE_ACCESS_KEY_ID`      | Storage Services                        | Scoped write/read to tenant-isolated prefixes                   |
| **Cloudflare R2 Secret**       | `STORAGE_SECRET_ACCESS_KEY`  | Storage Services                        | Zero public bucket exposure; presigned URLs <= 15m TTL          |
| **VPS Live Browser Worker**    | `VNC_PASSWORD` / `VNC_TOKEN` | Browser Container Runtime               | **Mandatory:** Zero `-nopw`. Containers reject startup if unset |
| **Sentry Error Tracking**      | `SENTRY_DSN`                 | All production surfaces                 | PII scrubber configured to mask passports, emails, tokens       |

---

## 2. Production Cutover Protocol (Zero Downtime)

### Phase A: Database & Security Invariants Verification

1. Run `pnpm verify:phase-0` to confirm all 25 foundational criteria pass.
2. Run `pnpm verify:prod` to validate environment completeness, workspace exports, and zero-drift rules.
3. Verify PostgreSQL Kernel Row-Level Security:
   ```sql
   -- Verify non-superuser role
   SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'visahobe_app';
   -- Expect: rolsuper = false, rolbypassrls = false

   -- Verify RLS is enabled and forced on all tenant tables
   SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('tenants', 'users', 'cases', 'tasks', 'documents', 'wallet_transactions');
   -- Expect: relrowsecurity = true, relforcerowsecurity = true
   ```

### Phase B: VPS Live Browser Worker Deployment

1. Build the production Docker container:
   ```bash
   docker build -t visahobe-browser-worker:latest -f workers/browser-session/Dockerfile .
   ```
2. Launch isolated container behind Nginx / Caddy reverse proxy with SSL termination:
   ```bash
   docker run -d \
     --name visahobe-browser-worker-01 \
     --restart unless-stopped \
     -p 127.0.0.1:6080:6080 \
     -p 127.0.0.1:9222:9222 \
     -e VNC_PASSWORD="<high-entropy-vnc-password>" \
     -e SCREEN_WIDTH=1280 \
     -e SCREEN_HEIGHT=800 \
     visahobe-browser-worker:latest
   ```
3. Test stream authentication and verify that `-viewonly` mode is physically enforced for client tokens.

### Phase C: Vercel Production Domain Cutover

1. Verify domain DNS records (Cloudflare):
   - `visahobe.com` $\rightarrow$ Vercel `apps/website`
   - `app.visahobe.com` $\rightarrow$ Vercel `apps/client-dashboard`
   - `admin.visahobe.com` $\rightarrow$ Vercel `apps/super-admin`
2. Promote staged deployments to production via Vercel CLI or Git merge to `main`.
3. Verify live healthchecks on all 3 surfaces:
   - `GET https://visahobe.com` (HTTP 200)
   - `GET https://app.visahobe.com` (HTTP 200)
   - `GET https://admin.visahobe.com` (HTTP 200, redirects to MFA login)

---

## 3. Rollback Procedure

In the event of an unexpected regression during production cutover:

1. **Frontend / Edge Instant Rollback (Vercel)**:
   - In the Vercel Dashboard, select the previous stable deployment and click **Instant Rollback**.
   - Zero code recompilation is required; edge traffic reverts in $< 5$ seconds.
2. **Database Invariant**:
   - Because of the **Single Migration-Owner Rule** (`ADR-004`/`ADR-007`), database schemas are backward-compatible.
   - Do NOT run destructive down-migrations in production. Application code must tolerate both old and new non-null columns.
3. **Browser Worker Fallback**:
   - If live streaming degrades, the platform automatically falls back to CDP screencast snapshots or assisted manual review without interrupting the case submission queue.

---

## 4. Secret Rotation Runbook

### A. JWT Auth Secret (`JWT_SECRET` / `STREAM_JWT_SECRET`)

1. Implement a 24-hour dual-secret verification window:
   - Verify incoming tokens against both `CURRENT_SECRET` and `NEW_SECRET`.
   - Issue all new tokens using `NEW_SECRET`.
2. After 24 hours, deprecate `CURRENT_SECRET`.

### B. Payment Webhook Secrets (Pay Station / Stripe)

1. Add secondary webhook endpoint in payment gateway dashboards.
2. Update application environment variables with the new webhook secret.
3. Trigger test webhook from gateway dashboard; verify HTTP 200 and signature validation.
4. Revoke legacy webhook endpoint.

---

## 5. Incident Response Protocols

### Incident 1: Sensitive PII Exposure or Unredacted Log Detected

1. **Severity:** P0
2. **Immediate Action:**
   - Execute log truncation on affected service via Sentry / CloudWatch log scrubber.
   - Verify that `@visahobe/core` Layer 1, 2, and 3 regex scrubbers are active.
   - Run audit trail inspection via Admin MCP Server `inspectCaseAuditTrail`.
   - Report incident to Platform Security Officer within 1 hour.

### Incident 2: Runaway Browser Automation Session

1. **Severity:** P1
2. **Mitigation:**
   - Invoke `BrowserSessionManager.terminateSession(sessionId, tenantId)` via Super Admin Command Center or CLI.
   - Container process terminates instantly:
     ```bash
     docker exec visahobe-browser-worker-01 pkill -9 -f chromium
     ```
   - Auto-cleanup daemon automatically terminates sessions past 10-minute idle TTL.

### Incident 3: Consular Safety Gate Breach Attempt

1. **Severity:** P0
2. **Mitigation:**
   - `ConsularSafetyGuard` immediately intercepts unauthorized actions (`portal_payment`, `schedule_biometrics`, `sign_perjury_affidavit`) and halts session to `paused_safety_gate`.
   - Status transitions to `specialist_review`. Automated agent cannot bypass this gate without human operator session.
