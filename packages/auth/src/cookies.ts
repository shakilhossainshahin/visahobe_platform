import { randomBytes } from 'crypto';
import { DEFAULT_AUTH_CONFIG } from './constants.js';
import { CsrfValidationError } from './errors.js';
import type { CookieOptions } from './types.js';

export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return {};
  }

  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }

  return cookies;
}

export function serializeCookie(options: CookieOptions): string {
  const parts: string[] = [
    `${options.name}=${encodeURIComponent(options.value)}`,
    `Path=${options.path ?? '/'}`,
  ];

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  if (options.secure !== false) {
    parts.push('Secure');
  }

  const sameSite = options.sameSite ?? 'lax';
  parts.push(`SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1).toLowerCase()}`);

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  return parts.join('; ');
}

export function createSessionCookie(token: string, options?: Partial<CookieOptions>): string {
  const isProduction = DEFAULT_AUTH_CONFIG.isProduction;
  return serializeCookie({
    name: options?.name ?? DEFAULT_AUTH_CONFIG.sessionCookieName,
    value: token,
    httpOnly: true,
    secure: options?.secure ?? isProduction,
    sameSite: options?.sameSite ?? 'lax',
    path: options?.path ?? '/',
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 7 days
    ...options,
  });
}

export function createCsrfCookie(csrfToken: string, options?: Partial<CookieOptions>): string {
  const isProduction = DEFAULT_AUTH_CONFIG.isProduction;
  return serializeCookie({
    name: options?.name ?? DEFAULT_AUTH_CONFIG.csrfCookieName,
    value: csrfToken,
    httpOnly: false, // Accessible by frontend JS for Double Submit Cookie pattern
    secure: options?.secure ?? isProduction,
    sameSite: options?.sameSite ?? 'lax',
    path: options?.path ?? '/',
    maxAge: options?.maxAge ?? 60 * 60 * 24, // 24 hours
    ...options,
  });
}

export function createClearCookie(name: string, path = '/'): string {
  return serializeCookie({
    name,
    value: '',
    httpOnly: true,
    secure: DEFAULT_AUTH_CONFIG.isProduction,
    sameSite: 'lax',
    path,
    maxAge: 0,
    expires: new Date(0),
  });
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCsrfProtection(request: {
  method?: string | undefined;
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string> | undefined;
}): void {
  const method = (request.method || 'GET').toUpperCase();
  // Safe HTTP verbs do not require CSRF token validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return;
  }

  const cookies = request.cookies || {};
  const hasSessionCookie = Boolean(cookies[DEFAULT_AUTH_CONFIG.sessionCookieName]);

  // If request is authenticated via Cookie, CSRF validation is MANDATORY
  if (hasSessionCookie) {
    const headerValue =
      request.headers['x-csrf-token'] ||
      request.headers['X-CSRF-Token'] ||
      request.headers['x-requested-with'] ||
      request.headers['X-Requested-With'];

    const clientCsrfToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    const cookieCsrfToken = cookies[DEFAULT_AUTH_CONFIG.csrfCookieName];

    if (!clientCsrfToken) {
      throw new CsrfValidationError('Missing required CSRF verification header (x-csrf-token)');
    }

    // If double-submit cookie is present, values must match exactly
    if (cookieCsrfToken && clientCsrfToken !== cookieCsrfToken) {
      throw new CsrfValidationError('CSRF token mismatch between header and cookie');
    }
  }
}
