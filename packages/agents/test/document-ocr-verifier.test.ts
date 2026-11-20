import { describe, expect, it } from 'vitest';
import { DocumentOcrVerifier } from '../src/ocr/document-ocr-verifier.js';

describe('DocumentOcrVerifier', () => {
  it('masks passport numbers correctly to prevent PII exposure', () => {
    expect(DocumentOcrVerifier.maskPassportNumber('A12345678')).toBe('A1*****78');
    expect(DocumentOcrVerifier.maskPassportNumber('EB1234567')).toBe('EB*****67');
    expect(DocumentOcrVerifier.maskPassportNumber('ABC')).toBe('****');
    expect(DocumentOcrVerifier.maskPassportNumber(undefined)).toBe('[REDACTED_PASSPORT]');
  });

  it('masks birth dates preserving year only', () => {
    expect(DocumentOcrVerifier.maskBirthDate('1994-05-12')).toBe('1994-**-**');
    expect(DocumentOcrVerifier.maskBirthDate('1988/11/20')).toBe('1988-**-**');
    expect(DocumentOcrVerifier.maskBirthDate(undefined)).toBe('[REDACTED_DOB]');
  });

  it('masks MRZ strings keeping format prefix', () => {
    const mrz = 'P<BGDDAS<<SHAHIN<<<<<<<<<<<<<<<<<<<<<<<<<<<<';
    const masked = DocumentOcrVerifier.maskMrz(mrz);
    expect(masked.startsWith('P<BGD')).toBe(true);
    expect(masked.endsWith('****')).toBe(true);
  });

  it('verifies valid passport OCR payload with high confidence', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);

    const result = DocumentOcrVerifier.verifyPassport('doc-101', {
      passportNumber: 'A01234567',
      fullName: 'Shahin Shakil',
      nationality: 'BGD',
      birthDate: '1995-01-01',
      expiryDate: futureDate.toISOString().slice(0, 10),
      mrzLine1: 'P<BGDSHAHIN<<SHAKIL<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'A012345678BGD9501014M3001018<<<<<<<<<<<<<<04',
    });

    expect(result.isValid).toBe(true);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.issues).toHaveLength(0);
  });

  it('detects expired passport and heavily penalizes confidence score', () => {
    const result = DocumentOcrVerifier.verifyPassport('doc-expired', {
      passportNumber: 'B99887766',
      fullName: 'Expired Applicant',
      nationality: 'BGD',
      birthDate: '1980-05-10',
      expiryDate: '2020-01-01',
    });

    expect(result.isValid).toBe(false);
    expect(result.issues).toContain('Passport is expired');
    expect(result.confidenceScore).toBeLessThan(0.8);
  });
});
