import { describe, expect, it } from 'vitest';
import { createSentryBeforeSendHook, REDACTED_MASK, SentryEvent } from '../src/index.js';

describe('Sentry Error Reporting & PII Scrubbing Hook Suite (TICKET-P0-007)', () => {
  const beforeSend = createSentryBeforeSendHook();

  it('should scrub exception value and stack frames before transmitting event', () => {
    const rawEvent: SentryEvent = {
      event_id: 'evt-12345',
      message: 'Failed to verify passport A01234567 for Rahim Uddin',
      exception: {
        values: [
          {
            type: 'DatabaseError',
            value:
              'Query failed at postgresql://postgres:mypassword@localhost:5432/visahobe with NID 19871234567890123',
            stacktrace: {
              frames: [
                {
                  filename: 'C:\\Users\\alice_developer\\app\\server.ts',
                  function: 'handleRequest',
                  vars: {
                    password: 'raw_secret_value',
                    clientEmail: 'client.applicant@example.com',
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const sanitized = beforeSend(rawEvent);

    // Message scrubbed
    expect(sanitized.message).not.toContain('A01234567');
    expect(sanitized.message).not.toContain('Rahim Uddin');

    // Exception value scrubbed of password and NID
    const exc = sanitized.exception?.values?.[0];
    expect(exc).toBeDefined();
    expect(exc?.value).not.toContain('mypassword');
    expect(exc?.value).not.toContain('19871234567890123');
    expect(exc?.value).toContain(REDACTED_MASK.PASSWORD);
    expect(exc?.value).toContain(REDACTED_MASK.NID);

    // Stack frame filename scrubbed of username directory
    const frame = exc?.stacktrace?.frames?.[0];
    expect(frame).toBeDefined();
    expect(frame?.filename).not.toContain('alice_developer');
    expect(frame?.filename).toContain('C:\\Users\\[REDACTED_USER]\\');

    // Local variables in stack frame scrubbed
    expect(frame?.vars?.password).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    expect(frame?.vars?.clientEmail).toBe(REDACTED_MASK.EMAIL);
  });

  it('should scrub breadcrumbs containing sensitive client identifiers', () => {
    const rawEvent: SentryEvent = {
      event_id: 'evt-67890',
      breadcrumbs: [
        {
          category: 'auth',
          message: 'User authenticated with phone +8801712345678',
          data: {
            authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.sig',
          },
        },
      ],
    };

    const sanitized = beforeSend(rawEvent);
    const crumb = sanitized.breadcrumbs?.[0];
    expect(crumb).toBeDefined();

    expect(crumb?.message).not.toContain('+8801712345678');
    expect(crumb?.message).toContain(REDACTED_MASK.PHONE);
    expect(crumb?.data?.authHeader).toBe(REDACTED_MASK.BEARER_TOKEN);
  });

  it('should scrub request headers, cookies, and user emails', () => {
    const rawEvent: SentryEvent = {
      event_id: 'evt-99999',
      request: {
        url: 'https://api.visahobe.com/v1/cases?token=secret_query_param',
        headers: {
          authorization: 'Bearer secret_bearer_token',
          cookie: 'session_id=secret_session_cookie',
          'x-client-version': '1.0.0',
        },
        cookies: {
          token: 'jwt_value_123',
        },
      },
      user: {
        id: 'user-789',
        email: 'victim@example.com',
      },
    };

    const sanitized = beforeSend(rawEvent);

    expect(sanitized.request?.url).not.toContain('secret_query_param');
    expect(sanitized.request?.url).toContain(REDACTED_MASK.TOKEN);

    expect(sanitized.request?.headers?.authorization).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    expect(sanitized.request?.headers?.cookie).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    expect(sanitized.request?.headers?.['x-client-version']).toBe('1.0.0');

    expect(sanitized.request?.cookies?.token).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    expect(sanitized.user?.email).toBe(REDACTED_MASK.EMAIL);
  });
});
