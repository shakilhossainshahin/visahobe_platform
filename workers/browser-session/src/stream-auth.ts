import { SignJWT, jwtVerify } from 'jose';
import type { UserSession } from '@visahobe/auth';
import {
  StreamAccessDeniedError,
  StreamAuthError,
  StreamTokenExpiredError,
  type StreamTokenPayload,
} from './types.js';

export interface IssueStreamTokenOptions {
  sessionId: string;
  caseId: string;
  expiresInSeconds?: number | undefined; // Default: 900 (15 minutes)
  secret?: string | undefined;
}

export interface VerifyStreamTokenOptions {
  expectedTenantId: string;
  expectedSessionId?: string | undefined;
  secret?: string | undefined;
}

const DEFAULT_STREAM_SECRET = 'visahobe-dev-stream-jwt-secret-key-32chars!';
const STREAM_ISSUER = 'visahobe-stream-gateway';
const STREAM_AUDIENCE = 'visahobe-browser-stream';

export class StreamAuth {
  /**
   * Issues a short-lived JWT stream token strictly scoping client views to view-only mode.
   * Only privileged roles ('browser_operator', 'admin', 'owner') may receive interactive takeover tokens.
   */
  public static async issueStreamToken(
    userSession: UserSession,
    options: IssueStreamTokenOptions,
  ): Promise<string> {
    if (!userSession || !userSession.tenantId) {
      throw new StreamAuthError('Missing user session or tenantId for stream token issuance.');
    }

    const secretKey = new TextEncoder().encode(
      options.secret ?? process.env.STREAM_JWT_SECRET ?? DEFAULT_STREAM_SECRET,
    );

    const ttlSeconds = options.expiresInSeconds ?? 900; // 15 min TTL
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSeconds;

    // Zero-Trust Role Restriction:
    // Client role is ALWAYS locked to view-only mode (-viewonly)
    const isClient = userSession.role === 'client';
    const canTakeover = ['browser_operator', 'admin', 'owner'].includes(userSession.role);
    const viewOnly = isClient || !canTakeover;

    const payload: StreamTokenPayload = {
      sub: userSession.userId,
      tenant_id: userSession.tenantId,
      case_id: options.caseId,
      session_id: options.sessionId,
      role: userSession.role,
      view_only: viewOnly,
      can_takeover: canTakeover,
      exp,
      iat: now,
    };

    const token = await new SignJWT(payload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userSession.userId)
      .setIssuer(STREAM_ISSUER)
      .setAudience(STREAM_AUDIENCE)
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(secretKey);

    return token;
  }

  /**
   * Verifies a stream token, strictly enforcing tenant isolation and expiration.
   */
  public static async verifyStreamToken(
    token: string,
    options: VerifyStreamTokenOptions,
  ): Promise<StreamTokenPayload> {
    if (!token || typeof token !== 'string') {
      throw new StreamAuthError('Stream token must be a non-empty string.');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const secretKey = new TextEncoder().encode(
      options.secret ?? process.env.STREAM_JWT_SECRET ?? DEFAULT_STREAM_SECRET,
    );

    let payload: StreamTokenPayload;
    try {
      const verified = await jwtVerify(cleanToken, secretKey, {
        issuer: STREAM_ISSUER,
        audience: STREAM_AUDIENCE,
      });
      payload = verified.payload as unknown as StreamTokenPayload;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'ERR_JWT_EXPIRED') {
        throw new StreamTokenExpiredError();
      }
      throw new StreamAuthError(
        `Stream token cryptographic verification failed: ${error.message ?? 'Invalid token'}`,
      );
    }

    // Cross-Tenant Boundary Invariant: Reject token if tenantId does not match
    if (payload.tenant_id !== options.expectedTenantId) {
      throw new StreamAccessDeniedError(
        `Cross-tenant stream access denied: token tenant '${payload.tenant_id}' does not match expected '${options.expectedTenantId}'.`,
      );
    }

    // Verify Session ID match if specified
    if (options.expectedSessionId && payload.session_id !== options.expectedSessionId) {
      throw new StreamAccessDeniedError(
        `Session mismatch: token session '${payload.session_id}' does not match expected '${options.expectedSessionId}'.`,
      );
    }

    return payload;
  }
}
