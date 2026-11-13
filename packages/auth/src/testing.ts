import { SignJWT } from 'jose';
import { DEFAULT_AUTH_CONFIG } from './constants.js';
import type { TokenClaims, UserSession } from './types.js';

export interface CreateMockTokenOptions {
  userId?: string | undefined;
  tenantId?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
  isMfaVerified?: boolean | undefined;
  aal?: 'aal1' | 'aal2' | undefined;
  expiresIn?: string | number | undefined; // e.g. '1h', -10 for expired
  issuer?: string | undefined;
  audience?: string | undefined;
  secret?: string | undefined;
  extraClaims?: Record<string, unknown> | undefined;
}

export async function createMockAuthToken(options?: CreateMockTokenOptions): Promise<string> {
  const secretKey = new TextEncoder().encode(options?.secret ?? DEFAULT_AUTH_CONFIG.jwtSecret);

  const userId = options?.userId ?? '00000000-0000-0000-0000-000000000001';
  const tenantId = options?.tenantId ?? '11111111-1111-1111-1111-111111111111';
  const role = options?.role ?? 'client';
  const email = options?.email ?? 'test@visahobe.com';
  const isMfaVerified = options?.isMfaVerified ?? false;
  const aal = options?.aal ?? (isMfaVerified ? 'aal2' : 'aal1');

  const claims: TokenClaims = {
    sub: userId,
    email,
    tenant_id: tenantId,
    role,
    aal,
    is_mfa_verified: isMfaVerified,
    amr: isMfaVerified ? ['password', 'totp'] : ['password'],
    app_metadata: {
      tenant_id: tenantId,
      role,
    },
    ...options?.extraClaims,
  };

  const signer = new SignJWT(claims as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(options?.issuer ?? DEFAULT_AUTH_CONFIG.issuer)
    .setAudience(options?.audience ?? DEFAULT_AUTH_CONFIG.audience)
    .setIssuedAt();

  if (typeof options?.expiresIn === 'number') {
    // Unix timestamp directly
    signer.setExpirationTime(options.expiresIn);
  } else {
    signer.setExpirationTime(options?.expiresIn ?? '2h');
  }

  return signer.sign(secretKey);
}

export function createMockAuthContext(overrides?: Partial<UserSession>): UserSession {
  const userId = overrides?.userId ?? '00000000-0000-0000-0000-000000000001';
  const tenantId = overrides?.tenantId ?? '11111111-1111-1111-1111-111111111111';
  const role = overrides?.role ?? 'client';
  const isMfaVerified = overrides?.isMfaVerified ?? false;

  return {
    userId,
    email: overrides?.email ?? 'test@visahobe.com',
    tenantId,
    role,
    isMfaVerified,
    aal: overrides?.aal ?? (isMfaVerified ? 'aal2' : 'aal1'),
    claims: {
      sub: userId,
      tenant_id: tenantId,
      role,
      is_mfa_verified: isMfaVerified,
      ...overrides?.claims,
    },
    ...overrides,
  };
}
