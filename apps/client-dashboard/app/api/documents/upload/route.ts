import { NextResponse } from 'next/server.js';
import crypto from 'node:crypto';
import { sanitizeUploadFilename, createLogger } from '@visahobe/core';

export const dynamic = 'force-dynamic';

const logger = createLogger({ service: 'client-dashboard-upload' });

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const category = (formData.get('category') as string) || 'general';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid file was provided in the upload request',
        },
        { status: 400 },
      );
    }

    // 1. File Size Verification
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB maximum limit`,
        },
        { status: 413 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Uploaded file is empty (0 bytes)',
        },
        { status: 400 },
      );
    }

    // 2. MIME Type Verification
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${file.type}). Allowed formats: PDF, JPG, PNG`,
        },
        { status: 400 },
      );
    }

    // 3. Filename & Extension Sanitization
    const rawName = file.name;
    const sanitizedFilename = sanitizeUploadFilename(rawName);

    const extMatch = sanitizedFilename.match(/\.[a-zA-Z0-9]+$/);
    const extension = extMatch ? extMatch[0].toLowerCase() : '';

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Disallowed file extension. Allowed extensions: .pdf, .jpg, .jpeg, .png',
        },
        { status: 400 },
      );
    }

    const documentId = `doc-${crypto.randomBytes(8).toString('hex')}`;
    const uploadedAt = new Date().toISOString();

    // 4. Structured Defense-in-Depth PII Logging
    logger.info('Applicant document upload processed', {
      service: 'client-dashboard-upload',
      documentId,
      sanitizedFilename,
      category,
      size: file.size,
      mimeType: file.type,
      verificationStatus: 'pending_review',
    });

    return NextResponse.json(
      {
        success: true,
        document: {
          documentId,
          originalName: file.name,
          sanitizedFilename,
          category,
          size: file.size,
          mimeType: file.type,
          verificationStatus: 'pending_review',
          uploadedAt,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    logger.error('Error handling document upload', {
      service: 'client-dashboard-upload',
      error: errorMsg,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing document upload',
      },
      { status: 500 },
    );
  }
}
