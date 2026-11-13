/**
 * PII Redaction Constants and Regex Patterns (TICKET-P0-007)
 */

export const REDACTED_MASK = {
  SENSITIVE_FIELD: '[REDACTED_SENSITIVE_FIELD]',
  SECRET: '[REDACTED_SECRET]',
  PASSWORD: '[REDACTED_PASSWORD]',
  TOKEN: '[REDACTED_TOKEN]',
  BEARER_TOKEN: '[REDACTED_BEARER_TOKEN]',
  CREDIT_CARD: '[REDACTED_CREDIT_CARD]',
  PASSPORT: '[REDACTED_PASSPORT]',
  NID: '[REDACTED_NID]',
  PHONE: '[REDACTED_PHONE]',
  EMAIL: '[REDACTED_EMAIL]',
  BANK_ACCOUNT: '[REDACTED_BANK_ACCOUNT]',
  NAME: '[REDACTED_NAME]',
  SSN: '[REDACTED_SSN]',
  TAX_ID: '[REDACTED_TAX_ID]',
  USER_PATH: '[REDACTED_USER]',
} as const;

/**
 * Normalized field name denylist for Layer 1 redaction.
 * Matched against lowercase, stripped keys (e.g. `passport_number` -> `passportnumber`).
 */
export const SENSITIVE_FIELD_DENYLIST: ReadonlySet<string> = new Set([
  'password',
  'passphrase',
  'secret',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'auth',
  'cookie',
  'setcookie',
  'mfa',
  'mfasecret',
  'totp',
  'totpsecret',
  'apikey',
  'clientsecret',
  'privatekey',
  'creditcard',
  'cardnumber',
  'pan',
  'cvv',
  'cvc',
  'securitycode',
  'passport',
  'passportnumber',
  'passportno',
  'nid',
  'nidnumber',
  'nationalid',
  'dob',
  'dateofbirth',
  'birthdate',
  'bankaccount',
  'accountnumber',
  'accountno',
  'iban',
  'routingnumber',
  'ssn',
  'socialsecurity',
  'taxid',
  'tin',
  'ein',
]);

/**
 * Pre-approved metadata keys for public / high-volume logging (Layer 2 allowlist).
 */
export const OPERATIONAL_LOG_ALLOWLIST: ReadonlySet<string> = new Set([
  'service',
  'level',
  'tenantId',
  'userId',
  'correlationId',
  'traceId',
  'action',
  'statusCode',
  'durationMs',
  'timestamp',
  'environment',
  'path',
  'method',
  'component',
]);

/**
 * Validates a credit card number using Luhn algorithm to prevent false positives.
 */
export function isValidLuhn(digits: string): boolean {
  const cleaned = digits.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let alternate = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}
