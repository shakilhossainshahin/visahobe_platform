import { NextResponse } from 'next/server.js';
import { createLogger } from '@visahobe/core';
import {
  PayStationAdapter,
  StripeAdapter,
  type PaymentCurrency,
  type PaymentScheduleType,
  type CreatePaymentSessionRequest,
} from '@visahobe/integrations';

const logger = createLogger({ service: 'website-checkout-api' });

const payStationAdapter = new PayStationAdapter();
const stripeAdapter = new StripeAdapter();

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      gateway?: 'paystation' | 'stripe';
      amount?: number;
      currency?: PaymentCurrency;
      referenceId?: string;
      caseId?: string;
      tenantId?: string;
      customerEmail?: string;
      customerName?: string;
      description?: string;
    };

    const gateway = body.gateway || 'paystation';
    const amount = Number(body.amount) || (gateway === 'paystation' ? 35380 : 290);
    const currency: PaymentCurrency = body.currency || (gateway === 'paystation' ? 'BDT' : 'USD');
    const referenceId = body.referenceId || `VH-REF-${Date.now().toString(36).toUpperCase()}`;
    const paymentScheduleType: PaymentScheduleType = 'upfront_full';
    const tenantId = body.tenantId || 'tenant-default-website';
    const customerEmail = body.customerEmail || 'applicant@example.com';
    const customerName = body.customerName || 'Prospective Applicant';
    const redirectUrl = 'https://visahobe.com/checkout/success';
    const cancelUrl = 'https://visahobe.com/checkout/cancel';

    const sessionRequest: CreatePaymentSessionRequest = {
      tenantId,
      referenceId,
      referenceType: 'case_fee',
      caseId: body.caseId,
      amount,
      currency,
      paymentScheduleType,
      customerEmail,
      customerName,
      redirectUrl,
      cancelUrl,
      metadata: {
        description: body.description || 'VisaHobe Sovereign Visa Application Fee',
      },
    };

    let session;
    if (gateway === 'paystation') {
      session = await payStationAdapter.createPaymentSession(sessionRequest);
    } else {
      session = await stripeAdapter.createPaymentSession(sessionRequest);
    }

    logger.info('Checkout payment session created', {
      gateway,
      sessionId: session.sessionId,
      amount: session.amount,
      currency: session.currency,
      referenceId,
    });

    return NextResponse.json(
      {
        success: true,
        session,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Failed to create payment checkout session', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize checkout gateway' },
      { status: 500 },
    );
  }
}
