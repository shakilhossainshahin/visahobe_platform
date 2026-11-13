import crypto from 'node:crypto';
import {
  EncryptedCredential,
  REDACTED_SECRET_MASK,
  SecretNotFoundError,
  SecretVault,
} from './types.js';

export interface EnvSecretProviderOptions {
  env?: Record<string, string | undefined> | undefined;
  encryptionMasterKey?: string | undefined;
}

/**
 * Environment-backed implementation of SecretVault with AES-256-GCM encrypted
 * tokenized credential references for partner/portal secrets.
 */
export class EnvSecretProvider implements SecretVault {
  readonly #env: Record<string, string | undefined>;
  readonly #derivedKey: Buffer;
  readonly #vaultStorage = new Map<string, EncryptedCredential>();

  constructor(options: EnvSecretProviderOptions = {}) {
    this.#env = options.env ?? process.env;
    const masterSecret =
      options.encryptionMasterKey ??
      this.#env.STORAGE_SECRET ??
      this.#env.JWT_SECRET ??
      'default_local_dev_master_secret_min_32_bytes!';

    // Derive deterministic 32-byte AES-256 key
    this.#derivedKey = crypto.createHash('sha256').update(masterSecret).digest();
  }

  async getSecret(key: string): Promise<string> {
    const val = this.#env[key];
    if (val === undefined || val === '') {
      throw new SecretNotFoundError(key);
    }
    return val;
  }

  async getVaultReference(refId: string): Promise<EncryptedCredential> {
    const credential = this.#vaultStorage.get(refId);
    if (!credential) {
      throw new SecretNotFoundError(`vault_ref:${refId}`);
    }
    return credential;
  }

  async createVaultReference(refId: string, plaintext: string): Promise<EncryptedCredential> {
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.#derivedKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const credential: EncryptedCredential = {
      refId,
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm',
      createdAt: new Date().toISOString(),
    };

    this.#vaultStorage.set(refId, credential);
    return credential;
  }

  async resolveVaultReference(credential: EncryptedCredential): Promise<string> {
    const iv = Buffer.from(credential.iv, 'hex');
    const authTag = Buffer.from(credential.authTag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.#derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(credential.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  maskSecret(_value: string): string {
    return REDACTED_SECRET_MASK;
  }
}
