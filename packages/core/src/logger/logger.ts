import { redactPii } from '../security/pii/redactor.js';
import { getCorrelationContext } from './context.js';
import { LogEntry, Logger, LoggerOptions, LogLevel } from './types.js';

const LOG_LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

export class StructuredLogger implements Logger {
  readonly #service: string;
  readonly #minLevel: LogLevel;
  readonly #destination: (jsonLine: string) => void;
  readonly #bindings: Record<string, unknown>;

  constructor(options: LoggerOptions = {}) {
    this.#service = options.service ?? 'visahobe-service';
    this.#minLevel = options.minLevel ?? 'info';
    this.#bindings = options.bindings ?? {};
    this.#destination =
      options.destination ??
      ((line: string) => {
        process.stdout.write(`${line}\n`);
      });
  }

  #shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHTS[level] >= LOG_LEVEL_WEIGHTS[this.#minLevel];
  }

  #emit(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    errorObj?: Record<string, unknown>,
  ): void {
    if (!this.#shouldLog(level)) {
      return;
    }

    const context = getCorrelationContext();

    const rawEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.#service,
      correlationId: context?.correlationId,
      tenantId: context?.tenantId,
      userId: context?.userId,
      caseId: context?.caseId,
      agentRunId: context?.agentRunId,
      ...this.#bindings,
      ...(metadata ? { metadata } : {}),
      ...(errorObj ? { error: errorObj } : {}),
    };

    // Defense-in-depth: Pass complete entry through PII redaction pipeline
    const sanitizedEntry = redactPii(rawEntry);
    const jsonLine = JSON.stringify(sanitizedEntry);
    this.#destination(jsonLine);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.#emit('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.#emit('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.#emit('warn', message, metadata);
  }

  error(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): void {
    let errorObj: Record<string, unknown> | undefined;
    let meta = metadata;

    if (errorOrMeta instanceof Error) {
      errorObj = {
        name: errorOrMeta.name,
        message: errorOrMeta.message,
        stack: errorOrMeta.stack,
      };
    } else if (errorOrMeta && typeof errorOrMeta === 'object') {
      meta = { ...errorOrMeta, ...metadata };
    }

    this.#emit('error', message, meta, errorObj);
  }

  fatal(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): void {
    let errorObj: Record<string, unknown> | undefined;
    let meta = metadata;

    if (errorOrMeta instanceof Error) {
      errorObj = {
        name: errorOrMeta.name,
        message: errorOrMeta.message,
        stack: errorOrMeta.stack,
      };
    } else if (errorOrMeta && typeof errorOrMeta === 'object') {
      meta = { ...errorOrMeta, ...metadata };
    }

    this.#emit('fatal', message, meta, errorObj);
  }

  child(bindings: Record<string, unknown>): Logger {
    return new StructuredLogger({
      service: (bindings.service as string) ?? this.#service,
      minLevel: this.#minLevel,
      destination: this.#destination,
      bindings: { ...this.#bindings, ...bindings },
    });
  }
}

/**
 * Creates a configured StructuredLogger instance.
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new StructuredLogger(options);
}
