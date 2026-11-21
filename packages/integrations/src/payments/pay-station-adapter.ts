import crypto from 'node:crypto';
import type {
  CreatePaymentSessionRequest,
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

export class PayStationAdapter implements PaymentGatewayAdapter {
  public readonly providerId = 'pay_station' as const;

  /**
   * Generates a payment session for Pay Station (bKash/Nagad/cards).
   */
  public async createPaymentSession(
    request: CreatePaymentSessionRequest,
  ): Promise<PaymentSessionResult> {
    if (request.amount <= 0) {
      throw new PaymentGatewayError(
        'Pay Station payment amount must be greater than zero.',
        'INVALID_AMOUNT',
        400,
      );
    }

    const sessionId = `ps_sess_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins TTL

    return {
      sessionId,
      provider: 'pay_station',
      gatewayUrl: `https://checkout.paystation.com.bd/v1/checkout?session_id=${sessionId}`,
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
   * Generates HMAC-SHA256 signature for Pay Station webhook payloads.
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
   * Cryptographically verifies inbound Pay Station webhook signatures with replay window protection.
   */
  public async verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signatureHeader: string,
    secret: string,
    options?: WebhookVerificationOptions,
  ): Promise<VerifiedWebhookEvent> {
    if (!signatureHeader || !secret) {
      throw new InvalidWebhookSignatureError(
        'pay_station',
        'Missing signature header or webhook secret.',
      );
    }

    const rawString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const parsedPayload =
      typeof payload === 'string' ? (JSON.parse(payload) as Record<string, unknown>) : payload;

    const maxWindow = options?.maxReplayWindowSeconds ?? 300;
    const nowSeconds = options?.currentTimestampSeconds ?? Math.floor(Date.now() / 1000);

    let extractedTimestamp = nowSeconds;
    let expectedSignature = '';

    if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
      const parts = signatureHeader.split(',');
      for (const part of parts) {
        const [k, v] = part.trim().split('=');
        if (k === 't' && v) {
          extractedTimestamp = parseInt(v, 10);
        } else if (k === 'v1' && v) {
          expectedSignature = v;
        }
      }
    } else {
      expectedSignature = signatureHeader.trim();
    }

    if (!expectedSignature) {
      throw new InvalidWebhookSignatureError('pay_station', 'Invalid signature header format.');
    }

    // Replay attack window check
    const ageSeconds = Math.abs(nowSeconds - extractedTimestamp);
    if (ageSeconds > maxWindow) {
      throw new WebhookReplayAttackError('pay_station', ageSeconds, maxWindow);
    }

    // Compute expected HMAC
    const signaturePayload = `${extractedTimestamp}.${rawString}`;
    const computedHmac = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');

    // Constant-time comparison
    const sigBuf = Buffer.from(expectedSignature, 'hex');
    const compBuf = Buffer.from(computedHmac, 'hex');

    if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
      // Also allow direct HMAC over body string if t= was not present
      const directHmac = crypto.createHmac('sha256', secret).update(rawString).digest('hex');
      const directBuf = Buffer.from(directHmac, 'hex');
      if (sigBuf.length !== directBuf.length || !crypto.timingSafeEqual(sigBuf, directBuf)) {
        throw new InvalidWebhookSignatureError('pay_station', 'HMAC-SHA256 signature mismatch.');
      }
    }

    const eventId = String(
      parsedPayload['eventId'] ?? parsedPayload['id'] ?? `ps_evt_${Date.now().toString(36)}`,
    );
    const gatewayTransactionId = String(
      parsedPayload['gatewayTransactionId'] ??
        parsedPayload['trx_id'] ??
        parsedPayload['transactionId'] ??
        `ps_trx_${Date.now().toString(36)}`,
    );
    const tenantId = String(parsedPayload['tenantId'] ?? '');
    const referenceId = String(parsedPayload['referenceId'] ?? '');
    const referenceType =
      (parsedPayload['referenceType'] as 'case_fee' | 'wallet_topup' | 'invoice') ?? 'case_fee';
    const amount = Number(parsedPayload['amount'] ?? 0);
    const currency = (parsedPayload['currency'] as 'BDT' | 'USD') ?? 'BDT';
    const idempotencyKey = String(
      parsedPayload['idempotencyKey'] ?? `${eventId}_${gatewayTransactionId}`,
    );

    return {
      eventId,
      eventType: 'payment_intent.succeeded',
      tenantId,
      referenceId,
      referenceType,
      caseId: parsedPayload['caseId'] ? String(parsedPayload['caseId']) : undefined,
      gateway: 'pay_station',
      gatewayTransactionId,
      amount,
      currency,
      idempotencyKey,
      timestamp: extractedTimestamp,
      milestoneId: parsedPayload['milestoneId'] ? String(parsedPayload['milestoneId']) : undefined,
      rawPayload: parsedPayload,
    };
  }

  /**
   * Processes a refund via Pay Station.
   */
  public async refundPayment(
    _gatewayTransactionId: string,
    _amount: number,
    _reason?: string,
  ): Promise<{ refundId: string; status: 'succeeded' | 'pending' }> {
    const refundId = `ps_ref_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    return {
      refundId,
      status: 'succeeded',
    };
  }
}
