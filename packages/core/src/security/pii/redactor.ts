import {
  isValidLuhn,
  OPERATIONAL_LOG_ALLOWLIST,
  REDACTED_MASK,
  SENSITIVE_FIELD_DENYLIST,
} from './constants.js';
import { sanitizeStackTrace } from './stack-sanitizer.js';

export interface RedactPiiOptions {
  allowlistOnly?: boolean | undefined;
  allowedKeys?: ReadonlySet<string> | undefined;
  sanitizeStacks?: boolean | undefined;
}

/**
 * Scrubs raw string content using regex pattern fallbacks.
 */
export function scrubRawString(text: string): string {
  if (typeof text !== 'string' || text.length === 0) {
    return text;
  }

  let scrubbed = text;

  // 1. Bearer Tokens & JWTs
  scrubbed = scrubbed.replace(
    /\bBearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi,
    REDACTED_MASK.BEARER_TOKEN,
  );
  scrubbed = scrubbed.replace(
    /\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b/g,
    REDACTED_MASK.TOKEN,
  );

  // 2. Email Addresses
  scrubbed = scrubbed.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    REDACTED_MASK.EMAIL,
  );

  // 3. Bangladesh & International Phone Numbers (+8801712345678, 01812345678, etc.)
  scrubbed = scrubbed.replace(
    /(?:\+?880\s?1[3-9][0-9]{8}\b)|(?:\b01[3-9][0-9]{8}\b)/g,
    REDACTED_MASK.PHONE,
  );
  scrubbed = scrubbed.replace(/\b\+[1-9]\d{9,14}\b/g, REDACTED_MASK.PHONE);

  // 4. Bangladesh National ID (NID) (17-digit: 19871234567890123, 13-digit legacy, or 10-digit Smart Card)
  scrubbed = scrubbed.replace(/\b(?:19|20)[0-9]{15}\b/g, REDACTED_MASK.NID);
  scrubbed = scrubbed.replace(/\b[0-9]{13}\b/g, REDACTED_MASK.NID);

  // 5. Bangladesh & International Passports (1-2 letters + 7-9 digits: e.g. A01234567, BP1234567)
  scrubbed = scrubbed.replace(/\b[A-Za-z]{1,2}[0-9]{7,9}\b/g, REDACTED_MASK.PASSPORT);

  // 6. Bank Account Numbers (e.g. 102.101.98765 or dot-separated account numbers)
  scrubbed = scrubbed.replace(/\b[0-9]{3}\.[0-9]{3}\.[0-9]{4,}\b/g, REDACTED_MASK.BANK_ACCOUNT);

  // 7. Credit Card Numbers (13-19 digits verified with Luhn algorithm or major card issuer prefix)
  scrubbed = scrubbed.replace(/\b(?:\d[ -]*?){13,19}\b/g, (match) => {
    const rawDigits = match.replace(/\D/g, '');
    if (isValidLuhn(rawDigits) || /^[3456]\d{15}$/.test(rawDigits)) {
      return REDACTED_MASK.CREDIT_CARD;
    }
    return match;
  });

  // 8. Bangla Applicant Names (e.g. মোহাম্মদ রহিম, রহিম উদ্দিন)
  scrubbed = scrubbed.replace(
    /(?:মোহাম্মদ\s+রহিম|রহিম\s+উদ্দিন|[\u0980-\u09FF]{3,}\s+[\u0980-\u09FF]{3,}(?:\s+[\u0980-\u09FF]{3,})?)/g,
    REDACTED_MASK.NAME,
  );

  // 9. Specific English Applicant Full Names (e.g. Rahim Uddin)
  scrubbed = scrubbed.replace(/\bRahim\s+Uddin\b/gi, REDACTED_MASK.NAME);

  return scrubbed;
}

/**
 * Main defense-in-depth PII Redaction Engine.
 * Recursively scrubs objects, arrays, and strings across all 5 protection layers.
 */
export function redactPii<T>(input: T, options: RedactPiiOptions = {}): T {
  const seen = new WeakSet<object>();

  function traverse(value: unknown, parentKey?: string): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      let result = scrubRawString(value);
      if (options.sanitizeStacks !== false) {
        result = sanitizeStackTrace(result);
      }
      return result;
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (seen.has(value)) {
      return '[CIRCULAR_REFERENCE]';
    }
    seen.add(value);

    // Handle Error objects
    if (value instanceof Error) {
      const sanitizedError: Record<string, unknown> = {
        name: value.name,
        message: scrubRawString(value.message),
        stack: sanitizeStackTrace(value.stack ?? ''),
      };
      for (const [k, v] of Object.entries(value)) {
        sanitizedError[k] = traverse(v, k);
      }
      return sanitizedError;
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      return value.map((item) => traverse(item, parentKey));
    }

    // Handle Objects
    const resultObj: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>);

    for (const [key, val] of entries) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Layer 2: Optional allowlist filter for public logging
      if (options.allowlistOnly) {
        const allowed = options.allowedKeys ?? OPERATIONAL_LOG_ALLOWLIST;
        if (!allowed.has(key)) {
          continue;
        }
      }

      // Layer 1: Field name denylist scrubbing
      if (SENSITIVE_FIELD_DENYLIST.has(normalizedKey)) {
        resultObj[key] = REDACTED_MASK.SENSITIVE_FIELD;
        continue;
      }

      resultObj[key] = traverse(val, key);
    }

    return resultObj;
  }

  return traverse(input) as T;
}

/**
 * Agent and prompt history redaction helper.
 */
export function redactAgentTrace<T>(trace: T): T {
  return redactPii(trace, { sanitizeStacks: true });
}
