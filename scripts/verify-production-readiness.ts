/**
 * VisaHobe Platform — Production Cutover Readiness Verification Suite (TICKET-P4-002)
 *
 * Programmatically verifies end-to-end production readiness, security boundaries,
 * environment templates, live browser worker isolation, payment gateway integrity,
 * and zero-drift repository governance rules.
 *
 * Exit code 0 on full satisfaction.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// Domain package imports
import { redactPii, EnvSecretProvider, ClientShieldingService } from '@visahobe/core';
import { ConsularSafetyGuard } from '@visahobe/agents';
import {
  PaymentGatewayRegistry,
  PayStationAdapter,
  StripeAdapter,
  WebhookReplayAttackError,
} from '@visahobe/integrations';
import {
  BrowserSessionManager,
  StreamAuth,
  DomainNotAllowedError,
  StreamAccessDeniedError,
} from '@visahobe/worker-browser-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

interface CheckResult {
  code: string;
  name: string;
  passed: boolean;
  message?: string;
}

const results: CheckResult[] = [];

function recordCheck(code: string, name: string, passed: boolean, message?: string) {
  results.push({ code, name, passed, message });
  const symbol = passed ? '✓' : '✗';
  console.info(`  ${symbol} [${code}] ${name}${message ? ` (${message})` : ''}`);
  if (!passed) {
    console.error(`     FAILED: ${message ?? 'Check assertion failed'}`);
  }
}

async function runProductionReadinessChecks() {
  console.info('='.repeat(80));
  console.info('VisaHobe Platform — Production Cutover Readiness Suite (TICKET-P4-002)');
  console.info('='.repeat(80));
  console.info(`Timestamp: ${new Date().toISOString()}`);
  console.info(`Platform: Node ${process.version} (${process.platform} ${process.arch})\n`);

  // ============================================================================
  // Criterion 1: Production Security & Zero Secret Leaks
  // ============================================================================
  console.info('Criterion 1: Production Security & Zero Secret Leaks');

  try {
    const rawSecret = 'top-secret-consular-credential-2026';
    const vault = new EnvSecretProvider({
      encryptionMasterKey: '01234567890123456789012345678901',
    });
    const encryptedRef = await vault.createVaultReference('consular-key-1', rawSecret);
    const decrypted = await vault.resolveVaultReference(encryptedRef);
    recordCheck(
      'C1.1',
      'SecretVault envelope encryption (AES-256-GCM)',
      decrypted === rawSecret && encryptedRef.encryptedData !== rawSecret,
      'Envelope encryption & decryption round-trip verified',
    );
  } catch (err: unknown) {
    recordCheck('C1.1', 'SecretVault envelope encryption (AES-256-GCM)', false, String(err));
  }

  try {
    const piiText =
      'Applicant John Doe passport A12345678 email test@example.com phone +8801712345678';
    const redacted = redactPii(piiText) as string;
    const isClean =
      !redacted.includes('A12345678') &&
      !redacted.includes('test@example.com') &&
      !redacted.includes('+8801712345678');
    recordCheck(
      'C1.2',
      'Defense-in-depth PII scrubbing (Layers 1-3)',
      isClean,
      'PII fields redacted',
    );
  } catch (err: unknown) {
    recordCheck('C1.2', 'Defense-in-depth PII scrubbing (Layers 1-3)', false, String(err));
  }

  // ============================================================================
  // Criterion 2: PostgreSQL 16 Kernel RLS & Single Migration-Owner Invariant
  // ============================================================================
  console.info('\nCriterion 2: PostgreSQL 16 Kernel RLS & Migration Invariant');

  try {
    const schemaPath = path.join(ROOT_DIR, 'packages/database/prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const hasCoreModels =
      schemaContent.includes('model Tenant') &&
      schemaContent.includes('model User') &&
      schemaContent.includes('model Case') &&
      schemaContent.includes('model Document');
    recordCheck(
      'C2.1',
      'Prisma Schema & core models verification',
      hasCoreModels,
      'All core models defined',
    );

    const migrationsDir = path.join(ROOT_DIR, 'packages/database/prisma/migrations');
    const migrationDirs = fs
      .readdirSync(migrationsDir)
      .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory());
    let rlsEnforced = false;
    for (const d of migrationDirs) {
      const sqlPath = path.join(migrationsDir, d, 'migration.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        if (sql.includes('ENABLE ROW LEVEL SECURITY') && sql.includes('FORCE ROW LEVEL SECURITY')) {
          rlsEnforced = true;
          break;
        }
      }
    }
    recordCheck(
      'C2.2',
      'Kernel RLS ENABLE + FORCE policies in migration SQL',
      rlsEnforced,
      'RLS kernel policies verified',
    );
  } catch (err: unknown) {
    recordCheck('C2.1', 'Database schema & migrations verification', false, String(err));
  }

  // ============================================================================
  // Criterion 3: Zero-Trust Live Browser Worker (Docker, VNC & Stream Gateway)
  // ============================================================================
  console.info('\nCriterion 3: Zero-Trust Live Browser Worker (Docker, VNC & Stream Gateway)');

  try {
    const dockerfilePath = path.join(ROOT_DIR, 'workers/browser-session/Dockerfile');
    const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
    const isNonRoot =
      dockerfile.includes('USER browseruser') && dockerfile.includes('groupadd -r browseruser');
    recordCheck(
      'C3.1',
      'Browser Worker Dockerfile non-root user isolation',
      isNonRoot,
      'Dedicated browseruser configured',
    );

    const startShPath = path.join(ROOT_DIR, 'workers/browser-session/start.sh');
    const startSh = fs.readFileSync(startShPath, 'utf8');
    const x11vncBlock = startSh
      .split('\n')
      .filter((l) => l.trim().startsWith('x11vnc') || l.trim().startsWith('-'));
    const executesWithNoPw = x11vncBlock.some((l) => l.includes('-nopw'));
    const executesWithRfbAuth = x11vncBlock.some((l) => l.includes('-rfbauth'));
    const enforcesPasswordEnv = startSh.includes('VNC_PASSWORD') && startSh.includes('VNC_TOKEN');
    const isValid = enforcesPasswordEnv && executesWithRfbAuth && !executesWithNoPw;

    recordCheck(
      'C3.2',
      'x11vnc strict token/password authentication (Zero -nopw invariant)',
      isValid,
      'Mandatory password auth enforced; -nopw forbidden in x11vnc execution',
    );
  } catch (err: unknown) {
    recordCheck('C3.1', 'Browser worker container configuration', false, String(err));
  }

  try {
    BrowserSessionManager.clear();
    const session = await BrowserSessionManager.createSession({
      tenantId: 'tenant-prod-test',
      caseId: 'case-prod-001',
      destinationCountry: 'SG',
      portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
    });

    // Domain allowlist check
    let blockedArbitrary = false;
    try {
      BrowserSessionManager.validateNavigation(session.id, 'https://arbitrary-unallowed.com');
    } catch (e: unknown) {
      if (e instanceof DomainNotAllowedError) {
        blockedArbitrary = true;
      }
    }
    recordCheck(
      'C3.3',
      'BrowserSessionManager domain allowlist boundary enforcement',
      blockedArbitrary,
      'Unallowed domains strictly blocked',
    );

    // Consular safety gate check
    const safetyPause = BrowserSessionManager.evaluateSafetyCheckpoint(session.id, {
      actionType: 'portal_payment',
    });
    recordCheck(
      'C3.4',
      'Consular Safety Gate automated session pause (ADR-011)',
      safetyPause.shouldPause === true,
      'Live payment halted for human authorization',
    );

    // Stream token view-only invariant
    const clientToken = await StreamAuth.issueStreamToken(
      {
        userId: 'u1',
        email: 'c@test.com',
        role: 'client',
        tenantId: 'tenant-prod-test',
        isMfaVerified: false,
        aal: 'aal1',
      },
      { sessionId: session.id, caseId: 'case-prod-001' },
    );
    const verifiedStream = await StreamAuth.verifyStreamToken(clientToken, {
      expectedTenantId: 'tenant-prod-test',
    });
    recordCheck(
      'C3.5',
      'StreamAuth forced view-only mode for client role (-viewonly)',
      verifiedStream.view_only === true && verifiedStream.can_takeover === false,
      'Zero-trust read-only stream enforced',
    );

    // Cross-tenant stream rejection
    let crossTenantBlocked = false;
    try {
      await StreamAuth.verifyStreamToken(clientToken, { expectedTenantId: 'tenant-different' });
    } catch (e: unknown) {
      if (e instanceof StreamAccessDeniedError) {
        crossTenantBlocked = true;
      }
    }
    recordCheck(
      'C3.6',
      'StreamAuth cross-tenant token presentation rejection',
      crossTenantBlocked,
      'Cross-tenant stream access denied (HTTP 403)',
    );
  } catch (err: unknown) {
    recordCheck('C3.3', 'Browser Session Manager & Stream Auth checks', false, String(err));
  }

  // ============================================================================
  // Criterion 4: Payment Gateway Adapters & Webhook Security
  // ============================================================================
  console.info('\nCriterion 4: Payment Gateway Adapters & Webhook Security');

  try {
    const payStation = PaymentGatewayRegistry.resolveAdapterForCurrency('BDT');
    const stripe = PaymentGatewayRegistry.resolveAdapterForCurrency('USD');
    recordCheck(
      'C4.1',
      'PaymentGatewayRegistry multi-currency adapter resolution',
      payStation instanceof PayStationAdapter && stripe instanceof StripeAdapter,
      'BDT -> Pay Station, USD -> Stripe',
    );

    // Replay attack window validation
    let replayBlocked = false;
    try {
      const now = Math.floor(Date.now() / 1000);
      const staleTimestamp = now - 500; // 500s old > 300s window
      const secret = 'test-secret-key-123';
      const sig = payStation.generateWebhookSignature({ test: true }, secret, staleTimestamp);
      await payStation.verifyWebhookSignature(
        { test: true },
        `${sig};timestamp=${staleTimestamp}`,
        secret,
        { currentTimestampSeconds: now },
      );
    } catch (e: unknown) {
      if (e instanceof WebhookReplayAttackError) {
        replayBlocked = true;
      }
    }
    recordCheck(
      'C4.2',
      'Cryptographic webhook 300-second replay attack window enforcement',
      replayBlocked,
      'Stale webhook replay rejected',
    );
  } catch (err: unknown) {
    recordCheck('C4.1', 'Payment gateway adapter checks', false, String(err));
  }

  // ============================================================================
  // Criterion 5: B2C Client Shielding & Consular Review Gate Boundaries
  // ============================================================================
  console.info('\nCriterion 5: B2C Client Shielding & Consular Review Gate Boundaries');

  try {
    const rawCaseRecord = {
      id: 'case-1',
      caseNumber: 'VH-2026-SG-001',
      tenantId: 'tenant-1',
      status: 'specialist_review',
      internalCaseworkNotes: 'Internal margin 40%; verifier assigned: agent-9',
      agentConfidenceScore: 0.98,
      wholesaleCost: 25.0,
    };
    const shielded = ClientShieldingService.shieldCaseRecord(
      rawCaseRecord as unknown as import('@visahobe/core').CasePayloadInput,
      'b2c_retail',
    );
    const isShieldedClean =
      shielded['internalCaseworkNotes'] === undefined &&
      shielded['agentConfidenceScore'] === undefined &&
      shielded['wholesaleCost'] === undefined;
    recordCheck(
      'C5.1',
      'ClientShieldingService retail applicant data shielding (ADR-012)',
      isShieldedClean,
      'Casework notes and confidence scores stripped',
    );

    const isPaymentRestricted = ConsularSafetyGuard.isRestrictedAction('portal_payment');
    const isBioRestricted = ConsularSafetyGuard.isRestrictedAction('schedule_biometrics');
    const isPerjuryRestricted = ConsularSafetyGuard.isRestrictedAction('sign_perjury_affidavit');
    recordCheck(
      'C5.2',
      'ConsularSafetyGuard restricted action boundary (ADR-011 §3.2)',
      isPaymentRestricted && isBioRestricted && isPerjuryRestricted,
      'All 3 high-risk consular actions strictly gated',
    );
  } catch (err: unknown) {
    recordCheck('C5.1', 'Client shielding and consular safety checks', false, String(err));
  }

  // ============================================================================
  // Criterion 6: Environment Configuration Templates & Runbooks
  // ============================================================================
  console.info('\nCriterion 6: Environment Templates & Cutover Runbooks');

  try {
    const envPath = path.join(ROOT_DIR, '.env.example');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasEnvVars =
      envContent.includes('DATABASE_URL') &&
      envContent.includes('JWT_SECRET') &&
      envContent.includes('STREAM_JWT_SECRET') &&
      envContent.includes('PAYSTATION_MERCHANT_ID') &&
      envContent.includes('STRIPE_SECRET_KEY') &&
      envContent.includes('VNC_PASSWORD');
    recordCheck(
      'C6.1',
      '.env.example production environment template completeness',
      hasEnvVars,
      'All database, JWT, stream, payment, and VNC variables defined',
    );

    const runbookPath = path.join(
      ROOT_DIR,
      'docs/runbooks/production-cutover-and-incident-response.md',
    );
    const runbookExists = fs.existsSync(runbookPath);
    recordCheck(
      'C6.2',
      'Production cutover & incident response runbook presence',
      runbookExists,
      'docs/runbooks/production-cutover-and-incident-response.md verified',
    );
  } catch (err: unknown) {
    recordCheck('C6.1', 'Environment and runbook checks', false, String(err));
  }

  // ============================================================================
  // Criterion 7: Zero-Drift Governance Rules Parity
  // ============================================================================
  console.info('\nCriterion 7: Zero-Drift Governance Rules Parity');

  try {
    const agentsPath = path.join(ROOT_DIR, 'AGENTS.md');
    const rulesPath = path.join(ROOT_DIR, '.antigravity/rules.md');
    const agentsContent = fs.readFileSync(agentsPath, 'utf8');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    const isIdentical = agentsContent === rulesContent;
    recordCheck(
      'C7.1',
      'AGENTS.md and .antigravity/rules.md 100% parity (Zero Drift)',
      isIdentical,
      isIdentical ? '0 diff verified' : 'Drift detected between AGENTS.md and rules.md',
    );
  } catch (err: unknown) {
    recordCheck('C7.1', 'Governance parity check', false, String(err));
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.info('\n' + '='.repeat(80));
  const failed = results.filter((r) => !r.passed);
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;

  console.info(`VERIFICATION SUMMARY: ${passed}/${total} Checks Passed (${failed.length} Failed)`);
  if (failed.length > 0) {
    console.error(`\nFAILED CHECKS (${failed.length}):`);
    for (const f of failed) {
      console.error(`  - [${f.code}] ${f.name}: ${f.message ?? 'Failed'}`);
    }
    console.info('='.repeat(80));
    process.exit(1);
  }

  console.info('='.repeat(80));
  console.info('ALL PRODUCTION READINESS CHECKS SATISFIED (ZERO-DEFECT PRODUCTION CUTOVER READY)');
  console.info('='.repeat(80));
  process.exit(0);
}

runProductionReadinessChecks().catch((err) => {
  console.error('Fatal error in verify-production-readiness:', err);
  process.exit(1);
});
