import { describe, it, expect } from 'vitest';
import { GET, POST } from '../app/api/browser/route.js';

describe('Super Admin Live Browser Worker API (/api/browser)', () => {
  it('GET /api/browser returns worker health and supported gateways', async () => {
    const req = new Request('http://localhost:3002/api/browser', { method: 'GET' });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.workerStatus).toBe('healthy');
    expect(json.activeSessionsCount).toBe(3);
    expect(json.supportedGateways).toContain('Singapore MOM');
  });

  it('GET /api/browser?sessionId=xxx returns session status', async () => {
    const req = new Request('http://localhost:3002/api/browser?sessionId=sess-brw-sg-4921', {
      method: 'GET',
    });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.session.sessionId).toBe('sess-brw-sg-4921');
    expect(json.session.destinationCountry).toBe('SG');
  });

  it('POST /api/browser generates signed stream token via StreamAuth', async () => {
    const req = new Request('http://localhost:3002/api/browser', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate_stream_token',
        sessionId: 'sess-brw-sg-4921',
        caseId: 'VH-2026-SG-4921',
        tenantId: 'tenant-super-admin',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.streamToken).toBeTruthy();
    expect(json.streamEndpoint).toContain('sess-brw-sg-4921');
    expect(json.expiresInSeconds).toBe(900);
  });
});
