/**
 * Secret Vault Interfaces and Types (TICKET-P0-007)
 */

export const REDACTED_SECRET_MASK = '[REDACTED_SECRET]';

export interface EncryptedCredential {
  refId: string;
  encryptedData: string;
  iv: string;
  authTag: string;
  algorithm: 'aes-256-gcm';
  createdAt: string;
}

export interface SecretVault {
  getSecret(key: string): Promise<string>;
  getVaultReference(refId: string): Promise<EncryptedCredential>;
  createVaultReference(refId: string, plaintext: string): Promise<EncryptedCredential>;
  resolveVaultReference(credential: EncryptedCredential): Promise<string>;
  maskSecret(value: string): string;
}

/**
 * Secret wrapper that prevents accidental exposure in logs, JSON serialization,
 * or node inspect utilities.
 */
export class MaskedSecret {
  readonly #secret: string;

  constructor(secret: string) {
    if (typeof secret !== 'string') {
      throw new TypeError('Secret value must be a string');
    }
    this.#secret = secret;
  }

  /**
   * Explicitly reveals the raw secret value.
   */
  reveal(): string {
    return this.#secret;
  }

  toString(): string {
    return REDACTED_SECRET_MASK;
  }

  toJSON(): string {
    return REDACTED_SECRET_MASK;
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return REDACTED_SECRET_MASK;
  }
}

export class SecretNotFoundError extends Error {
  readonly key: string;

  constructor(key: string) {
    super(`Secret '${key}' was not found in the configured vault.`);
    this.name = 'SecretNotFoundError';
    this.key = key;
  }
}

export class SecretValidationError extends Error {
  readonly missingOrInvalidKeys: string[];

  constructor(keys: string[], message?: string | undefined) {
    super(
      message ??
        `Secret validation failed. Missing or invalid required environment secrets: [${keys.join(', ')}]`,
    );
    this.name = 'SecretValidationError';
    this.missingOrInvalidKeys = keys;
  }
}
