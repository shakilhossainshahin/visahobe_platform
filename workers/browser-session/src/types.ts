export type BrowserSessionStatus =
  'provisioning' | 'active' | 'paused_safety_gate' | 'paused_human_takeover' | 'terminated';

export type BrowserTakeoverMode = 'view_only' | 'interactive';

export interface BrowserSessionConfig {
  tenantId: string;
  caseId: string;
  destinationCountry: string;
  portalUrl: string;
  targetDomainAllowlist?: string[] | undefined;
  idleTimeoutMs?: number | undefined; // Default: 10 minutes (600,000 ms)
  enableCdpScreencast?: boolean | undefined;
}

export interface BrowserSessionRecord {
  id: string;
  tenantId: string;
  caseId: string;
  destinationCountry: string;
  portalUrl: string;
  status: BrowserSessionStatus;
  currentUrl: string;
  allowedDomains: string[];
  vncPort: number;
  noVncPort: number;
  cdpPort: number;
  streamUrl: string;
  isClientViewOnly: boolean;
  takeoverMode: BrowserTakeoverMode;
  safetyPauseReason?: string | undefined;
  blockedAction?: string | undefined;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface StreamTokenPayload {
  sub: string;
  tenant_id: string;
  case_id: string;
  session_id: string;
  role: string;
  view_only: boolean;
  can_takeover: boolean;
  exp: number;
  iat: number;
}

export interface CdpScreencastFrame {
  sessionId: string;
  frameIndex: number;
  timestamp: string;
  dataBase64?: string | undefined;
  metadata: {
    width: number;
    height: number;
    maskedFieldsCount: number;
  };
}

export class DomainNotAllowedError extends Error {
  readonly statusCode = 403;
  readonly code = 'DOMAIN_NOT_ALLOWED';

  constructor(domain: string, allowedDomains: string[]) {
    super(
      `Navigation to domain '${domain}' blocked: not in permitted consular allowlist [${allowedDomains.join(
        ', ',
      )}].`,
    );
    this.name = 'DomainNotAllowedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BrowserSessionNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'BROWSER_SESSION_NOT_FOUND';

  constructor(sessionId: string) {
    super(`Browser session '${sessionId}' was not found.`);
    this.name = 'BrowserSessionNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StreamAuthError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, code: string = 'STREAM_AUTH_ERROR', statusCode: number = 401) {
    super(message);
    this.name = 'StreamAuthError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StreamTokenExpiredError extends StreamAuthError {
  constructor(message: string = 'Stream token has expired.') {
    super(message, 'STREAM_TOKEN_EXPIRED', 401);
    this.name = 'StreamTokenExpiredError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StreamAccessDeniedError extends StreamAuthError {
  constructor(message: string = 'Cross-tenant or unauthorized stream access denied.') {
    super(message, 'STREAM_ACCESS_DENIED', 403);
    this.name = 'StreamAccessDeniedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TakeoverNotPermittedError extends Error {
  readonly statusCode = 403;
  readonly code = 'TAKEOVER_NOT_PERMITTED';

  constructor(role: string) {
    super(
      `Interactive takeover not permitted for role '${role}'. Only 'browser_operator', 'admin', or 'owner' are authorized.`,
    );
    this.name = 'TakeoverNotPermittedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
