# VisaHobe Platform — 10-Minute Production Go-Live Checklist & Runbook

> **Scope:** Final launch verification, environment cutover, database migration, and live surface health validation for `visahobe_platform`.  
> **Target Execution Time:** 10 minutes from DNS / Vercel trigger to full public availability.

---

## 1. Pre-Flight Verification Gate (T - 10 Minutes)

Before initiating DNS cutover or triggering production promotion:

```bash
# 1. Ensure clean git status on main branch
git checkout main
git pull origin main

# 2. Run the full 8-step pre-push gate
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm --filter "./packages/**" --filter "./services/**" --filter "./workers/**" build
pnpm typecheck
pnpm test
pnpm build
pnpm verify:phase-0
pnpm verify:prod
```

---

## 2. Environment Variables & Secret Provisioning (T - 8 Minutes)

Verify that all target platforms (Vercel Production, AWS/Fly.io/Docker Worker hosts, Cloudflare) have their production environment variables set per `.env.production.example`:

### 2.1 Database & Storage

- [ ] `DATABASE_URL`: Connection-pooled PostgreSQL 16 URL (`pgbouncer=true`).
- [ ] `DIRECT_URL`: Direct unpooled PostgreSQL 16 URL for migrations.
- [ ] `S3_ENDPOINT` & `S3_ACCESS_KEY_ID`: Cloudflare R2 / AWS S3 private document vault.
- [ ] `STORAGE_SECRET`: 256-bit AES encryption secret for signed presigned URLs.

### 2.2 Authentication & Security

- [ ] `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Supabase production auth project.
- [ ] `JWT_SECRET`: Minimum 32-character high-entropy secret.
- [ ] `STREAM_JWT_SECRET`: Browser worker live stream token secret.
- [ ] `VNC_PASSWORD`: Isolated container runtime password.

### 2.3 Payment Gateways

- [ ] `PAYSTATION_MERCHANT_ID`, `PAYSTATION_PASSWORD`, `PAYSTATION_WEBHOOK_SECRET`: Live credentials from Pay Station portal.
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe Live mode keys.

---

## 3. Database Migration & RLS Enforcement (T - 5 Minutes)

Execute kernel migrations under the Single Migration-Owner Rule:

```bash
# Run migrations using the direct unpooled connection:
DATABASE_URL="$DIRECT_URL" pnpm db:migrate

# Validate database schema consistency:
pnpm db:validate
```

Verify that Row-Level Security remains active on all 5 tenant tables:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Expected: cases, tasks, documents, memberships, audit_logs all have rowsecurity = true
```

---

## 4. Deploy Vercel Production Surfaces (T - 3 Minutes)

Promote the 3 Next.js applications to production:

| Surface                        | Vercel Project         | Production URL               |
| :----------------------------- | :--------------------- | :--------------------------- |
| **Public Acquisition Site**    | `visahobe-platform`    | `https://visahobe.com`       |
| **Client Workspace Dashboard** | `visahobe-client`      | `https://app.visahobe.com`   |
| **Super Admin Command Center** | `visahobe-super-admin` | `https://admin.visahobe.com` |

---

## 5. Mobile & Android Capacitor Shell Sync (T - 2 Minutes)

For native mobile app distribution:

```bash
# Synchronize web assets into Android Capacitor shell:
pnpm android:sync

# Verify Capacitor config
pnpm --filter @visahobe/client-dashboard exec cap doctor android
```

---

## 6. Live Smoke Testing & Synthetic Health Check (T - 0 Minutes)

1. **Public Site (`/`)**:
   - Check that 3D Earth Globe renders with GeoJSON continents and rotates smoothly at 60 FPS.
   - Test Instant Visa Search & Tariff Calculator.
   - Test `/assess` eligibility questionnaire flow.
2. **Client Dashboard (`/login` & `/`)**:
   - Log in with test applicant credentials.
   - Inspect 5-stage milestone tracker and Document Vault table.
3. **Super Admin Command Center (`/login` & `/`)**:
   - Log in with staff credentials and complete MFA verification (AAL2).
   - Verify telemetry deck (Autonomy Ratio, Country Pipeline, Partner Liquidity).
4. **Webhook Security**:
   - Send test signed ping to `/api/webhooks/paystation` and `/api/webhooks/stripe`.

---

## 7. Emergency Rollback Protocol

If critical anomalies or payment settlement failures occur:

```bash
# 1. Roll back Vercel deployment:
vercel rollback --scope visahobe

# 2. Database rollback (if needed):
# Restore pre-migration point-in-time recovery (PITR) snapshot via cloud database console.

# 3. Notify incident response team:
# Post alert in operations escalation channel with Sentry error fingerprint.
```
