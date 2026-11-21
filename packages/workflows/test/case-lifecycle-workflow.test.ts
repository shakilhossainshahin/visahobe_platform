import { describe, it, expect, beforeEach } from 'vitest';
import type { UserSession } from '@visahobe/auth';
import {
  AuditService,
  CaseService,
  InvoiceService,
  WalletService,
  InsufficientFundsError,
} from '@visahobe/api';
import { CaseLifecycleWorkflow, type CaseLifecycleInput } from '../src/index.js';

describe('CaseLifecycleWorkflow — End-to-End Vertical Slice Pipeline', () => {
  const staffSession: UserSession = {
    userId: 'usr-staff-101',
    email: 'operations@visahobe.com',
    role: 'admin',
    tenantId: 'tenant-visahobe-platform',
    isMfaVerified: true,
    aal: 'aal2',
  };

  const partnerSession: UserSession = {
    userId: 'usr-partner-202',
    email: 'agent@bengaltravel.com',
    role: 'agency_owner',
    tenantId: 'tenant-bengal-travel',
    isMfaVerified: true,
    aal: 'aal2',
  };

  const clientSession: UserSession = {
    userId: 'usr-client-303',
    email: 'john.doe@example.com',
    role: 'client',
    tenantId: 'tenant-visahobe-platform',
    isMfaVerified: false,
    aal: 'aal1',
  };

  const validPassportData = {
    passportNumber: 'A12345678',
    surname: 'DOE',
    givenNames: 'JOHN',
    nationality: 'BGD',
    dateOfBirth: '1990-05-15',
    gender: 'M' as const,
    expiryDate: '2032-12-31',
    issuingCountry: 'BGD',
    mrzLine1: 'P<BGDDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'A123456784BGD9005156M3212314<<<<<<<<<<<<<<02',
  };

  beforeEach(() => {
    CaseService.clear();
    WalletService.clear();
    InvoiceService.clear();
    AuditService.clear();
  });

  describe('1. Autonomous Level 3 Flow (Singapore SGAC)', () => {
    it('executes full end-to-end autonomous filing for valid passport with Stripe gateway session', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: clientSession,
        clientTier: 'b2c_retail',
        destinationCountry: 'SG',
        visaCategory: 'tourist_sgac',
        applicantName: 'John Doe',
        applicantEmail: 'john.doe@example.com',
        passportData: validPassportData,
        intakeAnswers: {
          hasJobOffer: true,
          yearsExperience: 5,
          salaryUsd: 75000,
          degreeLevel: 'Master of Science',
        },
        paymentOptions: {
          scheduleType: 'upfront_full',
          currency: 'USD',
          feeAmount: 65,
        },
      };

      const result = await CaseLifecycleWorkflow.run(input);

      // 1. Intake assessment
      expect(result.intakeAssessment.qualified).toBe(true);
      expect(result.intakeAssessment.score).toBeGreaterThanOrEqual(85);
      expect(result.intakeAssessment.tier).toBe('priority');

      // 2. Case creation
      expect(result.caseId).toMatch(/^case-/);
      expect(result.caseNumber).toContain('VH-2026-SG-');

      // 3. Document OCR
      expect(result.ocrResult.valid).toBe(true);
      expect(result.ocrResult.mrzValid).toBe(true);
      expect(result.ocrResult.maskedPassportNumber).toBe('A1*****78');

      // 4. Autonomy & Consular Safety
      expect(result.autonomyLevel).toBe('level_3_autonomous_submission');
      expect(result.requiresHumanVerification).toBe(false);
      expect(result.status).toBe('consular_filing');
      expect(result.consularSafetyResult.isAutonomousApproved).toBe(true);
      expect(result.consularSafetyResult.blockedActions).toHaveLength(0);

      // 5. Payment settlement via Stripe gateway
      expect(result.paymentSettlement.method).toBe('gateway_session');
      expect(result.paymentSettlement.amount).toBe(65);
      expect(result.paymentSettlement.currency).toBe('USD');
      expect(result.paymentSettlement.status).toBe('pending');
      expect(result.paymentSettlement.referenceId).toMatch(/^cs_/);

      // 6. Consular Dry-Run trace
      expect(result.dryRunTrace).toBeDefined();
      expect(result.dryRunTrace?.stepCount).toBeGreaterThan(0);
      expect(result.dryRunTrace?.checksum).toHaveLength(64);

      // 7. Execution steps & audit logging
      expect(result.steps.length).toBe(6);
      expect(result.isShielded).toBe(true);

      const logs = await AuditService.getLogsForTenant(staffSession);
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.some((l) => l.action === 'workflow.case_lifecycle_executed')).toBe(true);
    });
  });

  describe('2. Consular Safety Guard Intercept (Restricted Actions)', () => {
    it('halts autonomous filing when high-risk portal payment or biometrics is attempted', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: staffSession,
        destinationCountry: 'SG',
        visaCategory: 'tourist_sgac',
        applicantName: 'John Doe',
        applicantEmail: 'john.doe@example.com',
        passportData: validPassportData,
        intakeAnswers: {
          hasJobOffer: false,
          yearsExperience: 2,
        },
        paymentOptions: {
          scheduleType: 'upfront_full',
          currency: 'USD',
          feeAmount: 65,
        },
        attemptRestrictedActions: ['portal_payment', 'schedule_biometrics'],
      };

      const result = await CaseLifecycleWorkflow.run(input);

      // Autonomy MUST be halted
      expect(result.requiresHumanVerification).toBe(true);
      expect(result.status).toBe('specialist_review');
      expect(result.consularSafetyResult.isAutonomousApproved).toBe(false);
      expect(result.consularSafetyResult.requiresHumanReview).toBe(true);
      expect(result.consularSafetyResult.blockedActions).toContain('portal_payment');
      expect(result.consularSafetyResult.blockedActions).toContain('schedule_biometrics');

      // Step check
      const safetyStep = result.steps.find(
        (s) => s.stepName === 'autonomy_and_consular_safety_gate',
      );
      expect(safetyStep?.status).toBe('gated');
    });

    it('routes consular interview jurisdictions (US/GB) to specialist review', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: staffSession,
        destinationCountry: 'US', // United States DS-160
        visaCategory: 'b1_b2_tourist',
        applicantName: 'John Doe',
        applicantEmail: 'john.doe@example.com',
        passportData: validPassportData,
        intakeAnswers: {
          yearsExperience: 10,
          salaryUsd: 120000,
        },
        paymentOptions: {
          scheduleType: 'upfront_full',
          currency: 'USD',
          feeAmount: 185,
        },
      };

      const result = await CaseLifecycleWorkflow.run(input);

      expect(result.requiresHumanVerification).toBe(true);
      expect(result.status).toBe('specialist_review');
      expect(result.autonomyLevel).toBe('level_2_semi_autonomous');
    });
  });

  describe('3. B2B Partner Agency Prepaid Wallet Ledger', () => {
    it('atomically deducts case submission fee from pre-funded agency wallet', async () => {
      // 1. Pre-fund partner wallet with $1,000
      await WalletService.topUp({
        tenantId: partnerSession.tenantId,
        amount: 1000,
        currency: 'USD',
        gateway: 'pay_station',
        gatewayTransactionId: 'topup-bengal-001',
        idempotencyKey: 'idemp-bengal-topup',
        signature: 'valid_mock_signature_12345',
      });

      const walletBefore = await WalletService.getWallet(partnerSession, partnerSession.tenantId);
      expect(walletBefore.balance).toBe(1000);

      const input: CaseLifecycleInput = {
        tenantId: partnerSession.tenantId,
        callerSession: partnerSession,
        clientTier: 'b2b2c_partner',
        destinationCountry: 'SG',
        visaCategory: 'business_visit',
        applicantName: 'Client via Bengal Travel',
        applicantEmail: 'client@bengaltravel.com',
        passportData: validPassportData,
        intakeAnswers: {
          hasJobOffer: true,
          yearsExperience: 4,
          salaryUsd: 60000,
        },
        paymentOptions: {
          scheduleType: 'upfront_full',
          payViaWallet: true,
          feeAmount: 120,
          currency: 'USD',
        },
      };

      const result = await CaseLifecycleWorkflow.run(input);

      // Verify wallet deduction
      expect(result.paymentSettlement.settled).toBe(true);
      expect(result.paymentSettlement.method).toBe('wallet_debit');
      expect(result.paymentSettlement.amount).toBe(120);
      expect(result.paymentSettlement.status).toBe('paid');
      expect(result.paymentSettlement.referenceId).toMatch(/^tx-/);

      const walletAfter = await WalletService.getWallet(partnerSession, partnerSession.tenantId);
      expect(walletAfter.balance).toBe(880);

      // Verify immutable transaction history
      const history = await WalletService.listTransactions(partnerSession, partnerSession.tenantId);
      expect(history.length).toBe(2); // 1 topup + 1 case_fee debit
      const debitTx = history.find((t) => t.type === 'DEBIT');
      expect(debitTx?.amount).toBe(120);
      expect(debitTx?.balanceBefore).toBe(1000);
      expect(debitTx?.balanceAfter).toBe(880);
      expect(debitTx?.caseId).toBe(result.caseId);
    });

    it('rejects case submission when partner wallet balance is insufficient (zero overdraft invariant)', async () => {
      // Partner wallet starts with 0 balance
      const input: CaseLifecycleInput = {
        tenantId: partnerSession.tenantId,
        callerSession: partnerSession,
        destinationCountry: 'SG',
        visaCategory: 'business_visit',
        applicantName: 'Overdraft Test',
        applicantEmail: 'overdraft@test.com',
        passportData: validPassportData,
        intakeAnswers: {},
        paymentOptions: {
          scheduleType: 'upfront_full',
          payViaWallet: true,
          feeAmount: 250,
          currency: 'USD',
        },
      };

      await expect(CaseLifecycleWorkflow.run(input)).rejects.toThrow(InsufficientFundsError);
    });
  });

  describe('4. Milestone Split Payment Schedule', () => {
    it('creates milestone invoice and multi-stage payment session', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: clientSession,
        destinationCountry: 'DE', // Germany Job Seeker
        visaCategory: 'job_seeker',
        applicantName: 'Jane Smith',
        applicantEmail: 'jane.smith@example.com',
        passportData: validPassportData,
        intakeAnswers: {
          yearsExperience: 6,
          degreeLevel: 'Master of Engineering',
        },
        paymentOptions: {
          scheduleType: 'milestone_split',
          currency: 'EUR',
          feeAmount: 1000,
          milestones: [
            { name: 'Stage 1: Document Audit & Strategy', percentage: 40, amount: 400 },
            { name: 'Stage 2: Embassy Filing Submission', percentage: 40, amount: 400 },
            { name: 'Stage 3: Decision & Passport Return', percentage: 20, amount: 200 },
          ],
        },
      };

      const result = await CaseLifecycleWorkflow.run(input);

      expect(result.paymentSettlement.scheduleType).toBe('milestone_split');
      expect(result.paymentSettlement.amount).toBe(1000);
      expect(result.paymentSettlement.currency).toBe('EUR');
      expect(result.paymentSettlement.status).toBe('pending');
      expect(result.paymentSettlement.referenceId).toMatch(/^cs_/);

      // Verify invoice records
      expect(result.paymentSettlement.invoiceId).toBeDefined();
      const invoice = await InvoiceService.getInvoice(
        staffSession,
        result.paymentSettlement.invoiceId!,
      );
      expect(invoice.paymentScheduleType).toBe('milestone_split');
      expect(invoice.milestones).toHaveLength(3);
      expect(invoice.amount).toBe(1000);

      const caseRecord = await CaseService.getCaseById(staffSession, result.caseId);
      expect(caseRecord.countryCode).toBe('DE');
    });

    it('routes BDT payments to Pay Station gateway adapter', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: clientSession,
        destinationCountry: 'SG',
        visaCategory: 'tourist_sgac',
        applicantName: 'Local Applicant',
        applicantEmail: 'local@dhaka.com',
        passportData: validPassportData,
        intakeAnswers: {},
        paymentOptions: {
          scheduleType: 'upfront_full',
          currency: 'BDT',
          feeAmount: 5500,
        },
      };

      const result = await CaseLifecycleWorkflow.run(input);

      expect(result.paymentSettlement.currency).toBe('BDT');
      expect(result.paymentSettlement.referenceId).toMatch(/^ps_sess_/);
    });
  });

  describe('5. Client Shielding & Data Isolation (ADR-012)', () => {
    it('shields internal caseworker confidence scores and audit internals from retail clients', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: clientSession,
        clientTier: 'b2c_retail',
        destinationCountry: 'SG',
        visaCategory: 'tourist_sgac',
        applicantName: 'Retail User',
        applicantEmail: 'retail@test.com',
        passportData: validPassportData,
        intakeAnswers: {},
        paymentOptions: {
          scheduleType: 'upfront_full',
          currency: 'USD',
          feeAmount: 65,
        },
      };

      const rawResult = await CaseLifecycleWorkflow.run(input);
      const shieldedView = CaseLifecycleWorkflow.toShieldedView(rawResult, 'b2c_retail');

      expect(shieldedView['isShielded']).toBe(true);
      expect(shieldedView['caseId']).toBe(rawResult.caseId);
      expect(shieldedView['status']).toBe(rawResult.status);

      // Internal caseworker internals MUST be stripped
      expect(shieldedView['confidenceScore']).toBeUndefined();
      expect(shieldedView['autonomyLevel']).toBeUndefined();
      expect(shieldedView['dryRunTrace']).toBeUndefined();
      expect(shieldedView['consularSafetyResult']).toBeUndefined();
      expect(shieldedView['steps']).toBeUndefined();
    });

    it('preserves full operational internals for internal staff view', async () => {
      const input: CaseLifecycleInput = {
        tenantId: 'tenant-visahobe-platform',
        callerSession: staffSession,
        clientTier: 'internal_staff',
        destinationCountry: 'SG',
        visaCategory: 'tourist_sgac',
        applicantName: 'Internal Staff Test',
        applicantEmail: 'staff@visahobe.com',
        passportData: validPassportData,
        intakeAnswers: {},
        paymentOptions: {
          scheduleType: 'upfront_full',
          currency: 'USD',
          feeAmount: 65,
        },
      };

      const rawResult = await CaseLifecycleWorkflow.run(input);
      const staffView = CaseLifecycleWorkflow.toShieldedView(rawResult, 'internal_staff');

      expect(staffView['confidenceScore']).toBeDefined();
      expect(staffView['autonomyLevel']).toBe('level_3_autonomous_submission');
      expect(staffView['dryRunTrace']).toBeDefined();
      expect(staffView['consularSafetyResult']).toBeDefined();
      expect(staffView['steps']).toBeDefined();
    });
  });
});
