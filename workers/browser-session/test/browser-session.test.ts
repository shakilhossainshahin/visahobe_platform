import { describe, it, expect, beforeEach } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import {
  BrowserSessionManager,
  DomainNotAllowedError,
  BrowserSessionNotFoundError,
  TakeoverNotPermittedError,
  StreamAuth,
  StreamAccessDeniedError,
  StreamTokenExpiredError,
  DEFAULT_IDLE_TIMEOUT_MS,
} from '../src/index.js';

describe('Worker: Browser Session — Isolated Live Browser & Stream Gateway', () => {
  const staffSession: UserSession = {
    userId: 'usr-admin-01',
    email: 'admin@visahobe.com',
    role: 'admin',
    tenantId: 'tenant-visahobe-platform',
    isMfaVerified: true,
    aal: 'aal2',
  };

  const operatorSession: UserSession = {
    userId: 'usr-operator-01',
    email: 'operator@visahobe.com',
    role: 'browser_operator',
    tenantId: 'tenant-visahobe-platform',
    isMfaVerified: true,
    aal: 'aal2',
  };

  const clientSession: UserSession = {
    userId: 'usr-client-01',
    email: 'applicant@gmail.com',
    role: 'client',
    tenantId: 'tenant-visahobe-platform',
    isMfaVerified: false,
    aal: 'aal1',
  };

  const otherTenantSession: UserSession = {
    userId: 'usr-other-01',
    email: 'other@foreign.com',
    role: 'client',
    tenantId: 'tenant-foreign-agency',
    isMfaVerified: false,
    aal: 'aal1',
  };

  beforeEach(() => {
    BrowserSessionManager.clear();
  });

  describe('1. BrowserSessionManager — Provisioning & Lifecycle', () => {
    it('provisions isolated browser session with 10m TTL and consular domain allowlist', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-sg-001',
        destinationCountry: 'SG',
        portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
      });

      expect(session.id).toMatch(/^sess-brw-/);
      expect(session.status).toBe('active');
      expect(session.destinationCountry).toBe('SG');
      expect(session.allowedDomains).toContain('ica.gov.sg');
      expect(session.allowedDomains).toContain('eservices.ica.gov.sg');
      expect(session.isClientViewOnly).toBe(true);
      expect(session.takeoverMode).toBe('view_only');
      expect(session.vncPort).toBe(5900);
      expect(session.noVncPort).toBe(6080);
      expect(session.cdpPort).toBe(9222);

      const expiresMs = new Date(session.expiresAt).getTime();
      const createdMs = new Date(session.createdAt).getTime();
      expect(expiresMs - createdMs).toBe(DEFAULT_IDLE_TIMEOUT_MS);
    });

    it('rejects initial portal URL if not permitted in consular domain allowlist', async () => {
      await expect(
        BrowserSessionManager.createSession({
          tenantId: 'tenant-visahobe-platform',
          caseId: 'case-sg-002',
          destinationCountry: 'SG',
          portalUrl: 'https://malicious-phishing-site.com/fake-login',
        }),
      ).rejects.toThrow(DomainNotAllowedError);
    });

    it('enforces domain allowlist on live navigation attempts', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-sg-003',
        destinationCountry: 'SG',
        portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
      });

      // Allowed sub-page navigation
      const allowed = BrowserSessionManager.validateNavigation(
        session.id,
        'https://eservices.ica.gov.sg/sgarrivalcard/form/step2',
      );
      expect(allowed).toBe(true);

      // Blocked external arbitrary domain
      expect(() =>
        BrowserSessionManager.validateNavigation(session.id, 'https://attacker.com/steal-creds'),
      ).toThrow(DomainNotAllowedError);
    });

    it('automatically cleans up idle sessions past 10-minute TTL', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-sg-004',
        destinationCountry: 'SG',
        portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
      });

      // Not expired yet
      const activeCleaned = BrowserSessionManager.cleanupIdleSessions(Date.now());
      expect(activeCleaned).toBe(0);

      // Fast forward past 10m TTL
      const futureTime = Date.now() + DEFAULT_IDLE_TIMEOUT_MS + 5000;
      const expiredCleaned = BrowserSessionManager.cleanupIdleSessions(futureTime);
      expect(expiredCleaned).toBe(1);

      // Session should no longer be retrievable
      expect(() => BrowserSessionManager.getSession(session.id)).toThrow(
        BrowserSessionNotFoundError,
      );
    });
  });

  describe('2. PII Input Redaction & Consular Safety Gate Pause', () => {
    it('redacts sensitive applicant fields (passport, credit cards, CVV, passwords)', () => {
      // Passport masking
      const passportRes = BrowserSessionManager.applyPiiInputMask('passportNumber', 'A12345678');
      expect(passportRes.isMasked).toBe(true);
      expect(passportRes.maskedValue).toBe('A1*****78');

      // Card & CVV masking
      const cardRes = BrowserSessionManager.applyPiiInputMask(
        'creditCardNumber',
        '4111111111111234',
      );
      expect(cardRes.isMasked).toBe(true);
      expect(cardRes.maskedValue).toBe('********');

      const cvvRes = BrowserSessionManager.applyPiiInputMask('card_cvv', '999');
      expect(cvvRes.isMasked).toBe(true);
      expect(cvvRes.maskedValue).toBe('********');

      // Password masking
      const pwdRes = BrowserSessionManager.applyPiiInputMask('accountPassword', 'SuperSecret!123');
      expect(pwdRes.isMasked).toBe(true);
      expect(pwdRes.maskedValue).toBe('********');

      // Date of birth partial masking
      const dobRes = BrowserSessionManager.applyPiiInputMask('dateOfBirth', '1992-08-14');
      expect(dobRes.isMasked).toBe(true);
      expect(dobRes.maskedValue).toBe('1992-**-**');

      // Non-sensitive fields unmasked
      const nameRes = BrowserSessionManager.applyPiiInputMask('applicantGivenName', 'John');
      expect(nameRes.isMasked).toBe(false);
      expect(nameRes.maskedValue).toBe('John');
    });

    it('pauses session automatically when encountering restricted consular safety gates', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-ae-001',
        destinationCountry: 'AE',
        portalUrl: 'https://smartservices.icp.gov.ae/echannels/web/client/default.html',
      });

      // 1. Live portal payment attempt
      const paymentCheck = BrowserSessionManager.evaluateSafetyCheckpoint(session.id, {
        actionType: 'portal_payment',
        details: 'Attempting fee payment AED 250 on ICP portal',
      });
      expect(paymentCheck.shouldPause).toBe(true);
      expect(paymentCheck.reason).toContain(
        'Autonomous execution of live consular portal payment is strictly forbidden',
      );

      const updated1 = BrowserSessionManager.getSession(session.id);
      expect(updated1.status).toBe('paused_safety_gate');
      expect(updated1.blockedAction).toBe('portal_payment');

      // 2. Biometric scheduling attempt
      const bioCheck = BrowserSessionManager.evaluateSafetyCheckpoint(session.id, {
        actionType: 'schedule_biometrics',
      });
      expect(bioCheck.shouldPause).toBe(true);
      expect(bioCheck.reason).toContain('irreversible scheduling of biometric');

      // 3. Statutory perjury affidavit attempt
      const affidavitCheck = BrowserSessionManager.evaluateSafetyCheckpoint(session.id, {
        actionType: 'sign_perjury_affidavit',
      });
      expect(affidavitCheck.shouldPause).toBe(true);
      expect(affidavitCheck.reason).toContain('under penalty of perjury');
    });

    it('pauses session on CAPTCHA / bot challenge encounters', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-tr-001',
        destinationCountry: 'TR',
        portalUrl: 'https://www.evisa.gov.tr/en/',
      });

      const captchaCheck = BrowserSessionManager.evaluateSafetyCheckpoint(session.id, {
        actionType: 'captcha_detected',
        details: 'Cloudflare Turnstile challenge encountered',
      });

      expect(captchaCheck.shouldPause).toBe(true);
      expect(captchaCheck.reason).toContain('Human takeover required');

      const updated = BrowserSessionManager.getSession(session.id);
      expect(updated.status).toBe('paused_safety_gate');
      expect(updated.blockedAction).toBe('verification_challenge');
    });
  });

  describe('3. Human Takeover Mode & Operator Authorization', () => {
    it('authorizes interactive takeover strictly for browser_operator / admin / owner', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-tr-002',
        destinationCountry: 'TR',
        portalUrl: 'https://www.evisa.gov.tr/en/',
      });

      // 1. Operator requests takeover
      const takeoverSession = await BrowserSessionManager.requestHumanTakeover(
        session.id,
        operatorSession,
      );
      expect(takeoverSession.status).toBe('paused_human_takeover');
      expect(takeoverSession.takeoverMode).toBe('interactive');

      // 2. Operator releases takeover back to automated view-only
      const releasedSession = await BrowserSessionManager.releaseHumanTakeover(
        session.id,
        operatorSession,
      );
      expect(releasedSession.status).toBe('active');
      expect(releasedSession.takeoverMode).toBe('view_only');

      // 3. Admin staff requests takeover as well
      const adminTakeover = await BrowserSessionManager.requestHumanTakeover(
        session.id,
        staffSession,
      );
      expect(adminTakeover.status).toBe('paused_human_takeover');
      expect(adminTakeover.takeoverMode).toBe('interactive');
      await BrowserSessionManager.releaseHumanTakeover(session.id, staffSession);
    });

    it('rejects client takeover requests with TakeoverNotPermittedError', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-tr-003',
        destinationCountry: 'TR',
        portalUrl: 'https://www.evisa.gov.tr/en/',
      });

      await expect(
        BrowserSessionManager.requestHumanTakeover(session.id, clientSession),
      ).rejects.toThrow(TakeoverNotPermittedError);
    });

    it('generates CDP screencast frame metadata for low-bandwidth client fallback', async () => {
      const session = await BrowserSessionManager.createSession({
        tenantId: 'tenant-visahobe-platform',
        caseId: 'case-sg-005',
        destinationCountry: 'SG',
        portalUrl: 'https://eservices.ica.gov.sg/sgarrivalcard/',
      });

      const frame = BrowserSessionManager.generateScreencastFrame(session.id, 1);
      expect(frame.sessionId).toBe(session.id);
      expect(frame.frameIndex).toBe(1);
      expect(frame.metadata.width).toBe(1280);
      expect(frame.metadata.height).toBe(800);
    });
  });

  describe('4. StreamAuth — Short-Lived JWT Stream Tokens & Cross-Tenant Defense', () => {
    it('issues stream token forcing view_only: true for client role', async () => {
      const token = await StreamAuth.issueStreamToken(clientSession, {
        sessionId: 'sess-brw-001',
        caseId: 'case-001',
      });

      expect(typeof token).toBe('string');

      const verified = await StreamAuth.verifyStreamToken(token, {
        expectedTenantId: clientSession.tenantId,
        expectedSessionId: 'sess-brw-001',
      });

      expect(verified.sub).toBe(clientSession.userId);
      expect(verified.tenant_id).toBe(clientSession.tenantId);
      expect(verified.role).toBe('client');
      expect(verified.view_only).toBe(true); // STRICT VIEW-ONLY ENFORCEMENT
      expect(verified.can_takeover).toBe(false);
    });

    it('authorizes can_takeover: true for browser_operator / admin', async () => {
      const token = await StreamAuth.issueStreamToken(operatorSession, {
        sessionId: 'sess-brw-002',
        caseId: 'case-002',
      });

      const verified = await StreamAuth.verifyStreamToken(token, {
        expectedTenantId: operatorSession.tenantId,
      });

      expect(verified.role).toBe('browser_operator');
      expect(verified.view_only).toBe(false);
      expect(verified.can_takeover).toBe(true);
    });

    it('strictly rejects cross-tenant stream token presentation', async () => {
      const foreignToken = await StreamAuth.issueStreamToken(otherTenantSession, {
        sessionId: 'sess-brw-003',
        caseId: 'case-003',
      });

      // Attempting to verify against primary tenant must be rejected
      await expect(
        StreamAuth.verifyStreamToken(foreignToken, {
          expectedTenantId: 'tenant-visahobe-platform',
        }),
      ).rejects.toThrow(StreamAccessDeniedError);
    });

    it('rejects expired stream tokens with StreamTokenExpiredError', async () => {
      const expiredToken = await StreamAuth.issueStreamToken(clientSession, {
        sessionId: 'sess-brw-004',
        caseId: 'case-004',
        expiresInSeconds: -10, // already expired
      });

      await expect(
        StreamAuth.verifyStreamToken(expiredToken, {
          expectedTenantId: clientSession.tenantId,
        }),
      ).rejects.toThrow(StreamTokenExpiredError);
    });
  });
});
