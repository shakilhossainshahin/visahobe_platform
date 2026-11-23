import { NextResponse } from 'next/server.js';
import { createMockAuthToken } from '@visahobe/auth';

export async function POST() {
  const token = await createMockAuthToken({
    userId: '00000000-0000-0000-0000-000000000001',
    tenantId: '11111111-1111-1111-1111-111111111111',
    role: 'admin',
    email: 'verifier@visahobe.internal',
    isMfaVerified: true,
    aal: 'aal2',
  });

  const response = NextResponse.json({
    success: true,
    token,
    message: 'MFA challenge verified and session sealed.',
  });

  response.cookies.set('visahobe_session', token, {
    httpOnly: false,
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
  });

  return response;
}
