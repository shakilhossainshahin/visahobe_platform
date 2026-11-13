import { REDACTED_MASK } from './constants.js';

/**
 * Sanitizes an error stack trace or error message to remove credentials,
 * user directories, and authorization tokens.
 */
export function sanitizeStackTrace(stackOrMessage: string): string {
  if (typeof stackOrMessage !== 'string' || !stackOrMessage) {
    return '';
  }

  let sanitized = stackOrMessage;

  // 1. Sanitize Database Connection Strings (e.g. postgresql://user:pass@host:5432/db)
  sanitized = sanitized.replace(
    /(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/gi,
    `$1${REDACTED_MASK.PASSWORD}$3`,
  );

  // 2. Sanitize generic URI basic auth (e.g. https://user:pass@host)
  sanitized = sanitized.replace(/(https?:\/\/[^:]+:)([^@]+)(@)/gi, `$1${REDACTED_MASK.PASSWORD}$3`);

  // 3. Sanitize URL query parameters with sensitive credentials
  sanitized = sanitized.replace(
    /([?&](?:token|auth|key|secret|password|api_key|access_token)=)([^&\s]+)/gi,
    `$1${REDACTED_MASK.TOKEN}`,
  );

  // 4. Sanitize Windows User Directories (e.g. C:\Users\john_doe\project -> C:\Users\[REDACTED_USER]\project)
  sanitized = sanitized.replace(
    /([a-zA-Z]:\\Users\\)[^\\]+(\\)/gi,
    `$1${REDACTED_MASK.USER_PATH}$2`,
  );

  // 5. Sanitize Unix/macOS User Directories (e.g. /home/john_doe/... or /Users/john_doe/...)
  sanitized = sanitized.replace(
    /(\/(?:home|Users)\/)[^/]+(\/)/gi,
    `$1${REDACTED_MASK.USER_PATH}$2`,
  );

  return sanitized;
}
