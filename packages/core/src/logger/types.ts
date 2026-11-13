export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string | undefined;
  correlationId?: string | undefined;
  tenantId?: string | undefined;
  userId?: string | undefined;
  caseId?: string | undefined;
  agentRunId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  error?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

export interface LoggerOptions {
  service?: string | undefined;
  minLevel?: LogLevel | undefined;
  destination?: ((jsonLine: string) => void) | undefined;
  bindings?: Record<string, unknown> | undefined;
}

export interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): void;
  fatal(
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): void;
  child(bindings: Record<string, unknown>): Logger;
}
