import { NextResponse } from 'next/server.js';
import type { NextRequest } from 'next/server.js';
import { validateJwtClaims, isPrivilegedStaffRole } from '@visahobe/auth';

/**
 * Public routes that do not require staff session or MFA enforcement.
 */
const PUBLIC_PATHS = [
  '/mfa-verify',
  '/login',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/robots.txt',
];

/**
 * Next.js Edge Middleware for Super Admin Command Center.
 * Strictly enforces:
 * 1. Valid staff JWT with verified tenant_id
 * 2. Mandatory MFA (AAL2) verification on all operations routes
 * 3. Granular RBAC boundary checks
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static assets and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  // 2. Extract session token from Authorization header or HttpOnly cookie
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let token = '';

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    token = request.cookies.get('visahobe_session')?.value || '';
  }

  // If unauthenticated, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Cryptographic Token Validation & Tenant Boundary Check
  try {
    const session = await validateJwtClaims(token);

    // Verify staff role
    if (!isPrivilegedStaffRole(session.role)) {
      // Non-staff clients cannot access super-admin command center
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_role');
      return NextResponse.redirect(loginUrl);
    }

    // 4. Mandatory Staff MFA Enforcement (AAL2)
    if (!session.isMfaVerified) {
      const mfaUrl = new URL('/mfa-verify', request.url);
      mfaUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(mfaUrl);
    }

    // 5. Granular RBAC Route Boundaries
    const role = session.role.toLowerCase();

    // CMS Editorial requires cms_editor, admin, or owner
    if (pathname.startsWith('/cms')) {
      const allowedCmsRoles = ['cms_editor', 'admin', 'owner'];
      if (!allowedCmsRoles.includes(role)) {
        const forbiddenUrl = new URL('/', request.url);
        forbiddenUrl.searchParams.set('error', 'insufficient_permissions');
        return NextResponse.redirect(forbiddenUrl);
      }
    }

    // Audit logs viewer requires admin, owner, or developer_reviewer
    if (pathname.startsWith('/logs')) {
      const allowedLogRoles = ['admin', 'owner', 'developer_reviewer'];
      if (!allowedLogRoles.includes(role)) {
        const forbiddenUrl = new URL('/', request.url);
        forbiddenUrl.searchParams.set('error', 'insufficient_permissions');
        return NextResponse.redirect(forbiddenUrl);
      }
    }

    // Forward verified session headers to downstream server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-tenant-id', session.tenantId);
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-mfa-verified', 'true');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Malformed, expired or invalid signature token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'invalid_session');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
