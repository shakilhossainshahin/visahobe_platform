import type { UserSession } from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import type { VerifiedWebhookEvent } from '@visahobe/integrations';
import { AuditService } from '../audit/audit-service.js';
import type { CreateCaseInvoiceInput, InvoiceRecord } from './types.js';

export class InvoiceNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'INVOICE_NOT_FOUND';

  constructor(invoiceId: string) {
    super(`Invoice '${invoiceId}' was not found.`);
    this.name = 'InvoiceNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvoiceService {
  private static invoices: Map<string, InvoiceRecord> = new Map();

  public static clear(): void {
    InvoiceService.invoices.clear();
  }

  public static seedInvoice(invoice: InvoiceRecord): void {
    InvoiceService.invoices.set(invoice.id, invoice);
  }

  /**
   * Generates a new invoice for a visa application case.
   */
  public static async createCaseInvoice(
    session: UserSession,
    input: CreateCaseInvoiceInput,
  ): Promise<InvoiceRecord> {
    const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
    if (!isStaff && input.tenantId !== session.tenantId) {
      throw new StorageAccessDeniedError('Cross-tenant invoice creation rejected.');
    }

    const now = new Date().toISOString();
    const invoiceId = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    const milestones =
      input.paymentScheduleType === 'milestone_split' &&
      input.milestones &&
      input.milestones.length > 0
        ? input.milestones.map((m, idx) => ({
            id: `ms-${idx + 1}-${invoiceId.slice(-4)}`,
            name: m.name,
            percentage: m.percentage,
            amount: m.amount,
            status: 'pending' as const,
          }))
        : [];

    const invoice: InvoiceRecord = {
      id: invoiceId,
      tenantId: input.tenantId,
      caseId: input.caseId,
      clientId: input.clientId,
      amount: input.amount,
      currency: input.currency,
      status: 'pending',
      paymentScheduleType: input.paymentScheduleType,
      milestones,
      createdAt: now,
      updatedAt: now,
    };

    InvoiceService.invoices.set(invoice.id, invoice);

    await AuditService.recordLog(session, {
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice.id,
      newValues: {
        amount: invoice.amount,
        currency: invoice.currency,
        scheduleType: invoice.paymentScheduleType,
        caseId: invoice.caseId,
      },
      details: `Invoice created: ${invoice.currency} ${invoice.amount} for Case ${invoice.caseId} (${invoice.paymentScheduleType})`,
    });

    return invoice;
  }

  /**
   * Retrieves an invoice by ID with strict tenant boundary checks.
   */
  public static async getInvoice(session: UserSession, invoiceId: string): Promise<InvoiceRecord> {
    const invoice = InvoiceService.invoices.get(invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId);
    }

    const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
    if (!isStaff && invoice.tenantId !== session.tenantId) {
      throw new StorageAccessDeniedError(
        `Cross-tenant access forbidden: Invoice '${invoiceId}' belongs to tenant '${invoice.tenantId}', but caller is authenticated under tenant '${session.tenantId}'.`,
      );
    }

    return invoice;
  }

  /**
   * Settles an upfront full payment invoice.
   */
  public static async settleInvoiceFull(
    session: UserSession,
    invoiceId: string,
    event: VerifiedWebhookEvent,
  ): Promise<InvoiceRecord> {
    const invoice = await InvoiceService.getInvoice(session, invoiceId);

    const now = new Date().toISOString();
    invoice.status = 'paid';
    invoice.gatewayTransactionId = event.gatewayTransactionId;
    invoice.paidAt = now;
    invoice.updatedAt = now;

    // Also mark all milestones paid if present
    for (const ms of invoice.milestones) {
      ms.status = 'paid';
      ms.gatewayTransactionId = event.gatewayTransactionId;
      ms.paidAt = now;
    }

    await AuditService.recordLog(session, {
      action: 'invoice.settled_full',
      entityType: 'invoice',
      entityId: invoice.id,
      newValues: {
        status: 'paid',
        gateway: event.gateway,
        gatewayTransactionId: event.gatewayTransactionId,
        amount: event.amount,
        currency: event.currency,
      },
      details: `Invoice ${invoice.id} settled in full via ${event.gateway.toUpperCase()} (Trx: ${event.gatewayTransactionId})`,
    });

    return invoice;
  }

  /**
   * Settles a specific milestone payment on a split schedule invoice.
   */
  public static async settleMilestone(
    session: UserSession,
    invoiceId: string,
    milestoneId: string,
    event: VerifiedWebhookEvent,
  ): Promise<InvoiceRecord> {
    const invoice = await InvoiceService.getInvoice(session, invoiceId);

    const milestone = invoice.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone '${milestoneId}' not found on invoice '${invoiceId}'.`);
    }

    const now = new Date().toISOString();
    milestone.status = 'paid';
    milestone.gatewayTransactionId = event.gatewayTransactionId;
    milestone.paidAt = now;
    invoice.updatedAt = now;

    // Check if all milestones are paid
    const allPaid = invoice.milestones.every((m) => m.status === 'paid' || m.status === 'waived');
    invoice.status = allPaid ? 'paid' : 'partially_paid';

    await AuditService.recordLog(session, {
      action: 'invoice.milestone_paid',
      entityType: 'invoice',
      entityId: invoice.id,
      newValues: {
        milestoneId,
        milestoneName: milestone.name,
        amount: event.amount,
        status: invoice.status,
        gatewayTransactionId: event.gatewayTransactionId,
      },
      details: `Milestone '${milestone.name}' paid: ${event.currency} ${event.amount} via ${event.gateway.toUpperCase()}`,
    });

    return invoice;
  }
}
