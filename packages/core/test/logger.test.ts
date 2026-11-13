import { describe, expect, it } from 'vitest';
import {
  createLogger,
  generateCorrelationId,
  LogEntry,
  REDACTED_MASK,
  runWithCorrelationContext,
} from '../src/index.js';

describe('Structured JSON Logger & Correlation Context Suite (TICKET-P0-007)', () => {
  it('should emit standardized JSON log entries with timestamp and level', () => {
    const logs: LogEntry[] = [];
    const logger = createLogger({
      service: 'test-service',
      destination: (line) => logs.push(JSON.parse(line)),
    });

    logger.info('Application service initialized', { port: 8080 });

    expect(logs).toHaveLength(1);
    const entry = logs[0]!;
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('Application service initialized');
    expect(entry.service).toBe('test-service');
    expect(entry.timestamp).toBeDefined();
    expect(entry.metadata?.port).toBe(8080);
  });

  it('should filter log entries below the configured minLevel', () => {
    const logs: LogEntry[] = [];
    const logger = createLogger({
      minLevel: 'warn',
      destination: (line) => logs.push(JSON.parse(line)),
    });

    logger.debug('Debug message - should be filtered');
    logger.info('Info message - should be filtered');
    logger.warn('Warning message - should be logged');
    logger.error('Error message - should be logged');

    expect(logs).toHaveLength(2);
    expect(logs[0]?.level).toBe('warn');
    expect(logs[1]?.level).toBe('error');
  });

  it('should automatically propagate correlation context via AsyncLocalStorage', async () => {
    const logs: LogEntry[] = [];
    const logger = createLogger({
      destination: (line) => logs.push(JSON.parse(line)),
    });

    const tenantId = '11111111-1111-1111-1111-111111111111';
    const userId = 'user-test-456';
    const correlationId = generateCorrelationId();
    const caseId = 'case-bd-2026-001';

    await runWithCorrelationContext(
      {
        correlationId,
        tenantId,
        userId,
        caseId,
      },
      async () => {
        logger.info('Starting case document review');
        await new Promise((resolve) => setTimeout(resolve, 5));
        logger.info('Completed case document review');
      },
    );

    expect(logs).toHaveLength(2);
    for (const entry of logs) {
      expect(entry.correlationId).toBe(correlationId);
      expect(entry.tenantId).toBe(tenantId);
      expect(entry.userId).toBe(userId);
      expect(entry.caseId).toBe(caseId);
    }
  });

  it('should automatically redact sensitive fields and PII in logged messages and metadata', () => {
    const logs: LogEntry[] = [];
    const logger = createLogger({
      destination: (line) => logs.push(JSON.parse(line)),
    });

    logger.info('Processing payment for client.applicant@example.com with passport A01234567', {
      password: 'PlaintextPassword#1',
      token: 'jwt.super.secret',
      card_number: '4111222233334444',
      phone: '+8801712345678',
    });

    expect(logs).toHaveLength(1);
    const entry = logs[0]!;

    // Message string regex fallback scrubbing
    expect(entry.message).not.toContain('client.applicant@example.com');
    expect(entry.message).toContain(REDACTED_MASK.EMAIL);
    expect(entry.message).not.toContain('A01234567');
    expect(entry.message).toContain(REDACTED_MASK.PASSPORT);

    // Metadata field denylist scrubbing
    expect(entry.metadata?.password).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    expect(entry.metadata?.token).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    expect(entry.metadata?.card_number).toBe(REDACTED_MASK.SENSITIVE_FIELD);
  });

  it('should support child loggers with merged bindings', () => {
    const logs: LogEntry[] = [];
    const rootLogger = createLogger({
      service: 'root-service',
      destination: (line) => logs.push(JSON.parse(line)),
    });

    const childLogger = rootLogger.child({
      module: 'ocr-engine',
      workerId: 'worker-1',
    });

    childLogger.info('Worker started processing OCR batch');

    expect(logs).toHaveLength(1);
    const entry = logs[0]!;
    expect(entry.module).toBe('ocr-engine');
    expect(entry.workerId).toBe('worker-1');
  });

  it('should log structured Error objects with sanitized stack traces', () => {
    const logs: LogEntry[] = [];
    const logger = createLogger({
      destination: (line) => logs.push(JSON.parse(line)),
    });

    const error = new Error(
      'Database connection failed to postgresql://admin:secret123@db:5432/main',
    );
    logger.error('Database query error', error);

    expect(logs).toHaveLength(1);
    const entry = logs[0]!;
    expect(entry.level).toBe('error');
    expect(entry.error).toBeDefined();
    expect(entry.error?.name).toBe('Error');
    expect(entry.error?.message).toContain(REDACTED_MASK.PASSWORD);
    expect(entry.error?.message).not.toContain('secret123');
  });
});
