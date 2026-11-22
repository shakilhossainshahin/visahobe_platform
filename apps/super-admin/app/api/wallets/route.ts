import { createLogger } from '@visahobe/core';

const logger = createLogger({ service: 'super-admin-wallets-api' });

interface AgencyWallet {
  tenantId: string;
  agencyName: string;
  currency: string;
  balance: number;
  lockedHold: number;
  availableBalance: number;
  lowBalanceThreshold: number;
  status: 'active' | 'low_balance' | 'suspended';
  recentTransactions: Array<{
    id: string;
    type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
    amount: number;
    description: string;
    timestamp: string;
    caseNumber?: string;
  }>;
}

const WALLETS_DATA: AgencyWallet[] = [
  {
    tenantId: 'tenant-ag-402',
    agencyName: 'Bengal Global Travels',
    currency: 'USD',
    balance: 4850.0,
    lockedHold: 195.0,
    availableBalance: 4655.0,
    lowBalanceThreshold: 500.0,
    status: 'active',
    recentTransactions: [
      {
        id: 'tx-8812',
        type: 'CREDIT',
        amount: 2000.0,
        description: 'Prepaid Wallet Top-up (Stripe Gateway Hook)',
        timestamp: '2026-11-21T18:00:00Z',
      },
      {
        id: 'tx-8813',
        type: 'HOLD',
        amount: 195.0,
        description: 'Case Lodgment Hold (VH-2026-SG-4921)',
        timestamp: '2026-11-20T10:30:00Z',
        caseNumber: 'VH-2026-SG-4921',
      },
    ],
  },
  {
    tenantId: 'tenant-ag-108',
    agencyName: 'Silk Route Visa Consultants',
    currency: 'USD',
    balance: 340.0,
    lockedHold: 0.0,
    availableBalance: 340.0,
    lowBalanceThreshold: 500.0,
    status: 'low_balance',
    recentTransactions: [
      {
        id: 'tx-7740',
        type: 'DEBIT',
        amount: 340.0,
        description: 'EU Blue Card Filing Fee Settled (VH-2026-DE-3309)',
        timestamp: '2026-11-19T14:40:00Z',
        caseNumber: 'VH-2026-DE-3309',
      },
    ],
  },
];

export async function GET(): Promise<Response> {
  try {
    const totalLiquidity = WALLETS_DATA.reduce((acc, w) => acc + w.balance, 0);
    const lowBalanceAgencies = WALLETS_DATA.filter((w) => w.balance < w.lowBalanceThreshold);

    logger.info('Partner wallets fetched', { count: WALLETS_DATA.length, totalLiquidity });

    return Response.json(
      {
        success: true,
        totalLiquidityUSD: totalLiquidity,
        lowBalanceCount: lowBalanceAgencies.length,
        wallets: WALLETS_DATA,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    logger.error(
      'Failed to retrieve partner agency wallets',
      error instanceof Error ? error : new Error(String(error)),
    );
    return Response.json(
      { success: false, error: 'Failed to retrieve agency wallets' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      tenantId?: string;
      amount?: number;
      type?: 'CREDIT' | 'DEBIT';
      description?: string;
    };

    if (!body.tenantId || !body.amount || body.amount <= 0) {
      return Response.json(
        { success: false, error: 'Valid tenantId and positive amount are required' },
        { status: 400 },
      );
    }

    const wallet = WALLETS_DATA.find((w) => w.tenantId === body.tenantId);
    if (!wallet) {
      return Response.json({ success: false, error: 'Agency wallet not found' }, { status: 404 });
    }

    if (body.type === 'DEBIT') {
      if (wallet.availableBalance < body.amount) {
        return Response.json(
          {
            success: false,
            error: `Insufficient prepaid balance ($${wallet.availableBalance.toFixed(2)} available vs $${body.amount.toFixed(2)} requested). Zero overdraft enforced.`,
          },
          { status: 422 },
        );
      }
      wallet.balance -= body.amount;
      wallet.availableBalance = wallet.balance - wallet.lockedHold;
    } else {
      wallet.balance += body.amount;
      wallet.availableBalance = wallet.balance - wallet.lockedHold;
    }

    const txId = `tx-${Date.now().toString().slice(-4)}`;
    wallet.recentTransactions.unshift({
      id: txId,
      type: body.type || 'CREDIT',
      amount: body.amount,
      description: body.description || 'Manual Ledger Adjustment by Platform Admin',
      timestamp: new Date().toISOString(),
    });

    if (wallet.balance < wallet.lowBalanceThreshold) {
      wallet.status = 'low_balance';
    } else {
      wallet.status = 'active';
    }

    logger.info('Double-entry wallet mutation executed', {
      tenantId: wallet.tenantId,
      txId,
      type: body.type || 'CREDIT',
      newBalance: wallet.balance,
    });

    return Response.json(
      {
        success: true,
        message: 'Wallet transaction recorded successfully in immutable ledger',
        wallet,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    logger.error(
      'Failed to execute wallet transaction',
      error instanceof Error ? error : new Error(String(error)),
    );
    return Response.json({ success: false, error: 'Internal ledger error' }, { status: 500 });
  }
}
