import type { UserSession } from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import { AuditService } from '../audit/audit-service.js';

export type WalletCurrency = 'USD' | 'BDT' | 'EUR';
export type WalletTransactionType = 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND';
export type TransactionReferenceType = 'topup' | 'case_fee' | 'hold' | 'settlement' | 'refund';

export interface AgencyWalletRecord {
  id: string;
  tenantId: string;
  currency: WalletCurrency;
  balance: number;
  lockedBalance: number;
  isLowBalance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionRecord {
  id: string;
  tenantId: string;
  walletId: string;
  caseId?: string | undefined;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: TransactionReferenceType;
  referenceId?: string | undefined;
  idempotencyKey?: string | undefined;
  description: string;
  createdAt: string;
}

export interface TopUpWebhookPayload {
  tenantId: string;
  amount: number;
  currency: WalletCurrency;
  gateway: 'pay_station' | 'stripe';
  gatewayTransactionId: string;
  idempotencyKey: string;
  signature: string;
}

export class InsufficientFundsError extends Error {
  readonly statusCode = 402;
  readonly code = 'INSUFFICIENT_WALLET_BALANCE';

  constructor(tenantId: string, currentBalance: number, requiredAmount: number) {
    super(
      `Insufficient wallet funds for tenant '${tenantId}'. Current balance: $${currentBalance.toFixed(
        2,
      )}, required: $${requiredAmount.toFixed(2)}. Overdraft rejected.`,
    );
    this.name = 'InsufficientFundsError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class WalletNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'WALLET_NOT_FOUND';

  constructor(tenantId: string) {
    super(`Prepaid wallet for tenant '${tenantId}' was not found.`);
    this.name = 'WalletNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidSignatureError extends Error {
  readonly statusCode = 400;
  readonly code = 'INVALID_GATEWAY_SIGNATURE';

  constructor(gateway: string) {
    super(`Cryptographic webhook signature validation failed for gateway '${gateway}'.`);
    this.name = 'InvalidSignatureError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const LOW_BALANCE_THRESHOLD = 500;

export class WalletService {
  private static wallets: Map<string, AgencyWalletRecord> = new Map();
  private static transactions: Map<string, WalletTransactionRecord> = new Map();
  private static idempotencyKeys: Map<string, string> = new Map(); // idempotencyKey -> transactionId

  public static seedWallet(wallet: AgencyWalletRecord): void {
    WalletService.wallets.set(wallet.tenantId, wallet);
  }

  public static seedTransaction(transaction: WalletTransactionRecord): void {
    WalletService.transactions.set(transaction.id, transaction);
    if (transaction.idempotencyKey) {
      WalletService.idempotencyKeys.set(transaction.idempotencyKey, transaction.id);
    }
  }

  public static clear(): void {
    WalletService.wallets.clear();
    WalletService.transactions.clear();
    WalletService.idempotencyKeys.clear();
  }

  /**
   * Initializes or creates a new agency prepaid wallet with zero balance by default.
   */
  public static async createWallet(
    tenantId: string,
    currency: WalletCurrency = 'USD',
    initialBalance: number = 0,
  ): Promise<AgencyWalletRecord> {
    const existing = WalletService.wallets.get(tenantId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const wallet: AgencyWalletRecord = {
      id: `wal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId,
      currency,
      balance: initialBalance,
      lockedBalance: 0,
      isLowBalance: initialBalance < LOW_BALANCE_THRESHOLD,
      createdAt: now,
      updatedAt: now,
    };

    WalletService.wallets.set(tenantId, wallet);
    return wallet;
  }

  /**
   * Retrieves an agency wallet, enforcing tenant boundaries.
   */
  public static async getWallet(
    session: UserSession,
    tenantId?: string | undefined,
  ): Promise<AgencyWalletRecord> {
    const targetTenantId = tenantId ?? session.tenantId;

    // Strict tenant isolation: non-admin roles can only query their own tenant wallet
    const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
    if (!isStaff && targetTenantId !== session.tenantId) {
      throw new StorageAccessDeniedError(
        `Cross-tenant wallet access denied for user '${session.userId}'. Expected tenant '${session.tenantId}', requested '${targetTenantId}'.`,
      );
    }

    const wallet = WalletService.wallets.get(targetTenantId);
    if (!wallet) {
      // Auto-create wallet for the tenant if requested
      return WalletService.createWallet(targetTenantId);
    }

    return wallet;
  }

  /**
   * Processes pre-funded wallet top-ups via Pay Station or Stripe.
   * Guarantees idempotent replay protection.
   */
  public static async topUp(payload: TopUpWebhookPayload): Promise<{
    wallet: AgencyWalletRecord;
    transaction: WalletTransactionRecord;
    idempotentReplay: boolean;
  }> {
    // 1. Validate signature presence
    if (!payload.signature || payload.signature.length < 8) {
      throw new InvalidSignatureError(payload.gateway);
    }

    // 2. Idempotency Check (ADR-010): deduplicate repeated webhook callbacks
    const existingTxId = WalletService.idempotencyKeys.get(payload.idempotencyKey);
    if (existingTxId) {
      const existingTx = WalletService.transactions.get(existingTxId);
      const wallet = WalletService.wallets.get(payload.tenantId);
      if (existingTx && wallet) {
        return { wallet, transaction: existingTx, idempotentReplay: true };
      }
    }

    // 3. Locate or create wallet
    let wallet = WalletService.wallets.get(payload.tenantId);
    if (!wallet) {
      wallet = await WalletService.createWallet(payload.tenantId, payload.currency);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = Number((balanceBefore + payload.amount).toFixed(2));
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.isLowBalance = balanceAfter < LOW_BALANCE_THRESHOLD;
    wallet.updatedAt = now;

    const transaction: WalletTransactionRecord = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: payload.tenantId,
      walletId: wallet.id,
      type: 'CREDIT',
      amount: payload.amount,
      balanceBefore,
      balanceAfter,
      referenceType: 'topup',
      referenceId: payload.gatewayTransactionId,
      idempotencyKey: payload.idempotencyKey,
      description: `Top-up via ${payload.gateway.toUpperCase()} (Ref: ${payload.gatewayTransactionId})`,
      createdAt: now,
    };

    WalletService.transactions.set(transaction.id, transaction);
    WalletService.idempotencyKeys.set(payload.idempotencyKey, transaction.id);

    // Record Immutable Audit Log
    const systemSession: UserSession = {
      userId: `webhook-${payload.gateway}`,
      email: `webhook@${payload.gateway}.visahobe.internal`,
      tenantId: payload.tenantId,
      role: 'admin',
      isMfaVerified: true,
      aal: 'aal2',
      claims: {
        sub: `webhook-${payload.gateway}`,
        tenant_id: payload.tenantId,
        role: 'admin',
        aal: 'aal2',
      },
    };

    await AuditService.recordLog(systemSession, {
      action: 'wallet.topup',
      entityType: 'agency_wallet',
      entityId: wallet.id,
      oldValues: { balance: balanceBefore },
      newValues: { balance: balanceAfter, gateway: payload.gateway },
      details: `Pre-funded agency balance credited: +$${payload.amount.toFixed(2)} via ${payload.gateway}`,
    });

    return { wallet, transaction, idempotentReplay: false };
  }

  /**
   * Atomically deducts processing fee on visa case submission.
   * Strictly enforces balance >= 0 (zero overdraft invariant).
   */
  public static async deductCaseFee(
    session: UserSession,
    caseId: string,
    amount: number,
    description: string = 'Visa case submission processing fee',
    tenantId?: string | undefined,
  ): Promise<{ wallet: AgencyWalletRecord; transaction: WalletTransactionRecord }> {
    const targetTenantId = tenantId ?? session.tenantId;

    const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
    if (!isStaff && targetTenantId !== session.tenantId) {
      throw new StorageAccessDeniedError('Cross-tenant wallet debit rejected.');
    }

    let wallet = WalletService.wallets.get(targetTenantId);
    if (!wallet) {
      wallet = await WalletService.createWallet(targetTenantId);
    }

    // Zero Overdraft Invariant (ADR-010)
    if (wallet.balance < amount) {
      throw new InsufficientFundsError(targetTenantId, wallet.balance, amount);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = Number((balanceBefore - amount).toFixed(2));
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.isLowBalance = balanceAfter < LOW_BALANCE_THRESHOLD;
    wallet.updatedAt = now;

    const transaction: WalletTransactionRecord = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: targetTenantId,
      walletId: wallet.id,
      caseId,
      type: 'DEBIT',
      amount,
      balanceBefore,
      balanceAfter,
      referenceType: 'case_fee',
      referenceId: caseId,
      description,
      createdAt: now,
    };

    WalletService.transactions.set(transaction.id, transaction);

    await AuditService.recordLog(session, {
      action: 'wallet.deduct_fee',
      entityType: 'agency_wallet',
      entityId: wallet.id,
      oldValues: { balance: balanceBefore },
      newValues: { balance: balanceAfter, caseId },
      details: `Case submission fee deducted: -$${amount.toFixed(2)} for Case ${caseId}`,
    });

    return { wallet, transaction };
  }

  /**
   * Holds funds during intermediate case review.
   */
  public static async holdFunds(
    session: UserSession,
    caseId: string,
    amount: number,
    description: string = 'Pre-authorization hold for consular processing',
  ): Promise<{ wallet: AgencyWalletRecord; transaction: WalletTransactionRecord }> {
    const targetTenantId = session.tenantId;
    let wallet = WalletService.wallets.get(targetTenantId);
    if (!wallet) {
      wallet = await WalletService.createWallet(targetTenantId);
    }

    if (wallet.balance < amount) {
      throw new InsufficientFundsError(targetTenantId, wallet.balance, amount);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = Number((balanceBefore - amount).toFixed(2));
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.lockedBalance = Number((wallet.lockedBalance + amount).toFixed(2));
    wallet.isLowBalance = balanceAfter < LOW_BALANCE_THRESHOLD;
    wallet.updatedAt = now;

    const transaction: WalletTransactionRecord = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: targetTenantId,
      walletId: wallet.id,
      caseId,
      type: 'HOLD',
      amount,
      balanceBefore,
      balanceAfter,
      referenceType: 'hold',
      referenceId: caseId,
      description,
      createdAt: now,
    };

    WalletService.transactions.set(transaction.id, transaction);
    return { wallet, transaction };
  }

  /**
   * Releases previously held funds back to the spendable balance.
   */
  public static async releaseFunds(
    session: UserSession,
    caseId: string,
    amount: number,
    description: string = 'Release of consular processing hold',
  ): Promise<{ wallet: AgencyWalletRecord; transaction: WalletTransactionRecord }> {
    const targetTenantId = session.tenantId;
    const wallet = WalletService.wallets.get(targetTenantId);
    if (!wallet) {
      throw new WalletNotFoundError(targetTenantId);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = Number((balanceBefore + amount).toFixed(2));
    const now = new Date().toISOString();

    wallet.lockedBalance = Math.max(0, Number((wallet.lockedBalance - amount).toFixed(2)));
    wallet.balance = balanceAfter;
    wallet.isLowBalance = balanceAfter < LOW_BALANCE_THRESHOLD;
    wallet.updatedAt = now;

    const transaction: WalletTransactionRecord = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: targetTenantId,
      walletId: wallet.id,
      caseId,
      type: 'RELEASE',
      amount,
      balanceBefore,
      balanceAfter,
      referenceType: 'settlement',
      referenceId: caseId,
      description,
      createdAt: now,
    };

    WalletService.transactions.set(transaction.id, transaction);
    return { wallet, transaction };
  }

  /**
   * Refunds a previously deducted case fee.
   */
  public static async refundCaseFee(
    session: UserSession,
    caseId: string,
    amount: number,
    description: string = 'Refund for cancelled or rejected visa application',
    tenantId?: string | undefined,
  ): Promise<{ wallet: AgencyWalletRecord; transaction: WalletTransactionRecord }> {
    const targetTenantId = tenantId ?? session.tenantId;

    let wallet = WalletService.wallets.get(targetTenantId);
    if (!wallet) {
      wallet = await WalletService.createWallet(targetTenantId);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = Number((balanceBefore + amount).toFixed(2));
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.isLowBalance = balanceAfter < LOW_BALANCE_THRESHOLD;
    wallet.updatedAt = now;

    const transaction: WalletTransactionRecord = {
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: targetTenantId,
      walletId: wallet.id,
      caseId,
      type: 'REFUND',
      amount,
      balanceBefore,
      balanceAfter,
      referenceType: 'refund',
      referenceId: caseId,
      description,
      createdAt: now,
    };

    WalletService.transactions.set(transaction.id, transaction);

    await AuditService.recordLog(session, {
      action: 'wallet.refund',
      entityType: 'agency_wallet',
      entityId: wallet.id,
      oldValues: { balance: balanceBefore },
      newValues: { balance: balanceAfter, caseId },
      details: `Visa case fee refunded: +$${amount.toFixed(2)} for Case ${caseId}`,
    });

    return { wallet, transaction };
  }

  /**
   * Lists transactions for a given wallet, enforcing tenant boundaries.
   */
  public static async listTransactions(
    session: UserSession,
    tenantId?: string | undefined,
  ): Promise<WalletTransactionRecord[]> {
    const targetTenantId = tenantId ?? session.tenantId;

    const isStaff = ['owner', 'admin', 'case_manager', 'verifier'].includes(session.role);
    if (!isStaff && targetTenantId !== session.tenantId) {
      throw new StorageAccessDeniedError('Cross-tenant transaction query denied.');
    }

    const results: WalletTransactionRecord[] = [];
    for (const tx of WalletService.transactions.values()) {
      if (tx.tenantId === targetTenantId) {
        results.push(tx);
      }
    }

    // Sort descending by creation date
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
