import { jwtVerify } from 'jose';
import { DEFAULT_AUTH_CONFIG, UUID_V4_REGEX } from './constants.js';
import {
  InvalidAudienceError,
  InvalidIssuerError,
  InvalidTokenError,
  MissingTenantClaimError,
  TokenExpiredError,
} from './errors.js';
import type { AuthConfig, TokenClaims, UserSession } from './types.js';

export async function validateJwtClaims(
  token: string,
  customConfig?: Partial<AuthConfig>,
): Promise<UserSession> {
  if (!token || typeof token !== 'string') {
    throw new InvalidTokenError('Authentication token must be a non-empty string');
  }

  // Strip optional 'Bearer ' prefix if passed
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();

  if (!cleanToken) {
    throw new InvalidTokenError('Authentication token is empty');
  }

  const config: AuthConfig = {
    ...DEFAULT_AUTH_CONFIG,
    ...customConfig,
  };

  const secretKey = new TextEncoder().encode(config.jwtSecret);

  let verifiedPayload: TokenClaims;
  try {
    const { payload } = await jwtVerify(cleanToken, secretKey, {
      issuer: config.issuer,
      audience: config.audience,
      clockTolerance: config.clockToleranceSeconds,
    });
    verifiedPayload = payload as TokenClaims;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'ERR_JWT_EXPIRED') {
      throw new TokenExpiredError();
    }
    if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      if (error.message?.includes('iss')) {
        throw new InvalidIssuerError();
      }
      if (error.message?.includes('aud')) {
        throw new InvalidAudienceError();
      }
    }
    throw new InvalidTokenError(error.message || 'Cryptographic verification failed');
  }

  // 1. Verify subject (sub)
  const sub = verifiedPayload.sub;
  if (!sub || typeof sub !== 'string' || !UUID_V4_REGEX.test(sub)) {
    throw new InvalidTokenError('Subject (sub) claim must be a valid UUID');
  }

  // 2. Verify tenant_id / org_id (mandatory tenant boundary)
  const tenantId =
    verifiedPayload.tenant_id ||
    verifiedPayload.org_id ||
    verifiedPayload.app_metadata?.tenant_id ||
    verifiedPayload.app_metadata?.org_id;

  if (!tenantId || typeof tenantId !== 'string' || !UUID_V4_REGEX.test(tenantId)) {
    throw new MissingTenantClaimError(
      'Missing or malformed tenant_id claim in token. Tenant isolation cannot be established.',
    );
  }

  // 3. Extract Role
  const role =
    verifiedPayload.role ||
    verifiedPayload.app_metadata?.role ||
    (Array.isArray(verifiedPayload.roles) && verifiedPayload.roles[0]) ||
    'client';

  // 4. Verify Multi-Factor Authentication (MFA) Status
  const aal = verifiedPayload.aal ?? 'aal1';
  const hasTotpAmr = Array.isArray(verifiedPayload.amr)
    ? verifiedPayload.amr.some((item) => {
        const method = typeof item === 'string' ? item : item.method;
        return method === 'totp' || method === 'mfa' || method === 'webauthn';
      })
    : false;

  const isMfaVerified = aal === 'aal2' || verifiedPayload.is_mfa_verified === true || hasTotpAmr;

  const email = verifiedPayload.email || '';

  return {
    userId: sub,
    email,
    tenantId,
    role,
    isMfaVerified,
    aal: isMfaVerified ? 'aal2' : 'aal1',
    claims: verifiedPayload,
  };
}
