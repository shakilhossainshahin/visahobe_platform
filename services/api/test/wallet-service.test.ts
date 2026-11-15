import { describe, it, expect, beforeEach } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import { StorageAccessDeniedError } from '@visahobe/core';
import {
  WalletService,
  InsufficientFundsError,
  InvalidSignatureError,
  type TopUpWebhookPayload,
} from '../src/wallet/wallet-service.js';

describe('Prepaid Agency Wallet & Double-Entry Ledger (ADR-010)', () => {
  const staffSession: UserSession = {
    userId: 'staff-user-001',
    email: 'sarah@visahobe.com',
    tenantId: 'tenant-visahobe-platform-hq',
    role: 'admin',
    isMfaVerified: true,
    aal: 'aal2',
    claims: { sub: 'staff-user-001', role: 'admin', aal: 'aal2' },
  };

  const agencySession: UserSession = {
    userId: 'agency-user-bengal',
    email: 'agent@bengaltravel.com',
    tenantId: 'tenant-agency-bengal',
    role: 'agency_manager',
    isMfaVerified: true,
    aal: 'aal2',
    claims: {
      sub: 'agency-user-bengal',
      tenant_id: 'tenant-agency-bengal',
      role: 'agency_manager',
    },
  };

  const otherAgencySession: UserSession = {
    userId: 'agency-user-other',
    email: 'agent@other.com',
    tenantId: 'tenant-agency-other',
    role: 'agency_manager',
    isMfaVerified: true,
    aal: 'aal2',
    claims: { sub: 'agency-user-other', tenant_id: 'tenant-agency-other', role: 'agency_manager' },
  };

  beforeEach(() => {
    WalletService.clear();
  });

  it('creates an agency wallet and checks low balance flag correctly', async () => {
    const wallet = await WalletService.createWallet('tenant-agency-bengal', 'USD', 400);
    expect(wallet.tenantId).toBe('tenant-agency-bengal');
    expect(wallet.balance).toBe(400);
    expect(wallet.isLowBalance).toBe(true); // $400 < $500 threshold
  });

  it('credits wallet balance on verified gateway webhook (Pay Station / Stripe)', async () => {
    const topUpPayload: TopUpWebhookPayload = {
      tenantId: 'tenant-agency-bengal',
      amount: 1500,
      currency: 'USD',
      gateway: 'pay_station',
      gatewayTransactionId: 'PAY-STATION-TX-9901',
      idempotencyKey: 'idemp-topup-001',
      signature: 'valid_crypto_signature_hex_884211',
    };

    const res = await WalletService.topUp(topUpPayload);
    expect(res.wallet.balance).toBe(1500);
    expect(res.wallet.isLowBalance).toBe(false);
    expect(res.transaction.type).toBe('CREDIT');
    expect(res.transaction.amount).toBe(1500);
    expect(res.transaction.balanceAfter).toBe(1500);
    expect(res.idempotentReplay).toBe(false);
  });

  it('strictly protects against idempotent webhook replay (zero double-crediting)', async () => {
    const topUpPayload: TopUpWebhookPayload = {
      tenantId: 'tenant-agency-bengal',
      amount: 1000,
      currency: 'USD',
      gateway: 'stripe',
      gatewayTransactionId: 'ch_stripe_test_881',
      idempotencyKey: 'idemp-replay-key-99',
      signature: 'valid_crypto_signature_stripe_123',
    };

    // First top-up
    const first = await WalletService.topUp(topUpPayload);
    expect(first.wallet.balance).toBe(1000);
    expect(first.idempotentReplay).toBe(false);

    // Replay of same webhook payload
    const replay = await WalletService.topUp(topUpPayload);
    expect(replay.wallet.balance).toBe(1000); // Balance remains 1000, not 2000!
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.transaction.id).toBe(first.transaction.id);
  });

  it('rejects top-up when cryptographic webhook signature is invalid or missing', async () => {
    const invalidPayload: TopUpWebhookPayload = {
      tenantId: 'tenant-agency-bengal',
      amount: 500,
      currency: 'USD',
      gateway: 'pay_station',
      gatewayTransactionId: 'TX-FAIL',
      idempotencyKey: 'idemp-fail',
      signature: '', // Missing
    };

    await expect(WalletService.topUp(invalidPayload)).rejects.toThrow(InvalidSignatureError);
  });

  it('atomically deducts fee on case submission and updates low balance alert', async () => {
    await WalletService.createWallet('tenant-agency-bengal', 'USD', 600);

    // Deduct $150
    const res = await WalletService.deductCaseFee(agencySession, 'case-sg-100', 150);
    expect(res.wallet.balance).toBe(450);
    expect(res.wallet.isLowBalance).toBe(true); // $450 < $500 threshold triggers low balance!
    expect(res.transaction.type).toBe('DEBIT');
    expect(res.transaction.amount).toBe(150);
    expect(res.transaction.balanceBefore).toBe(600);
    expect(res.transaction.balanceAfter).toBe(450);
  });

  it('strictly rejects case submission when funds are insufficient (Zero Overdraft Invariant)', async () => {
    await WalletService.createWallet('tenant-agency-bengal', 'USD', 80);

    // Attempting to deduct $120 when balance is $80
    await expect(WalletService.deductCaseFee(agencySession, 'case-sg-200', 120)).rejects.toThrow(
      InsufficientFundsError,
    );

    // Wallet balance remains intact
    const wallet = await WalletService.getWallet(agencySession);
    expect(wallet.balance).toBe(80);
  });

  it('manages funds hold and release cycle', async () => {
    await WalletService.createWallet('tenant-agency-bengal', 'USD', 1000);

    // Hold $200
    const holdRes = await WalletService.holdFunds(agencySession, 'case-hold-1', 200);
    expect(holdRes.wallet.balance).toBe(800);
    expect(holdRes.wallet.lockedBalance).toBe(200);

    // Release held funds
    const relRes = await WalletService.releaseFunds(agencySession, 'case-hold-1', 200);
    expect(relRes.wallet.balance).toBe(1000);
    expect(relRes.wallet.lockedBalance).toBe(0);
  });

  it('processes refund on case rejection or cancellation', async () => {
    await WalletService.createWallet('tenant-agency-bengal', 'USD', 500);

    const refRes = await WalletService.refundCaseFee(agencySession, 'case-ref-1', 100);
    expect(refRes.wallet.balance).toBe(600);
    expect(refRes.transaction.type).toBe('REFUND');
    expect(refRes.transaction.amount).toBe(100);
  });

  it('enforces strict tenant isolation on transaction history and wallet queries', async () => {
    await WalletService.createWallet('tenant-agency-bengal', 'USD', 500);

    // Agency querying other agency's wallet is rejected
    await expect(
      WalletService.getWallet(otherAgencySession, 'tenant-agency-bengal'),
    ).rejects.toThrow(StorageAccessDeniedError);

    // Agency querying other agency's transactions is rejected
    await expect(
      WalletService.listTransactions(otherAgencySession, 'tenant-agency-bengal'),
    ).rejects.toThrow(StorageAccessDeniedError);

    // Platform staff (admin) has authorized cross-tenant operational visibility
    const staffView = await WalletService.getWallet(staffSession, 'tenant-agency-bengal');
    expect(staffView.balance).toBe(500);
  });
});
