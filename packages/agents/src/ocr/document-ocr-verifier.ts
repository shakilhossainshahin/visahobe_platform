import type { DocumentOcrFieldResult, DocumentOcrResult } from '../types.js';

export class DocumentOcrVerifier {
  /**
   * Masks a passport number preserving first 2 and last 2 characters.
   * e.g. "A12345678" -> "A1*****78"
   */
  public static maskPassportNumber(passportNumber: string | undefined): string {
    if (!passportNumber || typeof passportNumber !== 'string') {
      return '[REDACTED_PASSPORT]';
    }
    const clean = passportNumber.trim();
    if (clean.length <= 4) {
      return '****';
    }
    const prefix = clean.slice(0, 2);
    const suffix = clean.slice(-2);
    const middleStars = '*'.repeat(clean.length - 4);
    return `${prefix}${middleStars}${suffix}`;
  }

  /**
   * Masks birth date to keep year while masking month and day.
   * e.g. "1992-08-14" -> "1992-**-**"
   */
  public static maskBirthDate(dateStr: string | undefined): string {
    if (!dateStr || typeof dateStr !== 'string') {
      return '[REDACTED_DOB]';
    }
    const match = dateStr.trim().match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})$/);
    if (match && match[1]) {
      return `${match[1]}-**-**`;
    }
    return '****-**-**';
  }

  /**
   * Redacts MRZ lines preserving document type and country code only.
   */
  public static maskMrz(mrzLine: string | undefined): string {
    if (!mrzLine || typeof mrzLine !== 'string') {
      return '[REDACTED_MRZ]';
    }
    const clean = mrzLine.trim();
    if (clean.length < 5) {
      return '*'.repeat(clean.length);
    }
    return `${clean.slice(0, 5)}${'*'.repeat(clean.length - 5)}`;
  }

  /**
   * Redacts OCR fields object for safe logging and dry-run execution traces.
   */
  public static redactOcrFields(fields: DocumentOcrFieldResult): Record<string, unknown> {
    const redacted: Record<string, unknown> = { ...fields };

    if (fields.passportNumber) {
      redacted.passportNumber = DocumentOcrVerifier.maskPassportNumber(fields.passportNumber);
    }
    if (fields.birthDate) {
      redacted.birthDate = DocumentOcrVerifier.maskBirthDate(fields.birthDate);
    }
    if (fields.mrzLine1) {
      redacted.mrzLine1 = DocumentOcrVerifier.maskMrz(fields.mrzLine1);
    }
    if (fields.mrzLine2) {
      redacted.mrzLine2 = DocumentOcrVerifier.maskMrz(fields.mrzLine2);
    }

    return redacted;
  }

  /**
   * Verifies passport OCR extraction payload, computes confidence score,
   * validates mandatory fields, checks expiry date validity.
   */
  public static verifyPassport(
    documentId: string,
    fields: DocumentOcrFieldResult,
  ): DocumentOcrResult {
    const issues: string[] = [];
    let score = 1.0;

    // 1. Mandatory field completeness checks
    if (!fields.passportNumber || fields.passportNumber.trim().length < 5) {
      issues.push('Missing or invalid passport number');
      score -= 0.35;
    }

    if (!fields.fullName || fields.fullName.trim().length < 2) {
      issues.push('Missing or incomplete applicant name');
      score -= 0.25;
    }

    if (!fields.nationality || fields.nationality.trim().length < 2) {
      issues.push('Missing applicant nationality');
      score -= 0.15;
    }

    if (!fields.birthDate) {
      issues.push('Missing date of birth');
      score -= 0.1;
    }

    // 2. Expiry date & validity check (passport must not be expired)
    if (!fields.expiryDate) {
      issues.push('Missing passport expiry date');
      score -= 0.25;
    } else {
      const expiry = new Date(fields.expiryDate);
      if (isNaN(expiry.getTime())) {
        issues.push('Malformed passport expiry date');
        score -= 0.2;
      } else {
        const now = new Date();
        if (expiry.getTime() <= now.getTime()) {
          issues.push('Passport is expired');
          score -= 0.5;
        } else {
          // Check for 6-month validity rule
          const sixMonthsAhead = new Date();
          sixMonthsAhead.setMonth(now.getMonth() + 6);
          if (expiry.getTime() < sixMonthsAhead.getTime()) {
            issues.push('Passport has less than 6 months validity remaining');
            score -= 0.1;
          }
        }
      }
    }

    // 3. MRZ format validation
    if (fields.mrzLine1 && fields.mrzLine2) {
      const l1 = fields.mrzLine1.trim();
      const l2 = fields.mrzLine2.trim();
      if (l1.length !== 44 || l2.length !== 44) {
        issues.push('MRZ line length mismatch (expected TD3 44-character lines)');
        score -= 0.05;
      } else {
        fields.mrzValid = true;
      }
    }

    const confidenceScore = Math.max(0.0, Math.min(1.0, parseFloat(score.toFixed(2))));
    const isValid =
      confidenceScore >= 0.8 && issues.filter((i) => i.includes('expired')).length === 0;

    return {
      documentId,
      documentType: 'passport',
      extractedFields: fields,
      confidenceScore,
      isValid,
      issues,
      verifiedAt: new Date().toISOString(),
    };
  }
}
