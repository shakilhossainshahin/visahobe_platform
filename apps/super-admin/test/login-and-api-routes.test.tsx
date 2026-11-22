import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SuperAdminLoginPage from '../app/login/page.js';
import { GET as getCases, PATCH as patchCases } from '../app/api/cases/route.js';
import { GET as getWallets, POST as postWallets } from '../app/api/wallets/route.js';

describe('Super Admin Command Center Login & Dynamic APIs (TICKET-P5-003)', () => {
  describe('SuperAdminLoginPage', () => {
    it('renders executive dark-glass login card with operator inputs and AAL2 note', () => {
      const html = renderToStaticMarkup(<SuperAdminLoginPage />);
      expect(html).toContain('Staff Operator Sign In');
      expect(html).toContain('Restricted Operations Desk');
      expect(html).toContain('id="admin-operator-id"');
      expect(html).toContain('id="admin-password"');
      expect(html).toContain('Mandatory AAL2 MFA');
      expect(html).toContain('Kernel RLS Session Enforcement');
    });
  });

  describe('Cases Queue API (/api/cases)', () => {
    it('GET /api/cases returns queue of cases filtered by parameters', async () => {
      const req = new Request('http://localhost:3002/api/cases?status=in_review');
      const res = await getCases(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThan(0);
      expect(json.cases.every((c: { status: string }) => c.status === 'in_review')).toBe(true);
    });

    it('PATCH /api/cases satisfies ADR-011 consular review gate', async () => {
      const req = new Request('http://localhost:3002/api/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: 'VH-2026-SG-4921',
          action: 'approve_gate',
        }),
      });

      const res = await patchCases(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.case.safetyGateSatisfied).toBe(true);
      expect(json.case.status).toBe('submitted');
    });
  });

  describe('Partner Agency Wallets API (/api/wallets)', () => {
    it('GET /api/wallets returns agency wallets with total liquidity', async () => {
      const res = await getWallets();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.totalLiquidityUSD).toBeGreaterThan(0);
      expect(Array.isArray(json.wallets)).toBe(true);
    });

    it('POST /api/wallets debits wallet with zero-overdraft enforcement', async () => {
      const req = new Request('http://localhost:3002/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-ag-402',
          amount: 100,
          type: 'DEBIT',
          description: 'Test case debit',
        }),
      });

      const res = await postWallets(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.wallet.recentTransactions[0].type).toBe('DEBIT');
    });

    it('POST /api/wallets rejects overdraft attempts with 422', async () => {
      const req = new Request('http://localhost:3002/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-ag-108',
          amount: 999999,
          type: 'DEBIT',
          description: 'Excessive debit',
        }),
      });

      const res = await postWallets(req);
      expect(res.status).toBe(422);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Zero overdraft enforced');
    });
  });
});
