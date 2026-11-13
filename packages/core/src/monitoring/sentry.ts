import { redactPii } from '../security/pii/redactor.js';
import { sanitizeStackTrace } from '../security/pii/stack-sanitizer.js';

export interface SentryBreadcrumb {
  type?: string | undefined;
  category?: string | undefined;
  message?: string | undefined;
  data?: Record<string, unknown> | undefined;
  timestamp?: number | undefined;
  level?: string | undefined;
}

export interface SentryException {
  type?: string | undefined;
  value?: string | undefined;
  stacktrace?:
    | {
        frames?:
          | Array<{
              filename?: string | undefined;
              function?: string | undefined;
              vars?: Record<string, unknown> | undefined;
              [key: string]: unknown;
            }>
          | undefined;
        [key: string]: unknown;
      }
    | undefined;
  [key: string]: unknown;
}

export interface SentryRequest {
  url?: string | undefined;
  method?: string | undefined;
  data?: unknown | undefined;
  query_string?: string | undefined;
  cookies?: Record<string, string> | undefined;
  headers?: Record<string, string> | undefined;
  [key: string]: unknown;
}

export interface SentryUser {
  id?: string | undefined;
  username?: string | undefined;
  email?: string | undefined;
  ip_address?: string | undefined;
  [key: string]: unknown;
}

export interface SentryEvent {
  event_id?: string | undefined;
  message?: string | undefined;
  timestamp?: number | undefined;
  level?: string | undefined;
  platform?: string | undefined;
  logger?: string | undefined;
  server_name?: string | undefined;
  release?: string | undefined;
  environment?: string | undefined;
  user?: SentryUser | undefined;
  request?: SentryRequest | undefined;
  breadcrumbs?: SentryBreadcrumb[] | undefined;
  exception?:
    | {
        values?: SentryException[] | undefined;
        [key: string]: unknown;
      }
    | undefined;
  tags?: Record<string, string | number | boolean> | undefined;
  extra?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

export interface SentryHint {
  originalException?: unknown | undefined;
  syntheticException?: unknown | undefined;
  [key: string]: unknown;
}

/**
 * Creates a Sentry beforeSend hook that passes all event data, stack traces,
 * breadcrumbs, user info, and requests through the PII redactor before transmission.
 */
export function createSentryBeforeSendHook() {
  return function beforeSend(event: SentryEvent, _hint?: SentryHint): SentryEvent {
    const sanitized: SentryEvent = { ...event };

    // 1. Sanitize Top-Level Message
    if (sanitized.message) {
      sanitized.message = redactPii(sanitized.message);
    }

    // 2. Sanitize Exceptions & Stacktraces
    if (sanitized.exception?.values) {
      sanitized.exception = {
        ...sanitized.exception,
        values: sanitized.exception.values.map((exc) => {
          const sanitizedExc: SentryException = {
            ...exc,
            value: exc.value ? sanitizeStackTrace(redactPii(exc.value)) : exc.value,
          };

          if (exc.stacktrace?.frames) {
            sanitizedExc.stacktrace = {
              ...exc.stacktrace,
              frames: exc.stacktrace.frames.map((frame) => {
                const sanitizedFrame = { ...frame };
                if (sanitizedFrame.filename) {
                  sanitizedFrame.filename = sanitizeStackTrace(sanitizedFrame.filename);
                }
                if (sanitizedFrame.vars) {
                  sanitizedFrame.vars = redactPii(sanitizedFrame.vars);
                }
                return sanitizedFrame;
              }),
            };
          }

          return sanitizedExc;
        }),
      };
    }

    // 3. Sanitize Breadcrumbs
    if (sanitized.breadcrumbs && Array.isArray(sanitized.breadcrumbs)) {
      sanitized.breadcrumbs = sanitized.breadcrumbs.map((crumb) => {
        const sanitizedCrumb: SentryBreadcrumb = { ...crumb };
        if (sanitizedCrumb.message) {
          sanitizedCrumb.message = redactPii(sanitizedCrumb.message);
        }
        if (sanitizedCrumb.data) {
          sanitizedCrumb.data = redactPii(sanitizedCrumb.data);
        }
        return sanitizedCrumb;
      });
    }

    // 4. Sanitize Request Payload & Headers
    if (sanitized.request) {
      const sanitizedReq: SentryRequest = { ...sanitized.request };
      if (sanitizedReq.url) {
        sanitizedReq.url = sanitizeStackTrace(sanitizedReq.url);
      }
      if (sanitizedReq.query_string) {
        sanitizedReq.query_string = sanitizeStackTrace(sanitizedReq.query_string);
      }
      if (sanitizedReq.headers) {
        sanitizedReq.headers = redactPii(sanitizedReq.headers);
      }
      if (sanitizedReq.cookies) {
        sanitizedReq.cookies = redactPii(sanitizedReq.cookies);
      }
      if (sanitizedReq.data) {
        sanitizedReq.data = redactPii(sanitizedReq.data);
      }
      sanitized.request = sanitizedReq;
    }

    // 5. Sanitize User Context
    if (sanitized.user) {
      sanitized.user = redactPii(sanitized.user);
    }

    // 6. Sanitize Extra & Tags
    if (sanitized.extra) {
      sanitized.extra = redactPii(sanitized.extra);
    }
    if (sanitized.tags) {
      sanitized.tags = redactPii(sanitized.tags);
    }

    return sanitized;
  };
}
