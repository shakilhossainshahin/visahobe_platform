import util from 'node:util';
import { describe, expect, it } from 'vitest';
import {
  EnvSecretProvider,
  MaskedSecret,
  REDACTED_SECRET_MASK,
  SecretNotFoundError,
  SecretValidationError,
  validateEnvironment,
} from '../src/index.js';

describe('Secret Vault and Environment Configuration Suite (TICKET-P0-007)', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/visahobe_dev?schema=public',
    JWT_SECRET: 'super_secret_jwt_key_that_is_at_least_32_characters_long!',
    STORAGE_SECRET: 'super_secret_storage_key_16_chars!',
    NODE_ENV: 'test',
    PORT: '4000',
  };

  describe('Zod Environment Schema Validation', () => {
    it('should validate and parse valid environment variables', () => {
      const config = validateEnvironment(validEnv);
      expect(config.DATABASE_URL).toBe(validEnv.DATABASE_URL);
      expect(config.JWT_SECRET).toBe(validEnv.JWT_SECRET);
      expect(config.STORAGE_SECRET).toBe(validEnv.STORAGE_SECRET);
      expect(config.NODE_ENV).toBe('test');
      expect(config.PORT).toBe(4000);
    });

    it('should throw SecretValidationError when mandatory secrets are missing', () => {
      const invalidEnv = { ...validEnv, DATABASE_URL: '' };
      expect(() => validateEnvironment(invalidEnv)).toThrow(SecretValidationError);
    });

    it('should throw SecretValidationError when JWT_SECRET is shorter than 32 characters', () => {
      const invalidEnv = { ...validEnv, JWT_SECRET: 'short_key_under_32' };
      expect(() => validateEnvironment(invalidEnv)).toThrow(SecretValidationError);
      try {
        validateEnvironment(invalidEnv);
      } catch (err) {
        expect(err).toBeInstanceOf(SecretValidationError);
        expect((err as SecretValidationError).missingOrInvalidKeys).toContain('JWT_SECRET');
      }
    });

    it('should throw SecretValidationError when STORAGE_SECRET is shorter than 16 characters', () => {
      const invalidEnv = { ...validEnv, STORAGE_SECRET: 'too_short' };
      expect(() => validateEnvironment(invalidEnv)).toThrow(SecretValidationError);
    });
  });

  describe('MaskedSecret Safe Wrapper', () => {
    it('should reveal raw secret via reveal()', () => {
      const masked = new MaskedSecret('my_super_secret_token_123');
      expect(masked.reveal()).toBe('my_super_secret_token_123');
    });

    it('should return [REDACTED_SECRET] via toString()', () => {
      const masked = new MaskedSecret('my_super_secret_token_123');
      expect(masked.toString()).toBe(REDACTED_SECRET_MASK);
      expect(String(masked)).toBe(REDACTED_SECRET_MASK);
    });

    it('should return [REDACTED_SECRET] via toJSON()', () => {
      const masked = new MaskedSecret('my_super_secret_token_123');
      expect(JSON.stringify({ secret: masked })).toBe(
        JSON.stringify({ secret: REDACTED_SECRET_MASK }),
      );
    });

    it('should return [REDACTED_SECRET] via util.inspect()', () => {
      const masked = new MaskedSecret('my_super_secret_token_123');
      expect(util.inspect(masked)).toBe(REDACTED_SECRET_MASK);
    });
  });

  describe('EnvSecretProvider & Encrypted Credential Vault', () => {
    const provider = new EnvSecretProvider({
      env: validEnv,
      encryptionMasterKey: 'master_encryption_key_for_test_at_least_32_bytes!',
    });

    it('should retrieve existing environment secrets', async () => {
      const secret = await provider.getSecret('JWT_SECRET');
      expect(secret).toBe(validEnv.JWT_SECRET);
    });

    it('should throw SecretNotFoundError when key does not exist', async () => {
      await expect(provider.getSecret('NON_EXISTENT_KEY')).rejects.toThrow(SecretNotFoundError);
    });

    it('should encrypt portal credential to vault reference and resolve back', async () => {
      const rawPortalPassword = 'GovernmentPortalSecret#2026';
      const refId = 'vref_bd_portal_123';

      // 1. Create encrypted reference
      const credential = await provider.createVaultReference(refId, rawPortalPassword);
      expect(credential.refId).toBe(refId);
      expect(credential.algorithm).toBe('aes-256-gcm');
      expect(credential.encryptedData).not.toContain(rawPortalPassword);
      expect(credential.iv).toBeDefined();
      expect(credential.authTag).toBeDefined();

      // 2. Retrieve reference by ID
      const retrieved = await provider.getVaultReference(refId);
      expect(retrieved.encryptedData).toBe(credential.encryptedData);

      // 3. Resolve reference back to plaintext
      const decrypted = await provider.resolveVaultReference(credential);
      expect(decrypted).toBe(rawPortalPassword);
    });

    it('should mask arbitrary secret strings', () => {
      expect(provider.maskSecret('any_secret_value')).toBe(REDACTED_SECRET_MASK);
    });
  });
});
