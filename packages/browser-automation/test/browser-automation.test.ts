import { describe, expect, it } from 'vitest';
import { ConsularFieldMapper, DryRunTracer } from '../src/index.js';

describe('ConsularFieldMapper', () => {
  it('returns valid portal configuration for supported countries', () => {
    const sgConfig = ConsularFieldMapper.getPortalConfig('SG');
    expect(sgConfig.countryCode).toBe('SG');
    expect(sgConfig.portalName).toContain('Singapore Immigration');
    expect(sgConfig.isEvisaSupported).toBe(true);
    expect(sgConfig.allowedDomains).toContain('ica.gov.sg');

    const aeConfig = ConsularFieldMapper.getPortalConfig('ae');
    expect(aeConfig.countryCode).toBe('AE');
    expect(aeConfig.isEvisaSupported).toBe(true);
    expect(aeConfig.allowedDomains).toContain('icp.gov.ae');

    const gbConfig = ConsularFieldMapper.getPortalConfig('GB');
    expect(gbConfig.isEvisaSupported).toBe(false);
    expect(gbConfig.requiresBiometrics).toBe(true);
  });

  it('maps applicant data into standardized form fields with sensitivity flags', () => {
    const fields = ConsularFieldMapper.mapApplicantToFields('SG', {
      fullName: 'Shahin Shakil',
      passportNumber: 'A12345678',
      nationality: 'BGD',
      birthDate: '1990-01-01',
      expiryDate: '2030-01-01',
      email: 'shahin@example.com',
      arrivalDate: '2026-12-15',
      flightNumber: 'SQ446',
    });

    expect(fields.length).toBeGreaterThan(6);
    const passportField = fields.find((f) => f.fieldId === 'passport_number');
    expect(passportField).toBeDefined();
    expect(passportField?.isSensitive).toBe(true);
    expect(passportField?.value).toBe('A12345678');

    const arrivalField = fields.find((f) => f.fieldId === 'sg_arrival_date');
    expect(arrivalField).toBeDefined();
    expect(arrivalField?.value).toBe('2026-12-15');
  });
});

describe('DryRunTracer', () => {
  it('masks sensitive field values during trace generation', () => {
    const maskedPassport = DryRunTracer.maskValue({
      fieldId: 'passport_number',
      selector: 'input',
      fieldType: 'text',
      label: 'Passport',
      value: 'B12345678',
      isSensitive: true,
      required: true,
    });
    expect(maskedPassport).toBe('B1*****78');

    const maskedDob = DryRunTracer.maskValue({
      fieldId: 'date_of_birth',
      selector: 'input',
      fieldType: 'date',
      label: 'DOB',
      value: '1995-05-20',
      isSensitive: true,
      required: true,
    });
    expect(maskedDob).toBe('1995-**-**');

    const unmaskedName = DryRunTracer.maskValue({
      fieldId: 'applicant_name',
      selector: 'input',
      fieldType: 'text',
      label: 'Name',
      value: 'Public Name',
      isSensitive: false,
      required: true,
    });
    expect(unmaskedName).toBe('Public Name');
  });

  it('generates a clean execution plan and executes dry-run trace for standard e-visa', () => {
    const plan = DryRunTracer.generatePlan({
      caseId: 'case-sg-test',
      tenantId: 'tenant-1',
      countryCode: 'SG',
      applicantData: {
        fullName: 'Jane Doe',
        passportNumber: 'E98765432',
        nationality: 'BGD',
        birthDate: '1992-03-10',
        expiryDate: '2032-03-10',
        email: 'jane@example.com',
      },
    });

    expect(plan.isExecutionAllowed).toBe(true);
    expect(plan.safetyBlockReasons).toHaveLength(0);
    expect(plan.steps.some((s) => s.action === 'submit_form')).toBe(true);

    const trace = DryRunTracer.executeDryRunTrace(plan);
    expect(trace.isCompleted).toBe(true);
    expect(trace.executedStepsCount).toBe(plan.steps.length);
    expect(trace.traceHash).toBeDefined();
    expect(trace.traceHash).toHaveLength(64);
    expect(trace.redactedTraceSummary).toContain('Dry-run execution completed cleanly');
  });

  it('halts dry-run execution at safety gate when restricted payment action is present', () => {
    const plan = DryRunTracer.generatePlan({
      caseId: 'case-pay-halt',
      tenantId: 'tenant-1',
      countryCode: 'SG',
      applicantData: {
        fullName: 'John Doe',
        passportNumber: 'P11223344',
      },
      hasPaymentAction: true,
    });

    expect(plan.isExecutionAllowed).toBe(false);
    expect(plan.safetyBlockReasons.length).toBeGreaterThan(0);
    expect(plan.steps.some((s) => s.status === 'blocked_by_safety_gate')).toBe(true);

    const trace = DryRunTracer.executeDryRunTrace(plan);
    expect(trace.isCompleted).toBe(false);
    expect(trace.haltedAtStep).toBeDefined();
    expect(trace.safetyHaltReason).toContain('Mandatory Human Sign-off');
    expect(trace.redactedTraceSummary).toContain('Consular Safety Gate');
  });
});
