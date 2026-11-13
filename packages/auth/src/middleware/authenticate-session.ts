import { parseCookies, validateCsrfProtection } from '../cookies.js';
import { DEFAULT_AUTH_CONFIG } from '../constants.js';
import { InvalidTokenError } from '../errors.js';
import { validateJwtClaims } from '../token.js';
import type { AuthenticateRequestInput, AuthConfig, UserSession } from '../types.js';

export async function authenticateSession(
  request: AuthenticateRequestInput,
  customConfig?: Partial<AuthConfig>,
): Promise<UserSession> {
  const config = { ...DEFAULT_AUTH_CONFIG, ...customConfig };

  // Parse cookies if string or object
  const cookieHeader = request.headers['cookie'] || request.headers['Cookie'];
  const cookies =
    request.cookies || (typeof cookieHeader === 'string' ? parseCookies(cookieHeader) : {});

  // 1. Run CSRF protection on state-changing requests
  validateCsrfProtection({
    method: request.method,
    headers: request.headers,
    cookies,
  });

  // 2. Extract Token: Authorization header takes precedence, then session cookie
  const authHeader = request.headers['authorization'] || request.headers['Authorization'];

  let token: string | undefined;

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (Array.isArray(authHeader) && authHeader[0]?.startsWith('Bearer ')) {
    token = authHeader[0].slice(7).trim();
  } else if (cookies[config.sessionCookieName]) {
    token = cookies[config.sessionCookieName];
  }

  if (!token) {
    throw new InvalidTokenError(
      'No authentication token provided in Authorization header or session cookie',
    );
  }

  // 3. Cryptographically validate token and verify tenant boundary
  // Note: Client-supplied 'x-tenant-id' headers are intentionally ignored here
  // and superseded by the cryptographic session claims.
  const session = await validateJwtClaims(token, config);

  return session;
}
