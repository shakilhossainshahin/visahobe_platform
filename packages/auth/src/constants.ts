import type { AuthConfig } from './types.js';

export const PRIVILEGED_STAFF_ROLES = [
  'owner',
  'admin',
  'case_manager',
  'verifier',
  'finance',
  'browser_operator',
  'developer_reviewer',
] as const;

export type PrivilegedStaffRole = (typeof PRIVILEGED_STAFF_ROLES)[number];

export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  jwtSecret:
    process.env.JWT_SECRET || 'dev_jwt_secret_key_minimum_32_chars_for_local_development_only',
  issuer:
    process.env.JWT_ISSUER || process.env.SUPABASE_URL
      ? `${process.env.SUPABASE_URL || 'http://localhost:54321'}/auth/v1`
      : 'http://localhost:54321/auth/v1',
  audience: process.env.JWT_AUDIENCE || 'authenticated',
  clockToleranceSeconds: 5,
  sessionCookieName: 'visahobe_session',
  csrfCookieName: 'visahobe_csrf',
  isProduction: process.env.NODE_ENV === 'production',
};
