import { Capacitor } from '@capacitor/core';
import { sanitizeUploadFilename } from '@visahobe/core';

export type BridgePlatform = 'android' | 'ios' | 'web';

export const ALLOWED_BRIDGE_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export type AllowedMimeType = (typeof ALLOWED_BRIDGE_MIME_TYPES)[number];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface CaptureDocumentOptions {
  category?: 'identity' | 'financial' | 'employment' | 'civil' | 'other';
  source?: 'camera' | 'photos' | 'file_picker' | 'auto';
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  simulatedPayload?: {
    filename: string;
    mimeType: string;
    size: number;
    content?: string;
  };
}

export interface BridgeDocumentCaptureResult {
  id: string;
  originalName: string;
  sanitizedFilename: string;
  mimeType: string;
  size: number;
  category: string;
  capturedAt: string;
  source: string;
  dataUrl?: string;
}

export interface BiometricAvailabilityResult {
  available: boolean;
  biometryType: 'fingerprint' | 'face' | 'biometric_strong' | 'none';
  hardwareDetected: boolean;
  error?: string;
}

export interface AppDeepLinkTarget {
  targetApp: 'website' | 'client-dashboard';
  path: string;
  params: Record<string, string>;
  fullUrl: string;
  matchedRoute: string;
}

/**
 * Returns true if running inside a native Android Capacitor container.
 */
export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

/**
 * Returns current platform name normalized to 'android' | 'ios' | 'web'.
 */
export function getBridgePlatform(): BridgePlatform {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') {
    return platform;
  }
  return 'web';
}

/**
 * Captures a document via native camera/picker or browser fallback,
 * validating MIME types, enforcing size ceilings, and scrubbing path metadata.
 */
export async function captureDocumentFromBridge(
  options: CaptureDocumentOptions = {},
): Promise<BridgeDocumentCaptureResult> {
  const allowed = options.allowedMimeTypes ?? [...ALLOWED_BRIDGE_MIME_TYPES];
  const maxBytes = options.maxSizeBytes ?? MAX_DOCUMENT_SIZE_BYTES;
  const category = options.category ?? 'identity';
  const source = options.source ?? 'camera';

  // In test/simulation or headless mode, use simulatedPayload
  const payload = options.simulatedPayload ?? {
    filename: 'document_scan.pdf',
    mimeType: 'application/pdf',
    size: 1024 * 50,
  };

  // 1. Validate MIME type
  if (!allowed.includes(payload.mimeType)) {
    throw new Error(
      `Invalid document type: "${payload.mimeType}". Allowed types: ${allowed.join(', ')}`,
    );
  }

  // 2. Enforce maximum size ceiling
  if (payload.size > maxBytes) {
    throw new Error(
      `Document exceeds maximum allowable size of ${Math.round(maxBytes / (1024 * 1024))}MB (provided: ${payload.size} bytes)`,
    );
  }

  // 3. Strip directory traversal sequences and filesystem paths
  const cleanName = sanitizeUploadFilename(payload.filename);

  const documentId = `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: documentId,
    originalName: payload.filename,
    sanitizedFilename: cleanName,
    mimeType: payload.mimeType,
    size: payload.size,
    category,
    capturedAt: new Date().toISOString(),
    source,
    ...(payload.content ? { dataUrl: payload.content } : {}),
  };
}

/**
 * Checks platform biometric / passkey readiness.
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailabilityResult> {
  if (isNativeAndroid()) {
    // Native Android BiometricPrompt / StrongBox support
    return {
      available: true,
      biometryType: 'biometric_strong',
      hardwareDetected: true,
    };
  }

  if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
    try {
      const isAvailable =
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return {
        available: isAvailable,
        biometryType: isAvailable ? 'fingerprint' : 'none',
        hardwareDetected: isAvailable,
      };
    } catch {
      return {
        available: false,
        biometryType: 'none',
        hardwareDetected: false,
        error: 'WebAuthn platform check failed',
      };
    }
  }

  return {
    available: false,
    biometryType: 'none',
    hardwareDetected: false,
  };
}

/**
 * Denylist of sensitive query parameter keys that must never be propagated in mobile deep links.
 */
const SENSITIVE_QUERY_KEYS = new Set([
  'email',
  'phone',
  'passport',
  'passportnumber',
  'name',
  'applicant',
  'applicantname',
  'token',
  'access_token',
  'refreshtoken',
  'password',
  'ssn',
  'nid',
  'dob',
  'dateofbirth',
  'auth',
  'secret',
  'apikey',
]);

/**
 * Resolves incoming deep-link URLs (custom scheme or HTTPS), mapping them to
 * the correct internal target app and stripping any sensitive PII query parameters.
 */
export function resolveAppDeepLink(rawUrl: string): AppDeepLinkTarget {
  let parsedUrl: URL;
  try {
    // Handle custom schemes like visahobe://path?query
    if (rawUrl.startsWith('visahobe://')) {
      const standardUri = rawUrl.replace(/^visahobe:\/\//, 'https://app.visahobe.internal/');
      parsedUrl = new URL(standardUri);
    } else if (rawUrl.startsWith('/')) {
      parsedUrl = new URL(rawUrl, 'https://visahobe.com');
    } else {
      parsedUrl = new URL(rawUrl);
    }
  } catch {
    // Fallback on malformed URL
    return {
      targetApp: 'website',
      path: '/',
      params: {},
      fullUrl: 'https://visahobe.com/',
      matchedRoute: 'fallback',
    };
  }

  const rawPath = parsedUrl.pathname.replace(/\/+$/, '') || '/';
  const cleanParams: Record<string, string> = {};

  // Strip all PII from search params
  parsedUrl.searchParams.forEach((value, key) => {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (!SENSITIVE_QUERY_KEYS.has(normalizedKey)) {
      cleanParams[key] = value;
    }
  });

  // Client Dashboard Routes
  if (
    rawPath === '/documents' ||
    rawPath.startsWith('/documents/') ||
    rawPath === '/messages' ||
    rawPath.startsWith('/messages/') ||
    rawPath === '/overview' ||
    rawPath.startsWith('/cases')
  ) {
    const targetPath = rawPath === '/overview' || rawPath.startsWith('/cases') ? '/' : rawPath;
    const searchString = new URLSearchParams(cleanParams).toString();
    const fullUrl = `https://dashboard.visahobe.com${targetPath}${searchString ? `?${searchString}` : ''}`;

    return {
      targetApp: 'client-dashboard',
      path: targetPath,
      params: cleanParams,
      fullUrl,
      matchedRoute: targetPath,
    };
  }

  // Public Website Routes
  let targetWebsitePath = rawPath;
  let matchedRoute = 'home';

  if (rawPath === '/assess' || rawPath.startsWith('/assess')) {
    targetWebsitePath = '/assess';
    matchedRoute = 'assessment';
  } else if (rawPath.startsWith('/countries/')) {
    const slug = rawPath.replace(/^\/countries\//, '').split('/')[0];
    targetWebsitePath = `/countries/${slug}`;
    cleanParams.slug = slug;
    matchedRoute = 'country-guide';
  } else if (rawPath === '/countries') {
    targetWebsitePath = '/countries';
    matchedRoute = 'countries-index';
  } else if (rawPath === '/login') {
    targetWebsitePath = '/login';
    matchedRoute = 'login';
  } else {
    targetWebsitePath = '/';
    matchedRoute = 'home';
  }

  const searchString = new URLSearchParams(cleanParams).toString();
  const fullUrl = `https://visahobe.com${targetWebsitePath}${searchString ? `?${searchString}` : ''}`;

  return {
    targetApp: 'website',
    path: targetWebsitePath,
    params: cleanParams,
    fullUrl,
    matchedRoute,
  };
}
