import { createHash } from 'crypto';
import {
  ConsularFieldMapper,
  type ApplicantProfileInput,
} from '../mapping/consular-field-mapper.js';
import type {
  BrowserExecutionPlan,
  BrowserExecutionStep,
  ConsularFormField,
  DryRunTrace,
} from '../types.js';

export interface GeneratePlanOptions {
  caseId: string;
  tenantId: string;
  countryCode: string;
  applicantData: ApplicantProfileInput;
  hasPaymentAction?: boolean | undefined;
  hasBiometricsAction?: boolean | undefined;
  hasPerjuryAffidavitAction?: boolean | undefined;
}

export class DryRunTracer {
  /**
   * Masks sensitive string values for audit-safe dry run traces.
   */
  public static maskValue(field: ConsularFormField): string {
    if (!field.isSensitive) {
      return field.value;
    }
    const val = field.value.trim();
    if (field.fieldId.includes('passport')) {
      if (val.length <= 4) return '****';
      return `${val.slice(0, 2)}${'*'.repeat(val.length - 4)}${val.slice(-2)}`;
    }
    if (field.fieldId.includes('birth') || field.fieldId.includes('dob')) {
      const match = val.match(/^(\d{4})[-/.]/);
      return match ? `${match[1]}-**-**` : '****-**-**';
    }
    if (field.fieldId.includes('email')) {
      const atIndex = val.indexOf('@');
      if (atIndex > 1) {
        return `${val[0]}***${val.slice(atIndex)}`;
      }
      return '***@***.com';
    }
    return '********';
  }

  /**
   * Generates a deterministic browser execution plan for a visa application case.
   */
  public static generatePlan(options: GeneratePlanOptions): BrowserExecutionPlan {
    const {
      caseId,
      tenantId,
      countryCode,
      applicantData,
      hasPaymentAction = false,
      hasBiometricsAction = false,
      hasPerjuryAffidavitAction = false,
    } = options;

    const portalConfig = ConsularFieldMapper.getPortalConfig(countryCode);
    const mappedFields = ConsularFieldMapper.mapApplicantToFields(countryCode, applicantData);
    const steps: BrowserExecutionStep[] = [];
    const safetyBlockReasons: string[] = [];

    let stepIndex = 1;

    // Step 1: Navigation
    steps.push({
      stepIndex: stepIndex++,
      action: 'navigate',
      description: `Navigate to target consular portal: ${portalConfig.portalName}`,
      target: portalConfig.portalUrl,
      isSafetyGate: false,
      status: 'planned',
    });

    // Step 2: Domain verification
    steps.push({
      stepIndex: stepIndex++,
      action: 'verify_domain',
      description: `Verify SSL handshake and domain allowlist strictly matching [${portalConfig.allowedDomains.join(
        ', ',
      )}]`,
      target: portalConfig.allowedDomains[0],
      isSafetyGate: false,
      status: 'planned',
    });

    // Step 3..N: Form field inputs
    for (const field of mappedFields) {
      const masked = DryRunTracer.maskValue(field);
      steps.push({
        stepIndex: stepIndex++,
        action: field.fieldType === 'select' ? 'select_option' : 'input_field',
        description: `Populate field '${field.label}' (${field.fieldId})`,
        target: field.selector,
        maskedValue: masked,
        isSafetyGate: false,
        status: 'planned',
      });
    }

    // Consular Safety Gates inspection (ADR-011 §3.2)
    if (hasPaymentAction || portalConfig.requiresPaymentGate) {
      if (hasPaymentAction) {
        safetyBlockReasons.push(
          'Autonomous execution of live consular portal payment is strictly prohibited. Human financial authorization required.',
        );
        steps.push({
          stepIndex: stepIndex++,
          action: 'safety_checkpoint',
          description: 'Halt at live government portal payment gate (Mandatory Human Sign-off)',
          isSafetyGate: true,
          status: 'blocked_by_safety_gate',
        });
      }
    }

    if (hasBiometricsAction || portalConfig.requiresBiometrics) {
      if (hasBiometricsAction) {
        safetyBlockReasons.push(
          'Autonomous scheduling of consular biometrics / interview is strictly prohibited. Human staff inspection required.',
        );
        steps.push({
          stepIndex: stepIndex++,
          action: 'safety_checkpoint',
          description:
            'Halt at consular biometrics appointment scheduler (Mandatory Human Sign-off)',
          isSafetyGate: true,
          status: 'blocked_by_safety_gate',
        });
      }
    }

    if (hasPerjuryAffidavitAction) {
      safetyBlockReasons.push(
        'Autonomous signing of statutory perjury affidavit is strictly prohibited. Human legal signature required.',
      );
      steps.push({
        stepIndex: stepIndex++,
        action: 'safety_checkpoint',
        description:
          'Halt at statutory declaration under penalty of perjury (Mandatory Human Sign-off)',
        isSafetyGate: true,
        status: 'blocked_by_safety_gate',
      });
    }

    const isExecutionAllowed = safetyBlockReasons.length === 0 && portalConfig.isEvisaSupported;

    if (isExecutionAllowed) {
      steps.push({
        stepIndex: stepIndex++,
        action: 'submit_form',
        description: 'Submit verified e-visa payload to government electronic intake endpoint',
        target: portalConfig.portalUrl,
        isSafetyGate: false,
        status: 'planned',
      });
    }

    const planId = `plan-${createHash('md5').update(`${caseId}-${countryCode}`).digest('hex').slice(0, 10)}`;

    return {
      id: planId,
      caseId,
      tenantId,
      countryCode: portalConfig.countryCode,
      portalConfig,
      mappedFields,
      steps,
      isExecutionAllowed,
      safetyBlockReasons,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Executes a dry-run trace over an execution plan, computing cryptographic trace hash.
   */
  public static executeDryRunTrace(plan: BrowserExecutionPlan): DryRunTrace {
    let executedStepsCount = 0;
    let isCompleted = true;
    let haltedAtStep: number | undefined;
    let safetyHaltReason: string | undefined;

    for (const step of plan.steps) {
      if (step.status === 'blocked_by_safety_gate') {
        isCompleted = false;
        haltedAtStep = step.stepIndex;
        safetyHaltReason = step.description;
        break;
      }
      executedStepsCount++;
    }

    const rawTraceDigest = JSON.stringify({
      planId: plan.id,
      caseId: plan.caseId,
      countryCode: plan.countryCode,
      executedStepsCount,
      isCompleted,
      haltedAtStep,
      safetyHaltReason,
    });

    const traceHash = createHash('sha256').update(rawTraceDigest).digest('hex');
    const traceId = `trc-${traceHash.slice(0, 12)}`;

    const redactedTraceSummary = isCompleted
      ? `Dry-run execution completed cleanly (${executedStepsCount} steps verified). Form mapped for ${plan.portalConfig.portalName}.`
      : `Dry-run halted at step ${haltedAtStep} due to Consular Safety Gate: ${safetyHaltReason}`;

    return {
      traceId,
      planId: plan.id,
      caseId: plan.caseId,
      tenantId: plan.tenantId,
      countryCode: plan.countryCode,
      executedStepsCount,
      isCompleted,
      haltedAtStep,
      safetyHaltReason,
      redactedTraceSummary,
      traceHash,
      generatedAt: new Date().toISOString(),
    };
  }
}
