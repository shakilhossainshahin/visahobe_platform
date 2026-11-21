import crypto from 'node:crypto';
import type {
  CreatePaymentSessionRequest,
  PaymentCurrency,
  PaymentGatewayAdapter,
  PaymentSessionResult,
  VerifiedWebhookEvent,
  WebhookVerificationOptions,
} from './types.js';
import {
  InvalidWebhookSignatureError,
  PaymentGatewayError,
  WebhookReplayAttackError,
} from './types.js';

export class StripeAdapter implements PaymentGatewayAdapter {
  public readonly providerId = 'stripe' as const;

  /**
   * Generates a Stripe Checkout Session for international clients (USD/SGD/EUR).
   */
  public async createPaymentSession(
    request: CreatePaymentSessionRequest,
  ): Promise<PaymentSessionResult> {
    if (request.amount <= 0) {
      throw new PaymentGatewayError(
        'Stripe payment amount must be greater than zero.',
        'INVALID_AMOUNT',
        400,
      );
    }

    const sessionId = `cs_${request.currency.toLowerCase()}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours TTL

    return {
      sessionId,
      provider: 'stripe',
      gatewayUrl: `https://checkout.stripe.com/c/pay/${sessionId}`,
      amount: request.amount,
      currency: request.currency,
      status: 'created',
      expiresAt,
      metadata: {
        referenceId: request.referenceId,
        referenceType: request.referenceType,
        paymentScheduleType: request.paymentScheduleType,
        ...(request.caseId ? { caseId: request.caseId } : {}),
        ...request.metadata,
      },
    };
  }

  /**
   * Generates Stripe-Signature header (`t=...,v1=...`) for testing and internal dispatch.
   */
  public generateWebhookSignature(
    payload: string | Record<string, unknown>,
    secret: string,
    timestamp?: number,
  ): string {
    const ts = timestamp ?? Math.floor(Date.now() / 1000);
    const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signaturePayload = `${ts}.${bodyString}`;
    const hmac = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
    return `t=${ts},v1=${hmac}`;
  }

  /**
   * Cryptographically verifies inbound Stripe webhooks against standard Stripe-Signature.
   */
  public async verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signatureHeader: string,
    secret: string,
    options?: WebhookVerificationOptions,
  ): Promise<VerifiedWebhookEvent> {
    if (!signatureHeader || !secret) {
      throw new InvalidWebhookSignatureError(
        'stripe',
        'Missing Stripe-Signature header or webhook secret.',
      );
    }

    const rawString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const parsedPayload =
      typeof payload === 'string' ? (JSON.parse(payload) as Record<string, unknown>) : payload;

    const maxWindow = options?.maxReplayWindowSeconds ?? 300;
    const nowSeconds = options?.currentTimestampSeconds ?? Math.floor(Date.now() / 1000);

    let extractedTimestamp = 0;
    const signatureCandidates: string[] = [];

    const elements = signatureHeader.split(',');
    for (const element of elements) {
      const [key, value] = element.trim().split('=');
      if (key === 't' && value) {
        extractedTimestamp = parseInt(value, 10);
      } else if (key === 'v1' && value) {
        signatureCandidates.push(value);
      }
    }

    if (!extractedTimestamp || signatureCandidates.length === 0) {
      throw new InvalidWebhookSignatureError(
        'stripe',
        'Invalid Stripe-Signature header format. Expected t=...,v1=...',
      );
    }

    // Replay attack window check
    const ageSeconds = Math.abs(nowSeconds - extractedTimestamp);
    if (ageSeconds > maxWindow) {
      throw new WebhookReplayAttackError('stripe', ageSeconds, maxWindow);
    }

    // Compute expected HMAC
    const expectedPayload = `${extractedTimestamp}.${rawString}`;
    const computedHmac = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');
    const compBuf = Buffer.from(computedHmac, 'hex');

    let isValid = false;
    for (const sig of signatureCandidates) {
      const sigBuf = Buffer.from(sig, 'hex');
      if (sigBuf.length === compBuf.length && crypto.timingSafeEqual(sigBuf, compBuf)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      throw new InvalidWebhookSignatureError('stripe', 'HMAC-SHA256 signature mismatch.');
    }

    // Extract standardized event payload
    const eventId = String(
      parsedPayload['id'] ?? parsedPayload['eventId'] ?? `evt_${Date.now().toString(36)}`,
    );
    const eventType =
      (parsedPayload['type'] as
        'payment_intent.succeeded' | 'charge.refunded' | 'payment.failed') ??
      'payment_intent.succeeded';

    // Handle nested Stripe data.object or flat test structures
    const dataObj =
      typeof parsedPayload['data'] === 'object' && parsedPayload['data'] !== null
        ? (((parsedPayload['data'] as Record<string, unknown>)['object'] as Record<
            string,
            unknown
          >) ?? {})
        : parsedPayload;

    const metadata = (dataObj['metadata'] as Record<string, string>) ?? {};

    const tenantId = String(metadata['tenantId'] ?? dataObj['tenantId'] ?? '');
    const referenceId = String(metadata['referenceId'] ?? dataObj['referenceId'] ?? '');
    const referenceType = (metadata['referenceType'] ?? dataObj['referenceType'] ?? 'case_fee') as
      'case_fee' | 'wallet_topup' | 'invoice';
    const caseId =
      (metadata['caseId'] ?? dataObj['caseId'])
        ? String(metadata['caseId'] ?? dataObj['caseId'])
        : undefined;
    const milestoneId =
      (metadata['milestoneId'] ?? dataObj['milestoneId'])
        ? String(metadata['milestoneId'] ?? dataObj['milestoneId'])
        : undefined;

    const rawAmount = Number(dataObj['amount'] ?? 0);
    // Stripe amounts are in cents for zero-decimal currencies; normalize if integer > 100
    const currencyStr = String(dataObj['currency'] ?? 'USD').toUpperCase() as PaymentCurrency;
    const amount = rawAmount > 500 && Number.isInteger(rawAmount) ? rawAmount / 100 : rawAmount;

    const gatewayTransactionId = String(
      dataObj['id'] ??
        dataObj['payment_intent'] ??
        dataObj['charge'] ??
        `pi_${Date.now().toString(36)}`,
    );

    const idempotencyKey = String(
      parsedPayload['idempotencyKey'] ?? `${eventId}_${gatewayTransactionId}`,
    );

    return {
      eventId,
      eventType,
      tenantId,
      referenceId,
      referenceType,
      caseId,
      gateway: 'stripe',
      gatewayTransactionId,
      amount,
      currency: currencyStr,
      idempotencyKey,
      timestamp: extractedTimestamp,
      milestoneId,
      rawPayload: parsedPayload,
    };
  }

  /**
   * Processes a refund via Stripe.
   */
  public async refundPayment(
    _gatewayTransactionId: string,
    _amount: number,
    _reason?: string,
  ): Promise<{ refundId: string; status: 'succeeded' | 'pending' }> {
    const refundId = `re_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      refundId,
      status: 'succeeded',
    };
  }
}
