import { describe, expect, it } from 'vitest';
import {
  PayStationAdapter,
  StripeAdapter,
  PaymentGatewayRegistry,
  InvalidWebhookSignatureError,
  WebhookReplayAttackError,
} from '../src/index.js';

describe('Payment Gateway Adapters & Webhook Security (ADR-010)', () => {
  const payStation = new PayStationAdapter();
  const stripe = new StripeAdapter();
  const testSecret = 'whsec_test_secret_key_8492049104';

  describe('Pay Station Adapter (BDT / South Asia Gateway)', () => {
    it('creates an upfront full payment session with BDT currency', async () => {
      const session = await payStation.createPaymentSession({
        tenantId: 'tenant-bengal-01',
        referenceId: 'inv-101',
        referenceType: 'case_fee',
        caseId: 'case-sg-01',
        amount: 8500,
        currency: 'BDT',
        paymentScheduleType: 'upfront_full',
        customerEmail: 'applicant@gmail.com',
        customerName: 'Rahim Khan',
        redirectUrl: 'https://visahobe.com/success',
      });

      expect(session.sessionId).toContain('ps_sess_');
      expect(session.provider).toBe('pay_station');
      expect(session.amount).toBe(8500);
      expect(session.currency).toBe('BDT');
      expect(session.gatewayUrl).toContain('paystation.com.bd');
      expect(session.status).toBe('created');
    });

    it('creates a milestone split payment schedule', async () => {
      const session = await payStation.createPaymentSession({
        tenantId: 'tenant-bengal-01',
        referenceId: 'inv-102',
        referenceType: 'case_fee',
        caseId: 'case-sg-02',
        amount: 15000,
        currency: 'BDT',
        paymentScheduleType: 'milestone_split',
        milestones: [
          {
            id: 'ms-1',
            name: 'Initial Review & Dossier Prep (40%)',
            percentage: 40,
            amount: 6000,
            status: 'pending',
          },
          {
            id: 'ms-2',
            name: 'Consular Submission & Decision (60%)',
            percentage: 60,
            amount: 9000,
            status: 'pending',
          },
        ],
        customerEmail: 'applicant@gmail.com',
        customerName: 'Rahim Khan',
        redirectUrl: 'https://visahobe.com/success',
      });

      expect(session.amount).toBe(15000);
      expect(session.metadata?.['paymentScheduleType']).toBe('milestone_split');
    });

    it('verifies valid Pay Station cryptographic webhook signature', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        eventId: 'evt-ps-99',
        tenantId: 'tenant-bengal-01',
        referenceId: 'inv-101',
        referenceType: 'case_fee',
        caseId: 'case-sg-01',
        amount: 8500,
        currency: 'BDT',
        gatewayTransactionId: 'trx-bkash-77492',
        idempotencyKey: 'idem-ps-99-trx-77492',
      };

      const signature = payStation.generateWebhookSignature(payload, testSecret, now);
      const verified = await payStation.verifyWebhookSignature(payload, signature, testSecret, {
        currentTimestampSeconds: now,
      });

      expect(verified.eventId).toBe('evt-ps-99');
      expect(verified.gateway).toBe('pay_station');
      expect(verified.amount).toBe(8500);
      expect(verified.currency).toBe('BDT');
      expect(verified.gatewayTransactionId).toBe('trx-bkash-77492');
      expect(verified.idempotencyKey).toBe('idem-ps-99-trx-77492');
    });

    it('rejects tampered Pay Station webhook signature', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { eventId: 'evt-ps-100', amount: 8500 };
      const invalidSignature = 't=' + now + ',v1=deadbeefcafebabe00112233445566778899aabbccddeeff';

      await expect(
        payStation.verifyWebhookSignature(payload, invalidSignature, testSecret, {
          currentTimestampSeconds: now,
        }),
      ).rejects.toThrow(InvalidWebhookSignatureError);
    });

    it('rejects replayed Pay Station webhook outside the 300s window', async () => {
      const now = 1700000000;
      const expiredTimestamp = now - 350; // 350 seconds ago (> 300s)
      const payload = { eventId: 'evt-ps-old', amount: 8500 };
      const signature = payStation.generateWebhookSignature(payload, testSecret, expiredTimestamp);

      await expect(
        payStation.verifyWebhookSignature(payload, signature, testSecret, {
          currentTimestampSeconds: now,
          maxReplayWindowSeconds: 300,
        }),
      ).rejects.toThrow(WebhookReplayAttackError);
    });
  });

  describe('Stripe Adapter (USD / SGD / EUR International Gateway)', () => {
    it('creates an international USD Stripe Checkout session', async () => {
      const session = await stripe.createPaymentSession({
        tenantId: 'tenant-global-01',
        referenceId: 'inv-stripe-201',
        referenceType: 'case_fee',
        caseId: 'case-sg-ep-01',
        amount: 250,
        currency: 'USD',
        paymentScheduleType: 'upfront_full',
        customerEmail: 'executive@corp.com',
        customerName: 'Alex Tan',
        redirectUrl: 'https://visahobe.com/success',
      });

      expect(session.sessionId).toContain('cs_usd_');
      expect(session.provider).toBe('stripe');
      expect(session.amount).toBe(250);
      expect(session.currency).toBe('USD');
      expect(session.gatewayUrl).toContain('checkout.stripe.com');
    });

    it('verifies standard Stripe-Signature header with replay protection', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        id: 'evt_stripe_301',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_3MtwBwLkdIwHu7ix28a3tqPa',
            amount: 25000, // 250.00 USD in cents
            currency: 'usd',
            metadata: {
              tenantId: 'tenant-global-01',
              referenceId: 'inv-stripe-201',
              referenceType: 'case_fee',
              caseId: 'case-sg-ep-01',
            },
          },
        },
      };

      const signature = stripe.generateWebhookSignature(payload, testSecret, now);
      const verified = await stripe.verifyWebhookSignature(payload, signature, testSecret, {
        currentTimestampSeconds: now,
      });

      expect(verified.eventId).toBe('evt_stripe_301');
      expect(verified.gateway).toBe('stripe');
      expect(verified.amount).toBe(250);
      expect(verified.currency).toBe('USD');
      expect(verified.gatewayTransactionId).toBe('pi_3MtwBwLkdIwHu7ix28a3tqPa');
      expect(verified.tenantId).toBe('tenant-global-01');
    });

    it('rejects tampered or forged Stripe signatures', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { id: 'evt_forged', amount: 500 };
      const invalidSig = `t=${now},v1=bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0`;

      await expect(
        stripe.verifyWebhookSignature(payload, invalidSig, testSecret, {
          currentTimestampSeconds: now,
        }),
      ).rejects.toThrow(InvalidWebhookSignatureError);
    });

    it('rejects Stripe webhook past the 300s replay window', async () => {
      const now = 1700000000;
      const expiredTimestamp = now - 600; // 10 minutes old
      const payload = { id: 'evt_expired', amount: 500 };
      const signature = stripe.generateWebhookSignature(payload, testSecret, expiredTimestamp);

      await expect(
        stripe.verifyWebhookSignature(payload, signature, testSecret, {
          currentTimestampSeconds: now,
        }),
      ).rejects.toThrow(WebhookReplayAttackError);
    });
  });

  describe('PaymentGatewayRegistry', () => {
    it('routes BDT currency to Pay Station adapter', () => {
      const adapter = PaymentGatewayRegistry.resolveAdapterForCurrency('BDT');
      expect(adapter.providerId).toBe('pay_station');
    });

    it('routes USD and SGD currencies to Stripe adapter', () => {
      expect(PaymentGatewayRegistry.resolveAdapterForCurrency('USD').providerId).toBe('stripe');
      expect(PaymentGatewayRegistry.resolveAdapterForCurrency('SGD').providerId).toBe('stripe');
      expect(PaymentGatewayRegistry.resolveAdapterForCurrency('EUR').providerId).toBe('stripe');
    });

    it('lists registered providers', () => {
      const providers = PaymentGatewayRegistry.listRegisteredProviders();
      expect(providers).toContain('pay_station');
      expect(providers).toContain('stripe');
    });
  });
});
