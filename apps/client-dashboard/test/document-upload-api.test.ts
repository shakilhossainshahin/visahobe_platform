import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/documents/upload/route.js';

describe('Document Safe Upload API (/api/documents/upload)', () => {
  it('returns 400 Bad Request when no file is attached in form-data', async () => {
    const formData = new FormData();
    formData.append('category', 'identity');

    const req = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('No valid file');
  });

  it('returns 400 Bad Request when file has unsupported MIME type (e.g. .exe)', async () => {
    const fakeExe = new File(['binary content'], 'payload.exe', {
      type: 'application/x-msdownload',
    });

    const formData = new FormData();
    formData.append('file', fakeExe);
    formData.append('category', 'identity');

    const req = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Unsupported file type');
  });

  it('returns 413 Payload Too Large when file exceeds 10MB limit', async () => {
    // 11MB file buffer
    const largeBuffer = new Uint8Array(11 * 1024 * 1024);
    const oversizedFile = new File([largeBuffer], 'giant_document.pdf', {
      type: 'application/pdf',
    });

    const formData = new FormData();
    formData.append('file', oversizedFile);
    formData.append('category', 'financial');

    const req = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('exceeds 10MB maximum limit');
  });

  it('sanitizes POSIX path traversal attempts into safe relative basenames', async () => {
    const file = new File(['valid content'], '../../../../etc/shadow.pdf', {
      type: 'application/pdf',
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'identity');

    const req = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.document.sanitizedFilename).toBe('shadow.pdf');
    expect(json.document.sanitizedFilename).not.toContain('..');
    expect(json.document.sanitizedFilename).not.toContain('/');
  });

  it('sanitizes Windows directory traversal paths into safe relative basenames', async () => {
    const file = new File(
      ['valid content'],
      'C:\\Users\\Administrator\\Confidential\\passport.pdf',
      {
        type: 'application/pdf',
      },
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'identity');

    const req = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.document.sanitizedFilename).toBe('passport.pdf');
    expect(json.document.sanitizedFilename).not.toContain('C:');
    expect(json.document.sanitizedFilename).not.toContain('\\');
  });

  it('processes valid PDF document upload and returns structured metadata with zero PII leak', async () => {
    const file = new File(['%PDF-1.4 official statement content'], 'october_bank_statement.pdf', {
      type: 'application/pdf',
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'financial');

    const req = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.document.documentId).toMatch(/^doc-[a-f0-9]{16}$/);
    expect(json.document.sanitizedFilename).toBe('october_bank_statement.pdf');
    expect(json.document.category).toBe('financial');
    expect(json.document.verificationStatus).toBe('pending_review');
    expect(json.document.mimeType).toBe('application/pdf');
    expect(json.document.uploadedAt).toBeTruthy();

    // Verify no raw PII in document payload
    expect(JSON.stringify(json)).not.toContain('password');
    expect(JSON.stringify(json)).not.toContain('creditCard');
  });
});
