import { z } from 'zod';
import { SecretValidationError } from './types.js';

export const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required and must not be empty'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  STORAGE_SECRET: z.string().min(16, 'STORAGE_SECRET must be at least 16 characters for HMAC'),
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional().or(z.literal('')),
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type AppEnvConfig = z.infer<typeof environmentSchema>;

export interface ValidateEnvironmentOptions {
  abortOnError?: boolean | undefined;
}

/**
 * Validates mandatory environment secrets.
 * Throws a SecretValidationError if required secrets are missing or malformed.
 * If abortOnError is true, immediately terminates the Node process with code 1.
 */
export function validateEnvironment(
  rawEnv: Record<string, string | undefined> = process.env,
  options: ValidateEnvironmentOptions = {},
): AppEnvConfig {
  const result = environmentSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    const missingKeys = result.error.issues.map((e) => String(e.path[0]));

    if (options.abortOnError) {
      console.error(
        `[FATAL] Application startup aborted: Missing or invalid required secrets:\n${errorDetails.join('\n')}`,
      );
      process.exit(1);
    }

    throw new SecretValidationError(
      missingKeys,
      `Environment secret validation failed:\n${errorDetails.join('\n')}`,
    );
  }

  return result.data;
}
