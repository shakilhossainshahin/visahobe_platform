/**
 * @visahobe/integrations — Payment Gateway & Webhook Security Types
 * ADR-010 Compliant Payment Processing & Idempotent Verification
 */

export type PaymentProvider = 'pay_station' | 'stripe';
export type PaymentCurrency = 'BDT' | 'USD' | 'SGD' | 'EUR';
export type PaymentScheduleType = 'upfront_full' | 'milestone_split';
export type PaymentMilestoneStatus = 'pending' | 'paid' | 'waived';
export type WebhookEventType = 'payment_intent.succeeded' | 'charge.refunded' | 'payment.failed';

export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  status: PaymentMilestoneStatus;
  dueDate?: string | undefined;
  gatewayTransactionId?: string | undefined;
  paidAt?: string | undefined;
}

export interface CreatePaymentSessionRequest {
  tenantId: string;
  referenceId: string;
  referenceType: 'case_fee' | 'wallet_topup' | 'invoice';
  caseId?: string | undefined;
  amount: number;
  currency: PaymentCurrency;
  paymentScheduleType: PaymentScheduleType;
  milestones?: PaymentMilestone[] | undefined;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
  cancelUrl?: string | undefined;
  metadata?: Record<string, string> | undefined;
}

export interface PaymentSessionResult {
  sessionId: string;
  provider: PaymentProvider;
  gatewayUrl: string;
  amount: number;
  currency: PaymentCurrency;
  status: 'created' | 'pending';
  expiresAt: string;
  metadata?: Record<string, string> | undefined;
}

export interface WebhookVerificationOptions {
  maxReplayWindowSeconds?: number | undefined; // Default: 300 (5 minutes)
  currentTimestampSeconds?: number | undefined; // For deterministic unit testing
}

export interface VerifiedWebhookEvent {
  eventId: string;
  eventType: WebhookEventType;
  tenantId: string;
  referenceId: string;
  referenceType: 'case_fee' | 'wallet_topup' | 'invoice';
  caseId?: string | undefined;
  gateway: PaymentProvider;
  gatewayTransactionId: string;
  amount: number;
  currency: PaymentCurrency;
  idempotencyKey: string;
  timestamp: number;
  milestoneId?: string | undefined;
  rawPayload: unknown;
}

export interface PaymentGatewayAdapter {
  readonly providerId: PaymentProvider;
  createPaymentSession(request: CreatePaymentSessionRequest): Promise<PaymentSessionResult>;
  verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signatureHeader: string,
    secret: string,
    options?: WebhookVerificationOptions,
  ): Promise<VerifiedWebhookEvent>;
  generateWebhookSignature(
    payload: string | Record<string, unknown>,
    secret: string,
    timestamp?: number,
  ): string;
  refundPayment?(
    gatewayTransactionId: string,
    amount: number,
    reason?: string,
  ): Promise<{ refundId: string; status: 'succeeded' | 'pending' }>;
}

export class PaymentGatewayError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, code: string = 'PAYMENT_GATEWAY_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'PaymentGatewayError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidWebhookSignatureError extends PaymentGatewayError {
  constructor(provider: PaymentProvider, details?: string) {
    super(
      `Cryptographic webhook signature verification failed for '${provider}'${details ? `: ${details}` : ''}.`,
      'INVALID_WEBHOOK_SIGNATURE',
      400,
    );
    this.name = 'InvalidWebhookSignatureError';
  }
}

export class WebhookReplayAttackError extends PaymentGatewayError {
  constructor(provider: PaymentProvider, ageSeconds: number, maxWindow: number) {
    super(
      `Webhook timestamp validation failed for '${provider}'. Message age is ${ageSeconds.toFixed(1)}s (allowed replay window: ${maxWindow}s).`,
      'WEBHOOK_REPLAY_ATTACK',
      400,
    );
    this.name = 'WebhookReplayAttackError';
  }
}

export class DuplicateWebhookEventError extends PaymentGatewayError {
  constructor(idempotencyKey: string) {
    super(
      `Webhook event with idempotencyKey '${idempotencyKey}' has already been processed. Replay discarded.`,
      'DUPLICATE_WEBHOOK_EVENT',
      409,
    );
    this.name = 'DuplicateWebhookEventError';
  }
}
