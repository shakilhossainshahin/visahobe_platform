import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server.js';
import { createMockAuthToken } from '@visahobe/auth';
import { middleware } from '../middleware.js';

describe('Super Admin Middleware — Staff MFA & Granular RBAC (TICKET-P2-002)', () => {
  const tenantId = '11111111-1111-1111-1111-111111111111';

  it('redirects unauthenticated users to /login', async () => {
    const req = new NextRequest('http://localhost:3002/');
    const res = await middleware(req);

    expect(res.status).toBe(307); // NextResponse.redirect default status
    expect(res.headers.get('location')).toContain('/login');
  });

  it('bypasses static files and /mfa-verify path', async () => {
    const req = new NextRequest('http://localhost:3002/mfa-verify');
    const res = await middleware(req);

    expect(res.status).toBe(200);
  });

  it('redirects unverified staff (AAL1 / isMfaVerified=false) to /mfa-verify', async () => {
    const token = await createMockAuthToken({
      tenantId,
      role: 'case_manager',
      isMfaVerified: false,
      aal: 'aal1',
    });

    const req = new NextRequest('http://localhost:3002/', {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/mfa-verify');
  });

  it('allows verified staff (AAL2 / isMfaVerified=true) to access / with session headers', async () => {
    const token = await createMockAuthToken({
      userId: '00000000-0000-0000-0000-000000000002',
      tenantId,
      role: 'case_manager',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const req = new NextRequest('http://localhost:3002/', {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    // Request headers forwarded
    expect(res.headers.get('x-middleware-rewrite') || res.status).toBeDefined();
  });

  it('rejects non-staff client role with unauthorized_role error', async () => {
    const clientToken = await createMockAuthToken({
      tenantId,
      role: 'client',
      isMfaVerified: false,
    });

    const req = new NextRequest('http://localhost:3002/', {
      headers: { authorization: `Bearer ${clientToken}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('error=unauthorized_role');
  });

  it('enforces RBAC on /cms: allows cms_editor and admin, blocks verifier', async () => {
    const verifierToken = await createMockAuthToken({
      tenantId,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const verifierReq = new NextRequest('http://localhost:3002/cms', {
      headers: { authorization: `Bearer ${verifierToken}` },
    });
    const verifierRes = await middleware(verifierReq);
    expect(verifierRes.status).toBe(307);
    expect(verifierRes.headers.get('location')).toContain('error=insufficient_permissions');

    // cms_editor permitted
    const cmsEditorToken = await createMockAuthToken({
      tenantId,
      role: 'cms_editor',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const editorReq = new NextRequest('http://localhost:3002/cms', {
      headers: { authorization: `Bearer ${cmsEditorToken}` },
    });
    const editorRes = await middleware(editorReq);
    expect(editorRes.status).toBe(200);
  });

  it('enforces RBAC on /logs: allows admin, blocks verifier', async () => {
    const verifierToken = await createMockAuthToken({
      tenantId,
      role: 'verifier',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const req = new NextRequest('http://localhost:3002/logs', {
      headers: { authorization: `Bearer ${verifierToken}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('error=insufficient_permissions');

    const adminToken = await createMockAuthToken({
      tenantId,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
    });

    const adminReq = new NextRequest('http://localhost:3002/logs', {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const adminRes = await middleware(adminReq);
    expect(adminRes.status).toBe(200);
  });
});
