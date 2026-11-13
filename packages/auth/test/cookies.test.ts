import { describe, expect, it } from 'vitest';
import {
  createCsrfCookie,
  createSessionCookie,
  CsrfValidationError,
  generateCsrfToken,
  parseCookies,
  serializeCookie,
  validateCsrfProtection,
} from '../src/index.js';

describe('Secure Session Cookie Handling & CSRF Protection', () => {
  it('should serialize session cookies with HttpOnly, Secure, SameSite=Lax, and Path=/', () => {
    const token = 'sample_jwt_session_token';
    const cookieHeader = createSessionCookie(token, { secure: true });

    expect(cookieHeader).toContain('visahobe_session=sample_jwt_session_token');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('Secure');
    expect(cookieHeader).toContain('SameSite=Lax');
    expect(cookieHeader).toContain('Path=/');
    expect(cookieHeader).toContain('Max-Age=');
  });

  it('should serialize custom cookies using serializeCookie', () => {
    const serialized = serializeCookie({
      name: 'custom_cookie',
      value: 'custom_val',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api',
      maxAge: 3600,
    });
    expect(serialized).toContain('custom_cookie=custom_val');
    expect(serialized).toContain('HttpOnly');
    expect(serialized).toContain('Secure');
    expect(serialized).toContain('SameSite=Strict');
    expect(serialized).toContain('Path=/api');
    expect(serialized).toContain('Max-Age=3600');
  });

  it('should serialize CSRF cookies readable by frontend for Double Submit pattern', () => {
    const csrfToken = generateCsrfToken();
    const cookieHeader = createCsrfCookie(csrfToken, { secure: true });

    expect(cookieHeader).toContain(`visahobe_csrf=${csrfToken}`);
    expect(cookieHeader).not.toContain('HttpOnly'); // accessible to JavaScript
    expect(cookieHeader).toContain('Secure');
    expect(cookieHeader).toContain('SameSite=Lax');
    expect(cookieHeader).toContain('Path=/');
  });

  it('should accurately parse raw Cookie request header strings', () => {
    const rawCookie = 'visahobe_session=jwt_val; visahobe_csrf=csrf_val; other=test_val';
    const parsed = parseCookies(rawCookie);

    expect(parsed.visahobe_session).toBe('jwt_val');
    expect(parsed.visahobe_csrf).toBe('csrf_val');
    expect(parsed.other).toBe('test_val');
  });

  it('should allow safe HTTP methods without CSRF verification headers', () => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    for (const method of safeMethods) {
      expect(() =>
        validateCsrfProtection({
          method,
          headers: {},
          cookies: { visahobe_session: 'some_token' },
        }),
      ).not.toThrow();
    }
  });

  it('should reject state-changing requests authenticated via cookies if CSRF header is missing', () => {
    const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    for (const method of stateChangingMethods) {
      expect(() =>
        validateCsrfProtection({
          method,
          headers: {},
          cookies: { visahobe_session: 'some_token' },
        }),
      ).toThrow(CsrfValidationError);
    }
  });

  it('should reject state-changing requests if CSRF header does not match CSRF cookie', () => {
    expect(() =>
      validateCsrfProtection({
        method: 'POST',
        headers: { 'x-csrf-token': 'mismatched_client_token' },
        cookies: {
          visahobe_session: 'some_session',
          visahobe_csrf: 'real_server_cookie_token',
        },
      }),
    ).toThrow(CsrfValidationError);
  });

  it('should accept state-changing requests when CSRF header matches CSRF cookie', () => {
    const csrfToken = generateCsrfToken();
    expect(() =>
      validateCsrfProtection({
        method: 'POST',
        headers: { 'x-csrf-token': csrfToken },
        cookies: {
          visahobe_session: 'some_session',
          visahobe_csrf: csrfToken,
        },
      }),
    ).not.toThrow();
  });
});
