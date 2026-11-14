import { describe, expect, it } from 'vitest';
import {
  ALLOWED_BRIDGE_MIME_TYPES,
  captureDocumentFromBridge,
  checkBiometricAvailability,
  getBridgePlatform,
  isNativeAndroid,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../src/bridge/native-bridge.js';

describe('Unified Native Bridge SDK (TICKET-P1-005)', () => {
  describe('Platform Detection', () => {
    it('detects runtime environment safely in standard node/browser test runner', () => {
      // In default headless test environment, should report web and not native Android
      expect(typeof isNativeAndroid()).toBe('boolean');
      expect(isNativeAndroid()).toBe(false);

      const platform = getBridgePlatform();
      expect(['web', 'android', 'ios']).toContain(platform);
      expect(platform).toBe('web');
    });
  });

  describe('Document Camera & File Picker Bridge', () => {
    it('successfully processes valid PDF documents with sanitized metadata', async () => {
      const result = await captureDocumentFromBridge({
        category: 'financial',
        source: 'file_picker',
        simulatedPayload: {
          filename: 'October_Bank_Statement.pdf',
          mimeType: 'application/pdf',
          size: 1024 * 300,
        },
      });

      expect(result.id).toMatch(/^doc-/);
      expect(result.sanitizedFilename).toBe('October_Bank_Statement.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.category).toBe('financial');
      expect(result.source).toBe('file_picker');
      expect(result.capturedAt).toBeDefined();
    });

    it('successfully processes image attachments (JPEG & PNG)', async () => {
      const jpegResult = await captureDocumentFromBridge({
        category: 'identity',
        simulatedPayload: {
          filename: 'passport_scan.jpg',
          mimeType: 'image/jpeg',
          size: 1024 * 500,
        },
      });
      expect(jpegResult.mimeType).toBe('image/jpeg');
      expect(jpegResult.sanitizedFilename).toBe('passport_scan.jpg');

      const pngResult = await captureDocumentFromBridge({
        category: 'civil',
        simulatedPayload: {
          filename: 'marriage_cert.png',
          mimeType: 'image/png',
          size: 1024 * 700,
        },
      });
      expect(pngResult.mimeType).toBe('image/png');
      expect(pngResult.sanitizedFilename).toBe('marriage_cert.png');
    });

    it('strips Windows and POSIX path traversal sequences and client paths', async () => {
      const windowsResult = await captureDocumentFromBridge({
        simulatedPayload: {
          filename: 'C:\\Users\\Alice\\Documents\\Confidential\\passport.pdf',
          mimeType: 'application/pdf',
          size: 1024 * 100,
        },
      });
      expect(windowsResult.sanitizedFilename).toBe('passport.pdf');
      expect(windowsResult.sanitizedFilename).not.toContain('C:');
      expect(windowsResult.sanitizedFilename).not.toContain('\\');

      const posixResult = await captureDocumentFromBridge({
        simulatedPayload: {
          filename: '../../../../etc/shadow.pdf',
          mimeType: 'application/pdf',
          size: 1024 * 100,
        },
      });
      expect(posixResult.sanitizedFilename).toBe('shadow.pdf');
      expect(posixResult.sanitizedFilename).not.toContain('..');
      expect(posixResult.sanitizedFilename).not.toContain('/');
    });

    it('rejects disallowed file MIME types', async () => {
      const dangerousMimes = [
        'application/x-sh',
        'application/x-msdownload',
        'text/html',
        'application/javascript',
        'application/zip',
      ];

      for (const mime of dangerousMimes) {
        await expect(
          captureDocumentFromBridge({
            simulatedPayload: {
              filename: 'payload.bin',
              mimeType: mime,
              size: 1024,
            },
          }),
        ).rejects.toThrow(/Invalid document type/);
      }
    });

    it('enforces 10MB document size limit ceiling', async () => {
      const oversizedBytes = MAX_DOCUMENT_SIZE_BYTES + 1; // 10MB + 1 byte

      await expect(
        captureDocumentFromBridge({
          simulatedPayload: {
            filename: 'giant_archive.pdf',
            mimeType: 'application/pdf',
            size: oversizedBytes,
          },
        }),
      ).rejects.toThrow(/Document exceeds maximum allowable size/);
    });

    it('exposes immutable ALLOWED_BRIDGE_MIME_TYPES list', () => {
      expect(ALLOWED_BRIDGE_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_BRIDGE_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_BRIDGE_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_BRIDGE_MIME_TYPES).toHaveLength(3);
    });
  });

  describe('Biometric / Passkey Readiness', () => {
    it('returns a strongly typed biometric readiness response', async () => {
      const readiness = await checkBiometricAvailability();

      expect(readiness).toBeDefined();
      expect(typeof readiness.available).toBe('boolean');
      expect(typeof readiness.hardwareDetected).toBe('boolean');
      expect(['fingerprint', 'face', 'biometric_strong', 'none']).toContain(readiness.biometryType);
    });
  });
});
