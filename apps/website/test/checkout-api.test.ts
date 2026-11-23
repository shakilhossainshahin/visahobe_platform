import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/checkout/route.js';

describe('Website Payment Checkout API (/api/checkout)', () => {
  it('creates a Pay Station session in BDT with redirect URL', async () => {
    const req = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        gateway: 'paystation',
        amount: 35380,
        currency: 'BDT',
        referenceId: 'VH-2026-SG-4921',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.session.provider).toBe('pay_station');
    expect(json.session.currency).toBe('BDT');
    expect(json.session.amount).toBe(35380);
    expect(json.session.gatewayUrl).toContain('checkout.paystation.com.bd');
  });

  it('creates a Stripe checkout session in USD with redirect URL', async () => {
    const req = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        gateway: 'stripe',
        amount: 290,
        currency: 'USD',
        referenceId: 'VH-2026-SG-4921',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.session.provider).toBe('stripe');
    expect(json.session.currency).toBe('USD');
    expect(json.session.amount).toBe(290);
    expect(json.session.gatewayUrl).toContain('checkout.stripe.com');
  });
});
