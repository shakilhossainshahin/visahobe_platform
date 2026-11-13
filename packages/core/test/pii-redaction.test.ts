import { describe, expect, it } from 'vitest';
import {
  redactAgentTrace,
  redactPii,
  REDACTED_MASK,
  sanitizeStackTrace,
  scrubFileMetadata,
} from '../src/index.js';

describe('Defense-in-Depth PII Redaction Pipeline Suite (TICKET-P0-007)', () => {
  describe('Layer 1: Field Denylist Redaction on Nested Objects', () => {
    it('should redact sensitive keys across nested objects and arrays', () => {
      const payload = {
        tenantId: '11111111-1111-1111-1111-111111111111',
        user: {
          id: 'user-123',
          password: 'PlaintextPassword123!',
          mfa_secret: 'JBSWY3DPEHPK3PXP',
          token: 'jwt.token.secret',
        },
        applicant: {
          passport_number: 'A01234567',
          nid_number: '19871234567890123',
          dob: '1990-05-15',
          bank_account: '102.101.98765',
        },
        payment: {
          credit_card: '4111222233334444',
          cvv: '123',
        },
        documents: [
          { name: 'resume.pdf', status: 'verified' },
          { name: 'passport_scan.pdf', passport_no: 'A09876543' },
        ],
      };

      const redacted = redactPii(payload);

      expect(redacted.tenantId).toBe('11111111-1111-1111-1111-111111111111');
      expect(redacted.user.id).toBe('user-123');
      expect(redacted.user.password).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.user.mfa_secret).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.user.token).toBe(REDACTED_MASK.SENSITIVE_FIELD);

      expect(redacted.applicant.passport_number).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.applicant.nid_number).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.applicant.dob).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.applicant.bank_account).toBe(REDACTED_MASK.SENSITIVE_FIELD);

      expect(redacted.payment.credit_card).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.payment.cvv).toBe(REDACTED_MASK.SENSITIVE_FIELD);
      expect(redacted.documents[1]?.passport_no).toBe(REDACTED_MASK.SENSITIVE_FIELD);
    });
  });

  describe('Layer 2: Operational Logging Allowlist Filtering', () => {
    it('should drop non-allowlisted keys when allowlistOnly is enabled', () => {
      const publicLog = {
        service: 'api-gateway',
        level: 'info',
        tenantId: 'tenant-123',
        userId: 'user-456',
        correlationId: 'corr-789',
        action: 'case.create',
        statusCode: 201,
        durationMs: 45,
        rawQueryPayload: { search: 'secret client data' },
        internalConfig: { debugMode: true },
      };

      const redacted = redactPii(publicLog, { allowlistOnly: true });

      expect(redacted.service).toBe('api-gateway');
      expect(redacted.level).toBe('info');
      expect(redacted.tenantId).toBe('tenant-123');
      expect(redacted.action).toBe('case.create');
      expect(redacted.statusCode).toBe(201);
      // Non-allowlisted fields dropped
      expect((redacted as Record<string, unknown>).rawQueryPayload).toBeUndefined();
      expect((redacted as Record<string, unknown>).internalConfig).toBeUndefined();
    });
  });

  describe('Layer 3: Regex Pattern Fallback Scrubbing on Unstructured Strings', () => {
    it('should redact Bangladeshi Passport numbers in free text', () => {
      const text = 'Applicant presented passport A01234567 during intake verification.';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('A01234567');
      expect(scrubbed).toContain(REDACTED_MASK.PASSPORT);
    });

    it('should redact Bangladeshi National ID (NID) numbers (17-digit and 13-digit)', () => {
      const text = 'Client NID is 19871234567890123 (legacy: 1234567890123).';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('19871234567890123');
      expect(scrubbed).not.toContain('1234567890123');
      expect(scrubbed).toContain(REDACTED_MASK.NID);
    });

    it('should redact Bangladesh and international phone numbers', () => {
      const text = 'Primary phone: +8801712345678, alternative: 01812345678.';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('+8801712345678');
      expect(scrubbed).not.toContain('01812345678');
      expect(scrubbed).toContain(REDACTED_MASK.PHONE);
    });

    it('should redact personal email addresses', () => {
      const text = 'Confirmation sent to client.applicant@example.com for case.';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('client.applicant@example.com');
      expect(scrubbed).toContain(REDACTED_MASK.EMAIL);
    });

    it('should redact credit card numbers matching Luhn algorithm', () => {
      // Valid Luhn test card number (Visa standard test card)
      const text = 'Transaction attempted with card 4111222233334444 on terminal.';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('4111222233334444');
      expect(scrubbed).toContain(REDACTED_MASK.CREDIT_CARD);
    });

    it('should redact bank account numbers in free text', () => {
      const text = 'Refund dispatched to bank account 102.101.98765 successfully.';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('102.101.98765');
      expect(scrubbed).toContain(REDACTED_MASK.BANK_ACCOUNT);
    });

    it('should redact Bearer tokens and JWTs in free text', () => {
      const text =
        'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.secret';
      const scrubbed = redactPii(text);
      expect(scrubbed).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(scrubbed).toContain(REDACTED_MASK.BEARER_TOKEN);
    });

    it('should redact Bangla and English full applicant names in unstructured logs', () => {
      const banglaText = 'আবেদনকারীর নাম মোহাম্মদ রহিম যাচাই করা হয়েছে।';
      const englishText = 'Applicant Rahim Uddin submitted the application.';

      expect(redactPii(banglaText)).not.toContain('মোহাম্মদ রহিম');
      expect(redactPii(banglaText)).toContain(REDACTED_MASK.NAME);

      expect(redactPii(englishText)).not.toContain('Rahim Uddin');
      expect(redactPii(englishText)).toContain(REDACTED_MASK.NAME);
    });
  });

  describe('Layer 4: Prompt and Agent Trace Sanitization', () => {
    it('should scrub full applicant credentials from agent prompt traces', () => {
      const trace = {
        agentId: 'case-intake-agent-01',
        step: 'document_ocr_parse',
        prompt:
          'Analyze document for Rahim Uddin, passport A01234567, email client.applicant@example.com',
        history: [
          { role: 'user', content: 'Here is NID 19871234567890123 and phone +8801712345678' },
        ],
      };

      const scrubbed = redactAgentTrace(trace);

      expect(scrubbed.prompt).not.toContain('Rahim Uddin');
      expect(scrubbed.prompt).not.toContain('A01234567');
      expect(scrubbed.prompt).not.toContain('client.applicant@example.com');
      expect(scrubbed.history[0]?.content).not.toContain('19871234567890123');
      expect(scrubbed.history[0]?.content).not.toContain('+8801712345678');
    });
  });

  describe('Layer 5: Screenshot & Document Metadata Scrubbing', () => {
    it('should strip original client filesystem paths and sensitive EXIF metadata', () => {
      const upload = {
        originalName: 'C:\\Users\\shakil_admin\\Desktop\\scans\\passport_front.pdf',
        fileSize: 1048576,
        mimeType: 'application/pdf',
        exif: {
          make: 'Apple',
          model: 'iPhone 15 Pro',
          gpsLatitude: 23.8103,
          gpsLongitude: 90.4125,
          colorSpace: 'sRGB',
        },
      };

      const result = scrubFileMetadata(upload);

      // Path stripped to safe basename
      expect(result.fileName).toBe('passport_front.pdf');
      expect(result.filePath).toBe('documents/passport_front.pdf');
      expect(result.filePath).not.toContain('shakil_admin');
      expect(result.filePath).not.toContain('Desktop');

      // EXIF metadata cleaned of GPS, device identifiers
      expect(result.sanitizedMetadata.gpsLatitude).toBeUndefined();
      expect(result.sanitizedMetadata.gpsLongitude).toBeUndefined();
      expect(result.sanitizedMetadata.make).toBeUndefined();
      expect(result.sanitizedMetadata.model).toBeUndefined();
      expect(result.sanitizedMetadata.colorSpace).toBe('sRGB');
    });

    it('should strip Unix/POSIX paths and prevent path traversal', () => {
      const posixUpload = {
        originalName: '/home/applicant/documents/nid_card.jpg',
        mimeType: 'image/jpeg',
      };
      const posixResult = scrubFileMetadata(posixUpload);
      expect(posixResult.fileName).toBe('nid_card.jpg');
      expect(posixResult.filePath).toBe('documents/nid_card.jpg');

      const traversalUpload = {
        originalName: '../../../../etc/passwd',
      };
      const traversalResult = scrubFileMetadata(traversalUpload);
      expect(traversalResult.fileName).toBe('passwd');
      expect(traversalResult.filePath).toBe('documents/passwd');
    });
  });

  describe('Layer 6: Error Stack Trace Sanitization', () => {
    it('should sanitize database credentials, tokens, and username directories in stack traces', () => {
      const rawStack = `Error: Connection terminated
    at Connection.parseE (C:\\Users\\john_doe\\AppData\\Local\\npm-cache\\pg\\lib\\connection.js:100:15)
    at postgresql://db_user:super_secret_db_pass@db.visahobe.internal:5432/visahobe_prod?token=secret_token_123&auth=bearer_abc
    at runQuery (/home/developer_bob/workspace/visahobe/services/api/src/db.ts:42:10)`;

      const sanitized = sanitizeStackTrace(rawStack);

      expect(sanitized).not.toContain('super_secret_db_pass');
      expect(sanitized).toContain(REDACTED_MASK.PASSWORD);

      expect(sanitized).not.toContain('john_doe');
      expect(sanitized).not.toContain('developer_bob');
      expect(sanitized).toContain('C:\\Users\\[REDACTED_USER]\\');
      expect(sanitized).toContain('/home/[REDACTED_USER]/');

      expect(sanitized).not.toContain('secret_token_123');
      expect(sanitized).not.toContain('bearer_abc');
      expect(sanitized).toContain(REDACTED_MASK.TOKEN);
    });
  });
});
