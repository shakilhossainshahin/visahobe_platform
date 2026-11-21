import { randomUUID } from 'node:crypto';
import type { UserSession } from '@visahobe/auth';
import { ConsularSafetyGuard, type ConsularActionType } from '@visahobe/agents';
import { ConsularFieldMapper } from '@visahobe/browser-automation';
import {
  BrowserSessionNotFoundError,
  DomainNotAllowedError,
  TakeoverNotPermittedError,
  type BrowserSessionConfig,
  type BrowserSessionRecord,
  type CdpScreencastFrame,
} from './types.js';

export const DEFAULT_IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes (ADR-005/ADR-011)

export class BrowserSessionManager {
  private static sessions: Map<string, BrowserSessionRecord> = new Map();

  public static clear(): void {
    BrowserSessionManager.sessions.clear();
  }

  /**
   * Helper to extract normalized hostname from URL.
   */
  public static extractHostname(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.toLowerCase();
    } catch {
      return urlStr.toLowerCase().trim();
    }
  }

  /**
   * Checks whether a target hostname matches any allowed domain in the allowlist.
   */
  public static isDomainAllowed(targetHost: string, allowedDomains: string[]): boolean {
    const cleanTarget = targetHost.toLowerCase().trim();
    return allowedDomains.some((allowed) => {
      const cleanAllowed = allowed.toLowerCase().trim();
      return cleanTarget === cleanAllowed || cleanTarget.endsWith(`.${cleanAllowed}`);
    });
  }

  /**
   * Provisions an isolated, short-lived browser session per tenant_id and case_id.
   */
  public static async createSession(config: BrowserSessionConfig): Promise<BrowserSessionRecord> {
    const country = config.destinationCountry.trim().toUpperCase();
    const portalConfig = ConsularFieldMapper.getPortalConfig(country);

    // Build comprehensive allowlist: official portal domains + custom config domains + destination government domains
    const baseAllowed = portalConfig.allowedDomains ?? [];
    const customAllowed = config.targetDomainAllowlist ?? [];
    const combinedAllowed = Array.from(new Set([...baseAllowed, ...customAllowed])).map((d) =>
      d.toLowerCase().trim(),
    );

    // Validate initial portal URL against allowlist
    const initialHost = BrowserSessionManager.extractHostname(config.portalUrl);
    if (!BrowserSessionManager.isDomainAllowed(initialHost, combinedAllowed)) {
      throw new DomainNotAllowedError(initialHost, combinedAllowed);
    }

    const sessionId = `sess-brw-${randomUUID().slice(0, 12)}`;
    const now = new Date();
    const idleTimeoutMs = config.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS;
    const expiresAt = new Date(now.getTime() + idleTimeoutMs).toISOString();

    const vncPort = 5900;
    const noVncPort = 6080;
    const cdpPort = 9222;

    const sessionRecord: BrowserSessionRecord = {
      id: sessionId,
      tenantId: config.tenantId,
      caseId: config.caseId,
      destinationCountry: country,
      portalUrl: config.portalUrl,
      status: 'active',
      currentUrl: config.portalUrl,
      allowedDomains: combinedAllowed,
      vncPort,
      noVncPort,
      cdpPort,
      streamUrl: `wss://stream.visahobe.internal/vnc/${sessionId}`,
      isClientViewOnly: true,
      takeoverMode: 'view_only',
      lastActivityAt: now.toISOString(),
      createdAt: now.toISOString(),
      expiresAt,
      metadata: {
        enableCdpScreencast: config.enableCdpScreencast ?? true,
      },
    };

    BrowserSessionManager.sessions.set(sessionId, sessionRecord);
    return sessionRecord;
  }

  /**
   * Retrieves an active browser session with tenant boundary validation.
   */
  public static getSession(sessionId: string, expectedTenantId?: string): BrowserSessionRecord {
    const session = BrowserSessionManager.sessions.get(sessionId);
    if (!session) {
      throw new BrowserSessionNotFoundError(sessionId);
    }

    if (expectedTenantId && session.tenantId !== expectedTenantId) {
      throw new BrowserSessionNotFoundError(sessionId);
    }

    return session;
  }

  /**
   * Validates target navigation URL against the session's consular domain allowlist.
   * Throws DomainNotAllowedError if outside boundary.
   */
  public static validateNavigation(sessionId: string, targetUrl: string): boolean {
    const session = BrowserSessionManager.getSession(sessionId);
    const targetHost = BrowserSessionManager.extractHostname(targetUrl);

    if (!BrowserSessionManager.isDomainAllowed(targetHost, session.allowedDomains)) {
      throw new DomainNotAllowedError(targetHost, session.allowedDomains);
    }

    session.currentUrl = targetUrl;
    session.lastActivityAt = new Date().toISOString();
    return true;
  }

  /**
   * Redacts sensitive applicant PII (passports, cards, passwords, CVV) for live viewing & logs.
   */
  public static applyPiiInputMask(
    fieldId: string,
    rawValue: string,
  ): { isMasked: boolean; maskedValue: string } {
    const cleanId = fieldId.toLowerCase().trim();
    const val = rawValue.trim();

    if (
      cleanId.includes('passport') ||
      cleanId.includes('pass_num') ||
      cleanId.includes('document_number')
    ) {
      if (val.length <= 4) return { isMasked: true, maskedValue: '****' };
      return {
        isMasked: true,
        maskedValue: `${val.slice(0, 2)}${'*'.repeat(val.length - 4)}${val.slice(-2)}`,
      };
    }

    if (
      cleanId.includes('card') ||
      cleanId.includes('credit') ||
      cleanId.includes('cvv') ||
      cleanId.includes('password') ||
      cleanId.includes('pin') ||
      cleanId.includes('secret')
    ) {
      return { isMasked: true, maskedValue: '********' };
    }

    if (cleanId.includes('dob') || cleanId.includes('birth')) {
      const match = val.match(/^(\d{4})[-/.]/);
      return {
        isMasked: true,
        maskedValue: match ? `${match[1]}-**-**` : '****-**-**',
      };
    }

    return { isMasked: false, maskedValue: rawValue };
  }

  /**
   * Evaluates action checkpoints for Consular Safety Gates (ADR-011) and CAPTCHA/MFA challenges.
   * Automatically pauses browser session when human intervention is mandated.
   */
  public static evaluateSafetyCheckpoint(
    sessionId: string,
    action: { actionType: ConsularActionType | string; details?: string },
  ): { shouldPause: boolean; reason?: string } {
    const session = BrowserSessionManager.getSession(sessionId);
    const actionType = action.actionType as ConsularActionType;

    // 1. Mandatory Consular Safety Gate (ADR-011 §3.2)
    if (ConsularSafetyGuard.isRestrictedAction(actionType)) {
      let specificReason = 'Consular Safety Gate: high-risk action requires human authorization.';
      if (actionType === 'portal_payment') {
        specificReason =
          'Autonomous execution of live consular portal payment is strictly forbidden. Human financial authorization required.';
      } else if (actionType === 'schedule_biometrics') {
        specificReason =
          'Autonomous irreversible scheduling of biometric/consular appointments is strictly forbidden. Human inspection required.';
      } else if (actionType === 'sign_perjury_affidavit') {
        specificReason =
          'Autonomous signing of statutory affidavits under penalty of perjury is strictly forbidden. Human applicant sign-off required.';
      }

      session.status = 'paused_safety_gate';
      session.safetyPauseReason = specificReason;
      session.blockedAction = actionType;
      session.lastActivityAt = new Date().toISOString();

      return { shouldPause: true, reason: specificReason };
    }

    // 2. CAPTCHA / Bot Gate / MFA Challenge Detection
    const detailsLower = (action.details ?? '').toLowerCase();
    const actionLower = (action.actionType ?? '').toLowerCase();
    if (
      actionLower.includes('captcha') ||
      detailsLower.includes('captcha') ||
      detailsLower.includes('cloudflare') ||
      detailsLower.includes('recaptcha') ||
      detailsLower.includes('hcaptcha') ||
      detailsLower.includes('mfa_prompt') ||
      detailsLower.includes('otp_required')
    ) {
      const reason = `Automated execution paused: verification challenge encountered (${action.details ?? action.actionType}). Human takeover required.`;
      session.status = 'paused_safety_gate';
      session.safetyPauseReason = reason;
      session.blockedAction = 'verification_challenge';
      session.lastActivityAt = new Date().toISOString();

      return { shouldPause: true, reason };
    }

    return { shouldPause: false };
  }

  /**
   * Authorizes human takeover for privileged operators ('browser_operator', 'admin', 'owner').
   * Rejects client and unauthorized roles with TakeoverNotPermittedError.
   */
  public static async requestHumanTakeover(
    sessionId: string,
    operatorSession: UserSession,
  ): Promise<BrowserSessionRecord> {
    const session = BrowserSessionManager.getSession(sessionId);

    // Operator role check
    const allowedRoles = ['browser_operator', 'admin', 'owner'];
    if (!allowedRoles.includes(operatorSession.role)) {
      throw new TakeoverNotPermittedError(operatorSession.role);
    }

    // Tenant check (staff owner/admin can inspect cross-tenant with staff session; browser_operator strictly within tenant)
    if (
      operatorSession.role === 'browser_operator' &&
      operatorSession.tenantId !== session.tenantId
    ) {
      throw new TakeoverNotPermittedError('browser_operator (cross-tenant prohibited)');
    }

    session.status = 'paused_human_takeover';
    session.takeoverMode = 'interactive';
    session.lastActivityAt = new Date().toISOString();

    return session;
  }

  /**
   * Releases human takeover, returning session to active view-only mode.
   */
  public static async releaseHumanTakeover(
    sessionId: string,
    operatorSession: UserSession,
  ): Promise<BrowserSessionRecord> {
    const session = BrowserSessionManager.getSession(sessionId);

    const allowedRoles = ['browser_operator', 'admin', 'owner'];
    if (!allowedRoles.includes(operatorSession.role)) {
      throw new TakeoverNotPermittedError(operatorSession.role);
    }

    session.status = 'active';
    session.takeoverMode = 'view_only';
    session.safetyPauseReason = undefined;
    session.blockedAction = undefined;
    session.lastActivityAt = new Date().toISOString();

    return session;
  }

  /**
   * Scans and cleans up expired/idle browser container sessions (10m TTL).
   * Returns count of terminated sessions.
   */
  public static cleanupIdleSessions(currentTimeMs?: number): number {
    const nowMs = currentTimeMs ?? Date.now();
    let cleanedCount = 0;

    for (const [id, session] of BrowserSessionManager.sessions.entries()) {
      if (session.status === 'terminated') {
        BrowserSessionManager.sessions.delete(id);
        continue;
      }

      const expiresMs = new Date(session.expiresAt).getTime();
      if (nowMs >= expiresMs) {
        session.status = 'terminated';
        BrowserSessionManager.sessions.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Explicitly terminates a browser session.
   */
  public static async terminateSession(
    sessionId: string,
    tenantId: string,
  ): Promise<BrowserSessionRecord> {
    const session = BrowserSessionManager.getSession(sessionId, tenantId);
    session.status = 'terminated';
    BrowserSessionManager.sessions.delete(sessionId);
    return session;
  }

  /**
   * Generates lightweight CDP screencast frame metadata for low-bandwidth client fallback.
   */
  public static generateScreencastFrame(sessionId: string, frameIndex: number): CdpScreencastFrame {
    const session = BrowserSessionManager.getSession(sessionId);
    return {
      sessionId: session.id,
      frameIndex,
      timestamp: new Date().toISOString(),
      metadata: {
        width: 1280,
        height: 800,
        maskedFieldsCount: 3,
      },
    };
  }
}
