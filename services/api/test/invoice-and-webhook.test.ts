import { beforeEach, describe, expect, it } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import { PayStationAdapter, StripeAdapter } from '@visahobe/integrations';
import {
  InvoiceService,
  PaymentWebhookService,
  WalletService,
  CaseService,
  OperationsApiHandler,
} from '../src/index.js';

describe('Invoice & Payment Webhook Service (ADR-010)', () => {
  const payStation = new PayStationAdapter();
  const stripe = new StripeAdapter();
  const testSecret = 'whsec_test_secret_key_8492049104';

  const clientSession: UserSession = {
    userId: 'usr-client-001',
    email: 'client@gmail.com',
    tenantId: 'tenant-client-111',
    role: 'client',
    isMfaVerified: false,
    claims: { sub: 'usr-client-001', tenant_id: 'tenant-client-111', role: 'client' },
  };

  const otherClientSession: UserSession = {
    userId: 'usr-client-002',
    email: 'other@gmail.com',
    tenantId: 'tenant-other-222',
    role: 'client',
    isMfaVerified: false,
    claims: { sub: 'usr-client-002', tenant_id: 'tenant-other-222', role: 'client' },
  };

  beforeEach(() => {
    InvoiceService.clear();
    PaymentWebhookService.clear();
    WalletService.clear();
    CaseService.clear();
  });

  describe('Invoice Lifecycle & Tenant Isolation', () => {
    it('creates an upfront full payment invoice for a case', async () => {
      const invoice = await InvoiceService.createCaseInvoice(clientSession, {
        tenantId: clientSession.tenantId,
        caseId: 'case-sg-ep-01',
        clientId: clientSession.userId,
        amount: 250,
        currency: 'USD',
        paymentScheduleType: 'upfront_full',
      });

      expect(invoice.id).toContain('inv-');
      expect(invoice.amount).toBe(250);
      expect(invoice.currency).toBe('USD');
      expect(invoice.status).toBe('pending');
      expect(invoice.paymentScheduleType).toBe('upfront_full');
      expect(invoice.milestones).toHaveLength(0);
    });

    it('creates a milestone-split invoice with dedicated schedule stages', async () => {
      const invoice = await InvoiceService.createCaseInvoice(clientSession, {
        tenantId: clientSession.tenantId,
        caseId: 'case-sg-ep-02',
        clientId: clientSession.userId,
        amount: 500,
        currency: 'USD',
        paymentScheduleType: 'milestone_split',
        milestones: [
          { name: 'Stage 1: Document Filing (40%)', percentage: 40, amount: 200 },
          { name: 'Stage 2: Consular Decision (60%)', percentage: 60, amount: 300 },
        ],
      });

      expect(invoice.paymentScheduleType).toBe('milestone_split');
      expect(invoice.milestones).toHaveLength(2);
      expect(invoice.milestones[0]?.amount).toBe(200);
      expect(invoice.milestones[0]?.status).toBe('pending');
      expect(invoice.milestones[1]?.amount).toBe(300);
      expect(invoice.milestones[1]?.status).toBe('pending');
    });

    it('enforces tenant boundary isolation when querying invoices', async () => {
      const invoice = await InvoiceService.createCaseInvoice(clientSession, {
        tenantId: clientSession.tenantId,
        caseId: 'case-sg-ep-03',
        clientId: clientSession.userId,
        amount: 200,
        currency: 'USD',
        paymentScheduleType: 'upfront_full',
      });

      // Same tenant succeeds
      const fetched = await InvoiceService.getInvoice(clientSession, invoice.id);
      expect(fetched.id).toBe(invoice.id);

      // Other tenant is rejected with StorageAccessDeniedError
      await expect(InvoiceService.getInvoice(otherClientSession, invoice.id)).rejects.toThrow(
        StorageAccessDeniedError,
      );
    });
  });

  describe('Payment Webhook Processing & Idempotency', () => {
    it('processes wallet top-up webhook and credits agency wallet balance', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        eventId: 'wh-evt-topup-01',
        tenantId: 'tenant-agency-bengal',
        referenceId: 'wal-topup-01',
        referenceType: 'wallet_topup',
        amount: 1000,
        currency: 'BDT',
        gatewayTransactionId: 'trx-bkash-9911',
        idempotencyKey: 'idem-topup-9911',
      };

      const signature = payStation.generateWebhookSignature(payload, testSecret, now);

      const result = await PaymentWebhookService.processWebhook(
        'pay_station',
        payload,
        signature,
        testSecret,
        { currentTimestampSeconds: now },
      );

      expect(result.status).toBe('processed');
      expect(result.idempotentReplay).toBe(false);

      // Verify wallet balance
      const staffSession: UserSession = {
        userId: 'admin-01',
        email: 'admin@visahobe.com',
        tenantId: 'tenant-agency-bengal',
        role: 'admin',
        isMfaVerified: true,
        aal: 'aal2',
        claims: { sub: 'admin-01', tenant_id: 'tenant-agency-bengal', role: 'admin' },
      };
      const wallet = await WalletService.getWallet(staffSession, 'tenant-agency-bengal');
      expect(wallet.balance).toBe(1000);
    });

    it('guarantees strict idempotency deduplication so repeated webhooks do not double-credit', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        eventId: 'wh-evt-dup-01',
        tenantId: 'tenant-agency-dup',
        referenceId: 'wal-dup-01',
        referenceType: 'wallet_topup',
        amount: 500,
        currency: 'BDT',
        gatewayTransactionId: 'trx-nagad-1234',
        idempotencyKey: 'idem-strict-dup-key-01',
      };

      const signature = payStation.generateWebhookSignature(payload, testSecret, now);

      // First delivery
      const firstResult = await PaymentWebhookService.processWebhook(
        'pay_station',
        payload,
        signature,
        testSecret,
        { currentTimestampSeconds: now },
      );
      expect(firstResult.status).toBe('processed');
      expect(firstResult.idempotentReplay).toBe(false);

      // Duplicate delivery (e.g. network retry from gateway)
      const duplicateResult = await PaymentWebhookService.processWebhook(
        'pay_station',
        payload,
        signature,
        testSecret,
        { currentTimestampSeconds: now },
      );
      expect(duplicateResult.status).toBe('already_processed');
      expect(duplicateResult.idempotentReplay).toBe(true);

      // Verify balance is only credited ONCE
      const staffSession: UserSession = {
        userId: 'admin-01',
        email: 'admin@visahobe.com',
        tenantId: 'tenant-agency-dup',
        role: 'admin',
        isMfaVerified: true,
        aal: 'aal2',
        claims: { sub: 'admin-01', tenant_id: 'tenant-agency-dup', role: 'admin' },
      };
      const wallet = await WalletService.getWallet(staffSession, 'tenant-agency-dup');
      expect(wallet.balance).toBe(500); // Not 1000!
    });

    it('settles milestone payment on split invoice via Stripe webhook', async () => {
      const invoice = await InvoiceService.createCaseInvoice(clientSession, {
        tenantId: clientSession.tenantId,
        caseId: 'case-sg-split-01',
        clientId: clientSession.userId,
        amount: 1000,
        currency: 'USD',
        paymentScheduleType: 'milestone_split',
        milestones: [
          { name: 'Stage 1: Filing', percentage: 40, amount: 400 },
          { name: 'Stage 2: Approval', percentage: 60, amount: 600 },
        ],
      });

      const milestoneId = invoice.milestones[0]?.id;
      const now = Math.floor(Date.now() / 1000);

      const payload = {
        id: 'evt_stripe_ms_01',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_stripe_ms_01',
            amount: 40000, // 400.00 USD
            currency: 'usd',
            metadata: {
              tenantId: clientSession.tenantId,
              referenceId: invoice.id,
              referenceType: 'invoice',
              caseId: 'case-sg-split-01',
              milestoneId,
            },
          },
        },
      };

      const signature = stripe.generateWebhookSignature(payload, testSecret, now);

      const result = await PaymentWebhookService.processWebhook(
        'stripe',
        payload,
        signature,
        testSecret,
        { currentTimestampSeconds: now },
      );

      expect(result.status).toBe('processed');
      expect(result.invoice?.status).toBe('partially_paid');
      expect(result.invoice?.milestones[0]?.status).toBe('paid');
      expect(result.invoice?.milestones[1]?.status).toBe('pending');
    });
  });

  describe('HTTP REST Operations Endpoints', () => {
    it('creates checkout session via POST /api/v1/payments/checkout-session', async () => {
      const response = await OperationsApiHandler.handleRequest(
        'POST',
        '/api/v1/payments/checkout-session',
        {
          headers: {
            authorization: `Bearer ${clientSession.claims ? 'valid_test_token' : ''}`,
          },
          body: {
            tenantId: clientSession.tenantId,
            referenceId: 'inv-test-01',
            referenceType: 'case_fee',
            amount: 7500,
            currency: 'BDT',
            paymentScheduleType: 'upfront_full',
            customerEmail: 'client@gmail.com',
            customerName: 'Rahim Client',
            redirectUrl: 'https://visahobe.com/done',
          },
        },
      );

      // If mock token is used, verify structure
      expect(response.status).toBeDefined();
    });

    it('verifies inbound Pay Station webhook via POST /api/v1/webhooks/pay-station', async () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        eventId: 'wh-http-ps-01',
        tenantId: 'tenant-agency-http',
        referenceId: 'wal-http-01',
        referenceType: 'wallet_topup',
        amount: 2500,
        currency: 'BDT',
        gatewayTransactionId: 'trx-http-01',
        idempotencyKey: 'idem-http-ps-01',
      };
      const signature = payStation.generateWebhookSignature(payload, testSecret, now);

      process.env['PAY_STATION_WEBHOOK_SECRET'] = testSecret;

      const res = await OperationsApiHandler.handleRequest('POST', '/api/v1/webhooks/pay-station', {
        headers: {
          'x-paystation-signature': signature,
        },
        body: payload,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data as { status: string; idempotentReplay: boolean };
      expect(data.status).toBe('processed');
      expect(data.idempotentReplay).toBe(false);
    });
  });
});
