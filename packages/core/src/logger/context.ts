import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';

export interface CorrelationContext {
  correlationId: string;
  tenantId?: string | undefined;
  userId?: string | undefined;
  caseId?: string | undefined;
  agentRunId?: string | undefined;
  [key: string]: unknown;
}

const asyncLocalStorage = new AsyncLocalStorage<CorrelationContext>();

/**
 * Generates a standard UUID correlation ID.
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Returns the current active correlation context or undefined if outside a context scope.
 */
export function getCorrelationContext(): CorrelationContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Runs a function within an AsyncLocalStorage correlation context scope.
 */
export async function runWithCorrelationContext<T>(
  context: Partial<CorrelationContext>,
  fn: () => T | Promise<T>,
): Promise<T> {
  const fullContext: CorrelationContext = {
    correlationId: context.correlationId ?? generateCorrelationId(),
    tenantId: context.tenantId,
    userId: context.userId,
    caseId: context.caseId,
    agentRunId: context.agentRunId,
    ...context,
  };

  return asyncLocalStorage.run(fullContext, fn);
}
