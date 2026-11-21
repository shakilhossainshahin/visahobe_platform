import { randomUUID } from 'node:crypto';
import {
  AutonomyRouter,
  DocumentOcrVerifier,
  type ConsularAction,
  type ConsularActionType,
  type DocumentOcrFieldResult,
} from '@visahobe/agents';
import {
  AuditService,
  CaseService,
  InvoiceService,
  WalletService,
  type CaseStatus,
} from '@visahobe/api';
import { DryRunTracer } from '@visahobe/browser-automation';
import { ClientShieldingService, type ClientTier } from '@visahobe/core';
import { PaymentGatewayRegistry } from '@visahobe/integrations';
import type { CaseLifecycleInput, CaseLifecycleResult, CaseLifecycleStepResult } from './types.js';

export class CaseLifecycleWorkflow {
  /**
   * Executes the complete end-to-end vertical slice lifecycle:
   * 1. Intake assessment & eligibility qualification
   * 2. Case creation in tenant workspace
   * 3. Document OCR extraction & verification with PII masking
   * 4. Autonomy routing & Consular Safety Guard boundaries
   * 5. Payment settlement (B2B prepaid wallet debit or B2C gateway session)
   * 6. Consular form mapping & browser dry-run execution trace
   * 7. Audit log commitment & client tier data shielding
   */
  public static async run(input: CaseLifecycleInput): Promise<CaseLifecycleResult> {
    const workflowId = `wf-${randomUUID()}`;
    const steps: CaseLifecycleStepResult[] = [];
    let stepIndex = 1;

    // 1. Intake assessment & eligibility scoring
    let intakeScore = 60;
    if (input.intakeAnswers.hasJobOffer) intakeScore += 15;
    if (input.intakeAnswers.yearsExperience && input.intakeAnswers.yearsExperience >= 3)
      intakeScore += 10;
    if (input.intakeAnswers.salaryUsd && input.intakeAnswers.salaryUsd >= 50000) intakeScore += 10;
    if (
      input.intakeAnswers.degreeLevel &&
      typeof input.intakeAnswers.degreeLevel === 'string' &&
      ['Master', 'PhD', 'Doctorate', 'Bachelor'].some((deg) =>
        (input.intakeAnswers.degreeLevel as string).toLowerCase().includes(deg.toLowerCase()),
      )
    ) {
      intakeScore += 5;
    }
    const score = Math.min(100, Math.max(0, intakeScore));
    const qualified = score >= 60;
    const tier = score >= 85 ? 'priority' : score >= 70 ? 'premium' : 'standard';

    steps.push({
      stepIndex: stepIndex++,
      stepName: 'intake_assessment',
      status: qualified ? 'completed' : 'gated',
      timestamp: new Date().toISOString(),
      details: { score, tier, qualified },
    });

    // 2. Case creation / provisioning in CaseService
    const caseRecord = await CaseService.createCase(input.callerSession, {
      countryCode: input.destinationCountry,
      serviceType: input.visaCategory,
      clientId: input.callerSession.userId,
      priority: tier === 'priority' ? 'urgent' : tier === 'premium' ? 'high' : 'standard',
      status: 'draft',
      metadata: {
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        workflowId,
        intakeTier: tier,
      },
    });

    steps.push({
      stepIndex: stepIndex++,
      stepName: 'case_provisioning',
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        caseId: caseRecord.id,
        caseNumber: caseRecord.caseNumber,
        tenantId: caseRecord.tenantId,
      },
    });

    // 3. Document OCR extraction & verification
    const ocrFields: DocumentOcrFieldResult = {
      passportNumber: input.passportData.passportNumber,
      fullName: `${input.passportData.givenNames} ${input.passportData.surname}`.trim(),
      nationality: input.passportData.nationality,
      birthDate: input.passportData.dateOfBirth,
      sex: input.passportData.gender,
      expiryDate: input.passportData.expiryDate,
      issuingCountry: input.passportData.issuingCountry,
      mrzLine1: input.passportData.mrzLine1,
      mrzLine2: input.passportData.mrzLine2,
    };
    const ocrResult = DocumentOcrVerifier.verifyPassport(
      `doc-${caseRecord.id}-passport`,
      ocrFields,
    );
    const maskedPassportNumber = DocumentOcrVerifier.maskPassportNumber(
      input.passportData.passportNumber,
    );

    steps.push({
      stepIndex: stepIndex++,
      stepName: 'document_ocr_verification',
      status: ocrResult.isValid ? 'completed' : 'gated',
      timestamp: new Date().toISOString(),
      details: {
        valid: ocrResult.isValid,
        confidenceScore: ocrResult.confidenceScore,
        maskedPassport: maskedPassportNumber,
        issuesCount: ocrResult.issues.length,
      },
    });

    // 4. Autonomy Routing & Consular Safety Gate
    const attemptedActions: ConsularAction[] = (input.attemptRestrictedActions ?? []).map(
      (actionType) => ({
        id: `act-${randomUUID()}`,
        actionType: actionType as ConsularActionType,
        destinationCountry: input.destinationCountry,
        description: `Attempted execution of ${actionType}`,
        metadata: { caseId: caseRecord.id },
      }),
    );

    const autonomyEval = AutonomyRouter.evaluateAutonomy({
      destinationCountry: input.destinationCountry,
      confidenceScore: ocrResult.confidenceScore,
      actions: attemptedActions,
      ocrResult,
    });

    const hasSafetyBlock = autonomyEval.blockedSafetyActions.length > 0;
    const isLevel3 = autonomyEval.level === 'level_3_autonomous_submission';

    let targetCaseStatus: CaseStatus = 'draft';
    if (autonomyEval.requiresHumanVerification || hasSafetyBlock) {
      targetCaseStatus = 'specialist_review';
    } else if (isLevel3 && ocrResult.isValid) {
      targetCaseStatus = 'consular_filing';
    } else {
      targetCaseStatus = 'intake_submitted';
    }

    await CaseService.transitionCaseStatusSystem(
      caseRecord.id,
      targetCaseStatus,
      autonomyEval.reason,
    );

    steps.push({
      stepIndex: stepIndex++,
      stepName: 'autonomy_and_consular_safety_gate',
      status: hasSafetyBlock ? 'gated' : 'completed',
      timestamp: new Date().toISOString(),
      details: {
        level: autonomyEval.level,
        isAutonomousEligible: autonomyEval.isAutonomousEligible,
        requiresHumanVerification: autonomyEval.requiresHumanVerification,
        hasConsularSafetyBlock: hasSafetyBlock,
        blockedActions: autonomyEval.blockedSafetyActions,
        caseStatus: targetCaseStatus,
      },
    });

    // 5. Payment Settlement (Prepaid Wallet vs Gateway Session)
    let paymentSettlement: CaseLifecycleResult['paymentSettlement'];

    if (input.paymentOptions.payViaWallet) {
      const walletTenantId = input.paymentOptions.walletTenantId ?? input.tenantId;
      const { transaction } = await WalletService.deductCaseFee(
        input.callerSession,
        caseRecord.id,
        input.paymentOptions.feeAmount,
        `Case fee deduction: ${input.destinationCountry} ${input.visaCategory}`,
        walletTenantId,
      );

      paymentSettlement = {
        settled: true,
        method: 'wallet_debit',
        amount: input.paymentOptions.feeAmount,
        currency: input.paymentOptions.currency,
        referenceId: transaction.id,
        scheduleType: input.paymentOptions.scheduleType,
        status: 'paid',
      };
    } else {
      const invoice = await InvoiceService.createCaseInvoice(input.callerSession, {
        caseId: caseRecord.id,
        tenantId: input.tenantId,
        clientId: input.callerSession.userId,
        amount: input.paymentOptions.feeAmount,
        currency: input.paymentOptions.currency,
        paymentScheduleType: input.paymentOptions.scheduleType,
        milestones: input.paymentOptions.milestones,
      });

      const adapter = PaymentGatewayRegistry.resolveAdapterForCurrency(
        input.paymentOptions.currency,
      );
      const sessionResult = await adapter.createPaymentSession({
        referenceId: invoice.id,
        referenceType: 'invoice',
        caseId: caseRecord.id,
        tenantId: input.tenantId,
        amount: input.paymentOptions.feeAmount,
        currency: input.paymentOptions.currency,
        paymentScheduleType: input.paymentOptions.scheduleType,
        milestones: invoice.milestones
          ? (invoice.milestones as unknown as import('@visahobe/integrations').PaymentMilestone[])
          : undefined,
        customerEmail: input.applicantEmail,
        customerName: input.applicantName,
        redirectUrl: `https://visahobe.com/cases/${caseRecord.id}/payment-success`,
        cancelUrl: `https://visahobe.com/cases/${caseRecord.id}/payment-cancel`,
        metadata: { invoiceId: invoice.id, caseId: caseRecord.id },
      });

      paymentSettlement = {
        settled: false,
        method: 'gateway_session',
        amount: input.paymentOptions.feeAmount,
        currency: input.paymentOptions.currency,
        referenceId: sessionResult.sessionId,
        invoiceId: invoice.id,
        scheduleType: input.paymentOptions.scheduleType,
        status: 'pending',
      };
    }

    steps.push({
      stepIndex: stepIndex++,
      stepName: 'payment_settlement',
      status:
        paymentSettlement.status === 'paid' || paymentSettlement.status === 'pending'
          ? 'completed'
          : 'failed',
      timestamp: new Date().toISOString(),
      details: {
        settled: paymentSettlement.settled,
        method: paymentSettlement.method,
        amount: paymentSettlement.amount,
        currency: paymentSettlement.currency,
        referenceId: paymentSettlement.referenceId,
      },
    });

    // 6. Consular Form Mapping & Dry-Run Trace
    const plan = DryRunTracer.generatePlan({
      caseId: caseRecord.id,
      tenantId: input.tenantId,
      countryCode: input.destinationCountry,
      applicantData: {
        passportNumber: input.passportData.passportNumber,
        fullName: `${input.passportData.givenNames} ${input.passportData.surname}`.trim(),
        nationality: input.passportData.nationality,
        birthDate: input.passportData.dateOfBirth,
        gender: input.passportData.gender,
        expiryDate: input.passportData.expiryDate,
        email: input.applicantEmail,
        phone: input.applicantPhone,
      },
      hasPaymentAction: (input.attemptRestrictedActions ?? []).includes('portal_payment'),
      hasBiometricsAction: (input.attemptRestrictedActions ?? []).includes('schedule_biometrics'),
      hasPerjuryAffidavitAction: (input.attemptRestrictedActions ?? []).includes(
        'sign_perjury_affidavit',
      ),
    });

    const trace = DryRunTracer.executeDryRunTrace(plan);

    steps.push({
      stepIndex: stepIndex++,
      stepName: 'consular_dry_run_trace',
      status: trace.isCompleted ? 'completed' : 'gated',
      timestamp: new Date().toISOString(),
      details: {
        traceId: trace.traceId,
        planId: plan.id,
        isCompleted: trace.isCompleted,
        stepCount: trace.executedStepsCount,
        haltedAtStep: trace.haltedAtStep,
      },
    });

    // 7. Audit log commitment & Client Tier Shielding
    await AuditService.recordLog(input.callerSession, {
      action: 'workflow.case_lifecycle_executed',
      entityType: 'CaseWorkflow',
      entityId: caseRecord.id,
      newValues: {
        workflowId,
        status: targetCaseStatus,
        autonomyLevel: autonomyEval.level,
        requiresHumanVerification: autonomyEval.requiresHumanVerification,
        paymentMethod: paymentSettlement.method,
      },
      details: `Executed CaseLifecycleWorkflow for ${caseRecord.caseNumber}: autonomy=${autonomyEval.level}, payment=${paymentSettlement.status}`,
    });

    const resolvedTier =
      input.clientTier ??
      ClientShieldingService.resolveClientTier({
        userRole: input.callerSession.role,
      });

    const isShielded = resolvedTier === 'b2c_retail';

    return {
      workflowId,
      caseId: caseRecord.id,
      caseNumber: caseRecord.caseNumber,
      status: targetCaseStatus,
      autonomyLevel: autonomyEval.level,
      confidenceScore: ocrResult.confidenceScore,
      requiresHumanVerification: autonomyEval.requiresHumanVerification,
      verificationReason: autonomyEval.reason,
      intakeAssessment: {
        score,
        tier,
        qualified,
      },
      ocrResult: {
        valid: ocrResult.isValid,
        mrzValid: ocrResult.extractedFields.mrzValid ?? false,
        maskedPassportNumber,
        validUntil: input.passportData.expiryDate,
      },
      consularSafetyResult: {
        isAutonomousApproved: isLevel3 && !hasSafetyBlock,
        requiresHumanReview: autonomyEval.requiresHumanVerification,
        blockedActions: autonomyEval.blockedSafetyActions,
        reason: autonomyEval.reason,
      },
      paymentSettlement,
      dryRunTrace: {
        traceId: trace.traceId,
        stepCount: trace.executedStepsCount,
        checksum: trace.traceHash,
      },
      steps,
      completedAt: new Date().toISOString(),
      isShielded,
    };
  }

  /**
   * Applies client shielding to the lifecycle result, stripping internal caseworker confidence
   * scores, wholesale economics, and sensitive execution internals for retail clients.
   */
  public static toShieldedView(
    result: CaseLifecycleResult,
    clientTier: ClientTier = 'b2c_retail',
  ): Record<string, unknown> {
    if (clientTier === 'internal_staff') {
      return { ...result };
    }

    const shielded: Record<string, unknown> = {
      workflowId: result.workflowId,
      caseId: result.caseId,
      caseNumber: result.caseNumber,
      status: result.status,
      requiresHumanVerification: result.requiresHumanVerification,
      intakeAssessment: {
        tier: result.intakeAssessment.tier,
        qualified: result.intakeAssessment.qualified,
      },
      ocrResult: {
        valid: result.ocrResult.valid,
        maskedPassportNumber: result.ocrResult.maskedPassportNumber,
        validUntil: result.ocrResult.validUntil,
      },
      paymentSettlement: {
        settled: result.paymentSettlement.settled,
        amount: result.paymentSettlement.amount,
        currency: result.paymentSettlement.currency,
        referenceId: result.paymentSettlement.referenceId,
        invoiceId: result.paymentSettlement.invoiceId,
        scheduleType: result.paymentSettlement.scheduleType,
        status: result.paymentSettlement.status,
      },
      completedAt: result.completedAt,
      isShielded: true,
    };

    if (clientTier === 'b2b2c_partner') {
      shielded['autonomyLevel'] = result.autonomyLevel;
      shielded['dryRunTrace'] = result.dryRunTrace;
    }

    return shielded;
  }
}
