# TICKET-P4-002: Production Cutover Readiness, Isolated Live Browser Worker (Docker + noVNC/CDP) & Hyper-Velocity Execution Rules

- **Ticket ID:** `TICKET-P4-002`
- **Phase:** Phase 4 — Payment Gateways, Webhook Idempotency & Case-to-Submission Pipeline
- **Priority:** `P0`
- **Status:** `Completed & Verified`
- **Governing ADRs:** `ADR-009` (Visual Identity & Palette), `ADR-010` (B2B2C Multi-Tenancy & Prepaid Wallet), `ADR-011` (Super AI Agent Autonomy & Consular Review Gates), `ADR-012` (Scoped MCP Servers & B2C Client Shielding)

---

## 1. Objective

Deliver enterprise-grade production readiness, complete operational cutover verification, an isolated zero-trust live browser automation container running headless Chromium with secured noVNC/CDP streaming, client-side live streaming UI with human-in-the-loop takeover, and permanent hyper-velocity engineering protocols:

1. **Hyper-Velocity Execution Protocol Upgrade (`AGENTS.md` & `.antigravity/rules.md`)**:
   - Institutionalized **Skill 5: Hyper-Velocity Monorepo Execution & Zero-Waste CI Architect** across repository operational rules.
   - Zero-waste single-call editing, scoped compilation during development, single comprehensive pre-push verification gate, and strict zero-drift rule parity.
2. **Isolated Live Browser Automation Worker Container (`workers/browser-session`)**:
   - Production multi-stage `Dockerfile` and `start.sh` provisioning headless virtual-display Chromium (`Xvfb :99`), `x11vnc` with mandatory token/password authentication (strictly forbidding `-nopw`), `websockify`/noVNC on port `6080`, and Chrome DevTools Protocol (CDP) on port `9222`, running as dedicated non-root user `browseruser`.
   - `BrowserSessionManager`: Provisions tenant-isolated browser sessions with consular domain allowlists (`ALLOWED_DOMAINS`), input PII masking (passports, credit cards, CVVs, passwords), automated safety checkpoint pauses (`portal_payment`, `schedule_biometrics`, `sign_perjury_affidavit`, CAPTCHA/MFA), 10-minute idle TTL enforcement, and human operator takeover dispatch.
   - `StreamAuth`: Cryptographic short-lived JWT stream tokens (`STREAM_JWT_SECRET`) enforcing unconditional `-viewonly` read-only mode for applicant/client sessions, allowing interactive takeover only for privileged operators (`browser_operator`, `admin`, `owner`), and rejecting cross-tenant token replay.
3. **Frontend Live Stream UI & Layout Integration (`packages/ui`, `apps/super-admin`, `apps/client-dashboard`)**:
   - `<BrowserLiveViewer />`: High-contrast luxury liquid-glass component featuring interactive takeover controls, live status badges, safety pause banners, active PII defense indicators, and 10-minute auto-termination countdown.
   - Integrated into `@visahobe/ui` and surfaced in `apps/super-admin/app/browser/page.tsx` and `apps/client-dashboard/app/live-stream/page.tsx`.
4. **Production Cutover Verification & Runbooks (`docs/runbooks/`, `scripts/verify-production-readiness.ts`)**:
   - Comprehensive production runbook `docs/runbooks/production-cutover-and-incident-response.md` covering Supabase PostgreSQL 16 RLS verification, payment gateway webhooks, Cloudflare R2 object storage, Docker browser worker deployment, zero-downtime blue/green DNS cutover, and emergency rollback procedures.
   - Automated 17-point production cutover verification suite (`pnpm verify:prod`).

---

## 2. Core Deliverables

### Step A — Hyper-Velocity Governance & Parity (`AGENTS.md` & `.antigravity/rules.md`)

- **Skill 5: Hyper-Velocity Monorepo Execution & Zero-Waste CI Architect**:
  - Direct whole-file inspection and edits (no small, fragmented chunk edits).
  - Fast scoped checks during development (`pnpm --filter <pkg> typecheck`, `pnpm --filter <pkg> test`).
  - Single pre-push verification run covering all monorepo gates.
  - Zero-drift guarantee: `git diff --no-index AGENTS.md .antigravity/rules.md` verified 100% identical.

### Step B — Isolated Live Browser Worker (`workers/browser-session`)

- **Hardened Docker Container (`Dockerfile`, `start.sh`)**:
  - Base image: `node:20-bookworm-slim` with Chromium, Xvfb, x11vnc, noVNC, and websockify.
  - Non-root user: `browseruser` (UID 1001) with dedicated home and sandbox directories.
  - Security invariant: Mandatory password/token authentication (`x11vnc -rfbauth`). Running with `-nopw` is fatal and strictly prohibited.
  - Exposed ports: `6080` (WebSocket noVNC stream) and `9222` (Local CDP loopback).
- **Session Manager (`workers/browser-session/src/session-manager.ts`)**:
  - Isolated sessions keyed by `tenantId` and `caseId`.
  - Domain allowlist boundary checking preventing navigation to arbitrary or malicious hosts.
  - PII masking (`applyPiiInputMask`): Redacts sensitive user data before submission into DOM nodes.
  - Consular Safety Gate intercept (`evaluateSafetyCheckpoint`): Intercepts payment forms, biometric appointments, and statutory affidavits per `ADR-011 §3.2`, transitioning session state to `paused_safety_gate`.
  - Idle session cleaner: Automatically reaps inactive sessions exceeding 10 minutes (`SESSION_IDLE_TTL_MS`).
- **Stream Gateway Authentication (`workers/browser-session/src/stream-auth.ts`)**:
  - Issues signed HMAC-SHA256 tokens (`StreamAuth.issueStreamToken`).
  - Enforces role-based permissions: `client` role is strictly locked to `view_only: true` and `can_takeover: false`.
  - Rejects cross-tenant access and expired tokens with strict error types.

### Step C — Luxury Live Stream UI (`packages/ui`, `apps/super-admin`, `apps/client-dashboard`)

- **`<BrowserLiveViewer />` Component (`packages/ui/src/components/Browser/BrowserLiveViewer.tsx`)**:
  - Liquid glass outer framing with `#0D3B2E` brand emerald header and `#C8A951` champagne gold accents.
  - Client view: Displays read-only stream with `VIEW ONLY (ENCRYPTED STREAM)` security badge.
  - Operator view: Displays `Request Interactive Takeover` / `Release Control` actions for staff.
  - Safety pause notification: Surfaced immediately when an autonomous session halts at a consular safety checkpoint.
- **Surface Integration**:
  - Super Admin: `/browser` operational monitoring command center with full takeover capabilities.
  - Client Dashboard: `/live-stream` transparent real-time case submission tracker for applicants.

### Step D — Production Verification & Operational Runbooks

- **Production Cutover Runbook (`docs/runbooks/production-cutover-and-incident-response.md`)**:
  - Step-by-step checklists for Database RLS, Payment Gateways (Pay Station & Stripe), Cloudflare R2 Document Vault, and VPS Browser Worker.
  - Zero-downtime DNS cutover and instant rollback plans.
  - Incident response playbooks for Webhook replay attacks, RLS boundary leaks, and browser worker isolation faults.
- **Production Readiness Suite (`scripts/verify-production-readiness.ts`)**:
  - Automated 17-point check across 7 production criteria:
    - C1: Production Security & Zero Secret Leaks (Envelope encryption & PII redaction)
    - C2: PostgreSQL 16 Kernel RLS & Migration Invariant
    - C3: Zero-Trust Live Browser Worker (Docker, VNC `-rfbauth`, Domain boundary, Consular safety gate, View-only stream, Cross-tenant rejection)
    - C4: Payment Gateway Adapters & Webhook Security (Multi-currency routing & 300s replay window)
    - C5: B2C Client Shielding & Consular Review Gates
    - C6: Environment Templates & Cutover Runbooks
    - C7: Zero-Drift Governance Rules Parity (`AGENTS.md` vs `.antigravity/rules.md`)
  - Executable via `pnpm verify:prod`.

---

## 3. Verification & Test Suite

```bash
# Production Readiness Verification (17/17 checks passing)
pnpm verify:prod

# Browser Worker Unit & Security Suite (14/14 tests passing)
pnpm vitest run workers/browser-session/test/browser-session.test.ts

# UI Live Viewer Suite (5/5 tests passing)
pnpm vitest run packages/ui/test/browser-live-viewer.test.tsx

# Full Monorepo Typecheck
pnpm typecheck

# Full Monorepo Build
pnpm build
```

---

## 4. Architecture Invariants Preserved

1. **Single Migration-Owner Rule (`ADR-004`/`ADR-007`)**:
   - Zero modifications to `packages/database/prisma/schema.prisma` or migration SQL files.
2. **Zero `-nopw` Live Browser Security Invariant**:
   - `x11vnc` must never be run with `-nopw`. Password and token authentication are strictly enforced in `start.sh` and verified in `verify-production-readiness.ts`.
3. **Stream Gateway Role Isolation**:
   - B2C applicants are cryptographically constrained to `-viewonly` read-only streams. Interactive takeover is reserved strictly for authenticated staff operators.
4. **Consular Safety Review Gates (`ADR-011 §3.2`)**:
   - Automated browser execution halts immediately when encountering live payment or consular affidavit gates.
5. **Zero-Drift Governance Parity**:
   - `AGENTS.md` and `.antigravity/rules.md` remain 100% byte-for-byte identical.
