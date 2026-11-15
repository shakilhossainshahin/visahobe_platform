# ADR-010: B2B2C Multi-Tenant Architecture, Agency White-Labeling, and Prepaid Wallet Engine

**Status:** Accepted  
**Date:** 15 November 2026  
**Deciders:** Core Architecture Team, Product Lead, Finance & Operations Lead  
**Consulted:** Final Architecture Blueprint v2.0, ADR-002 (Tenant Isolation), ADR-008 (Security & Auth)

---

## 1. Context and Problem Statement

VisaHobe's original architecture was structured primarily around direct-to-consumer (B2C) applicants served by internal VisaHobe operations staff. However, to capture global market share and achieve hyper-scale distribution across South Asia, the Middle East, Southeast Asia, and Europe, VisaHobe must operate as a true **B2B2C Multi-Tenant SaaS platform**.

Travel agencies, tour operators, educational consultancies, and corporate travel desks manage thousands of visa applications per month. These partner agencies demand:

1. White-label portal experiences with custom domains or subdomains (e.g. `visa.bengaltravel.com` or `visahobe.com/p/bengal-travel`), branded email notifications, and branded client workspaces.
2. Independent agency staff seats (agency managers, case submitters, finance accountants) managing their applicant pool without visibility into competitor agencies.
3. Rapid, friction-free case submission without waiting for per-application corporate credit card approvals or invoicing delays.

Simultaneously, from a platform financial risk perspective, post-paid billing or credit invoicing exposes VisaHobe to payment defaults, chargebacks, currency fluctuations, and delayed cash collection across cross-border jurisdictions.

A hardened B2B2C multi-tenant structure and a prepaid agency wallet engine are required to unlock scalable agency distribution while eliminating platform financial risk.

---

## 2. Decision Drivers

- **Zero Platform Credit Risk:** Visa applications, government filing fees, and processing costs must never be incurred without pre-funded, settled agency balances.
- **Hierarchical Isolation:** Complete data, case, and document isolation between different B2B partner agencies while preserving Super Admin root oversight.
- **Brand Customization:** Flexible, domain-driven branding (logos, brand colors, agency metadata) without duplicating application codebases or infrastructure.
- **Financial Auditability:** Immutable double-entry accounting ledger tracking all credits, debits, holds, and reconciliations with zero balance drift.
- **High Concurrency Concurrency Safety:** Safe concurrent deductions during bulk agency visa submissions without race conditions or negative balances.

---

## 3. Decision

VisaHobe adopts a **3-Tier Hierarchical Multi-Tenant B2B2C Model** integrated with an **Atomic Prepaid Agency Wallet and Double-Entry Financial Ledger**.

### 3.1 3-Tier Multi-Tenancy Hierarchy

```
[ Tier 1: Platform Owner ] -> admin.visahobe.com (Super Admin Command Center)
       |
       +---> [ Tier 2: B2B Partner Agency ] -> Custom domain / Subdomain / White-label
       |            |
       |            +---> [ Tier 3: Agency-Sponsored Applicants ] -> Client Dashboard / App
       |
       +---> [ Tier 2: Direct Retail Desk ] -> visahobe.com (Default Platform Tenant)
                    |
                    +---> [ Tier 3: Direct Retail Applicants ] -> Client Dashboard / App
```

1. **Tenant Model Structure:**
   - Every `Tenant` entity in PostgreSQL includes `type` (`platform`, `partner_agency`, `corporate_enterprise`), `parentTenantId UUID NULL`, `customDomain VARCHAR(255) NULL`, `slug VARCHAR(100) UNIQUE`, and `branding JSONB`.
   - Direct retail applicants belong to the root platform tenant or a designated retail tenant.
   - Agency-sponsored applicants belong to the specific `partner_agency` tenant.
2. **Domain & Branding Resolution:**
   - Next.js edge middleware resolves the incoming `Host` header against registered custom domains and subdomains cached in Redis.
   - White-label configuration (agency logo, emerald dark-green primary color accents, support contact info) is injected into the server rendering tree.
3. **RBAC & Staff Scoping:**
   - Agency personnel are granted scoped roles: `agency_owner`, `agency_manager`, `agency_agent`, and `agency_accountant`.
   - Agency roles possess permissions bounded strictly to cases where `cases.tenant_id = user.tenant_id`.

### 3.2 Prepaid Agency Wallet Engine

1. **Pre-Funded Balance Requirement:**
   - Each partner agency tenant maintains an `agency_wallets` record containing `currency` (USD / BDT / EUR), `balance Decimal(12,2)`, and `locked_balance Decimal(12,2)`.
   - Overdraft is strictly forbidden (`CHECK (balance >= 0)` at the database constraint level).
2. **Payment Ingestion (Pay Station & Gateways):**
   - Agencies top up wallet balances via integrated gateways (Pay Station supporting local payment methods e.g. bKash, Nagad, local cards, or international Stripe).
   - Funds are credited only upon verified cryptographic webhook signature verification and ledger entry confirmation.
3. **Atomic Case Fee Deduction Protocol:**
   - When an agency agent submits a visa application:
     ```sql
     BEGIN;
     -- Lock the agency wallet row to prevent concurrent race conditions
     SELECT id, balance, currency
     FROM agency_wallets
     WHERE tenant_id = $tenant_id
     FOR UPDATE;

     -- Verify sufficient balance
     IF balance < $case_fee THEN
       RAISE EXCEPTION 'INSUFFICIENT_WALLET_BALANCE';
     END IF;

     -- Deduct fee and insert immutable ledger entry
     UPDATE agency_wallets
     SET balance = balance - $case_fee, updated_at = NOW()
     WHERE id = $wallet_id;

     INSERT INTO wallet_transactions (
       tenant_id, wallet_id, case_id, type, amount, balance_before, balance_after, description
     ) VALUES (
       $tenant_id, $wallet_id, $case_id, 'DEBIT', $case_fee, balance, balance - $case_fee, 'Visa processing fee'
     );

     UPDATE cases SET status = 'submitted' WHERE id = $case_id;
     COMMIT;
     ```
4. **Immutable Double-Entry Ledger:**
   - All monetary changes generate immutable rows in `wallet_transactions` (`CREDIT`, `DEBIT`, `HOLD`, `RELEASE`, `REFUND`).
   - Entries cannot be updated or deleted (`REVOKE UPDATE, DELETE ON wallet_transactions FROM visahobe_app`). Corrections require compensating ledger transactions.

---

## 4. Consequences and Invariants

### Positive Consequences

- **Zero Bad Debt:** The platform never incurs government application or operational costs without guaranteed prepaid settlement.
- **Frictionless Agency Experience:** Agencies submit dozens of applications daily without entering card details for each transaction.
- **Enterprise Defensibility:** White-label domain capability and custom branding turn travel agencies into loyal distribution partners.
- **Full Traceability:** Financial reconciliation is guaranteed via the double-entry transaction ledger and database row-level locking.

### Negative Consequences / Trade-offs

- **Wallet Reconciliation Overhead:** Requires proactive monitoring of low wallet balances, automated top-up notifications, and partner financial support workflows.
- **Multi-Currency Complexity:** Different jurisdictions require distinct wallet currencies (e.g. BDT for Bangladesh agencies, USD/EUR for international partners).

---

## 5. Security & Isolation Invariants

1. **Kernel RLS Boundary:** Agency staff queries are restricted to their own `tenant_id` via PostgreSQL 16 Kernel RLS. Agency users cannot read balances or transactions of other agencies.
2. **Webhook Signature Verification:** All wallet top-up callbacks must pass cryptographic signature and timestamp replay validation before updating wallet state.
3. **No Direct Balance Manipulation:** The application layer must never execute raw `UPDATE agency_wallets SET balance = X` without an accompanying verified `wallet_transactions` entry within an atomic database transaction.
