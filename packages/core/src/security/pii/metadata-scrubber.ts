import path from 'node:path';

export interface FileMetadataInput {
  fileName?: string | undefined;
  originalName?: string | undefined;
  filePath?: string | undefined;
  mimeType?: string | undefined;
  fileSize?: number | undefined;
  exif?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

export interface FileMetadataOutput {
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize?: number | undefined;
  sanitizedMetadata: Record<string, unknown>;
}

/**
 * EXIF and metadata keys containing client identity or device/location information.
 */
const SENSITIVE_METADATA_KEYS = new Set([
  'gps',
  'gpslatitude',
  'gpslongitude',
  'gpsaltitude',
  'make',
  'model',
  'serialnumber',
  'deviceserialnumber',
  'artist',
  'ownername',
  'cameraownername',
  'software',
  'datetimeoriginal',
  'createdate',
  'profilecopyright',
  'hostcomputer',
]);

/**
 * Scrubs file uploads and screenshot metadata before storage:
 * - Strips full client local filesystem paths (e.g. C:\Users\alice\passport.jpg) to safe relative basenames.
 * - Strips sensitive device, location, and camera EXIF metadata.
 */
export function scrubFileMetadata(file: FileMetadataInput): FileMetadataOutput {
  const rawName = file.originalName ?? file.fileName ?? 'upload.bin';
  // Normalize both Windows (\) and POSIX (/) path separators to / and strip drive letters
  // so basename extraction works uniformly across all client and server operating systems.
  const normalized = rawName.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
  // Extract strictly the safe basename, stripping any directory path or traversal segments
  let baseName = path.posix.basename(normalized).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (baseName === '.' || baseName === '..' || !baseName) {
    baseName = 'upload.bin';
  }

  const sanitizedMetadata: Record<string, unknown> = {};

  if (file.exif && typeof file.exif === 'object') {
    for (const [key, value] of Object.entries(file.exif)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!SENSITIVE_METADATA_KEYS.has(normalizedKey)) {
        sanitizedMetadata[key] = value;
      }
    }
  }

  // Carry over non-sensitive custom fields
  for (const [key, value] of Object.entries(file)) {
    if (['fileName', 'originalName', 'filePath', 'exif'].includes(key)) {
      continue;
    }
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!SENSITIVE_METADATA_KEYS.has(normalizedKey)) {
      sanitizedMetadata[key] = value;
    }
  }

  return {
    fileName: baseName,
    filePath: `documents/${baseName}`,
    mimeType: file.mimeType ?? 'application/octet-stream',
    fileSize: file.fileSize,
    sanitizedMetadata,
  };
}
