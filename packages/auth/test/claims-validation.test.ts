import { describe, expect, it } from 'vitest';
import {
  authenticateSession,
  createMockAuthToken,
  InvalidAudienceError,
  InvalidIssuerError,
  InvalidTokenError,
  MissingTenantClaimError,
  TokenExpiredError,
  validateJwtClaims,
} from '../src/index.js';

describe('Strict Cryptographic JWT Claims Validation', () => {
  const validTenantId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const validUserId = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';

  it('should validate a correctly signed token and return a UserSession', async () => {
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: validTenantId,
      role: 'case_manager',
      email: 'manager@visahobe.com',
      isMfaVerified: true,
    });

    const session = await validateJwtClaims(token);

    expect(session.userId).toBe(validUserId);
    expect(session.tenantId).toBe(validTenantId);
    expect(session.role).toBe('case_manager');
    expect(session.email).toBe('manager@visahobe.com');
    expect(session.isMfaVerified).toBe(true);
    expect(session.aal).toBe('aal2');
  });

  it('should immediately reject an expired token with TokenExpiredError', async () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 60; // 60s ago
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: validTenantId,
      expiresIn: pastTimestamp,
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(TokenExpiredError);
  });

  it('should reject a token with a tampered or invalid cryptographic signature', async () => {
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: validTenantId,
      secret: 'another_secret_that_does_not_match_at_least_32_characters_long',
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(InvalidTokenError);
  });

  it('should reject a token with an invalid or untrusted issuer', async () => {
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: validTenantId,
      issuer: 'https://malicious-issuer.com/auth',
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(InvalidIssuerError);
  });

  it('should reject a token with an untrusted audience', async () => {
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: validTenantId,
      audience: 'untrusted_audience',
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(InvalidAudienceError);
  });

  it('should reject a token with a non-UUID subject (sub)', async () => {
    const token = await createMockAuthToken({
      userId: 'not-a-valid-uuid',
      tenantId: validTenantId,
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(InvalidTokenError);
  });

  it('should reject a token missing the mandatory tenant_id claim', async () => {
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: '',
      extraClaims: {
        tenant_id: undefined,
        org_id: undefined,
        app_metadata: {},
      },
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(MissingTenantClaimError);
  });

  it('should reject a token with a non-UUID tenant_id claim', async () => {
    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: 'invalid-tenant-slug',
    });

    await expect(validateJwtClaims(token)).rejects.toThrow(MissingTenantClaimError);
  });

  it('should strictly derive tenantId from token and ignore client-supplied x-tenant-id header', async () => {
    const actualTenantId = validTenantId;
    const spoofedTenantId = '99999999-9999-4999-9999-999999999999';

    const token = await createMockAuthToken({
      userId: validUserId,
      tenantId: actualTenantId,
      role: 'client',
    });

    const session = await authenticateSession({
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'x-tenant-id': spoofedTenantId, // Malicious spoof attempt
      },
    });

    // Verified session must reflect token claims, ignoring the header completely
    expect(session.tenantId).toBe(actualTenantId);
    expect(session.tenantId).not.toBe(spoofedTenantId);
  });
});
