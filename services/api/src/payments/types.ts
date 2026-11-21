import type {
  PaymentCurrency,
  PaymentMilestone,
  PaymentScheduleType,
  VerifiedWebhookEvent,
} from '@visahobe/integrations';

export type InvoiceStatus = 'draft' | 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  caseId: string;
  clientId: string;
  amount: number;
  currency: PaymentCurrency;
  status: InvoiceStatus;
  paymentScheduleType: PaymentScheduleType;
  milestones: PaymentMilestone[];
  gatewayTransactionId?: string | undefined;
  paidAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseInvoiceInput {
  tenantId: string;
  caseId: string;
  clientId: string;
  amount: number;
  currency: PaymentCurrency;
  paymentScheduleType: PaymentScheduleType;
  milestones?:
    | {
        name: string;
        percentage: number;
        amount: number;
      }[]
    | undefined;
}

export interface WebhookProcessingResult {
  status: 'processed' | 'already_processed' | 'rejected';
  idempotentReplay: boolean;
  event: VerifiedWebhookEvent;
  invoice?: InvoiceRecord | undefined;
  details?: string | undefined;
}
