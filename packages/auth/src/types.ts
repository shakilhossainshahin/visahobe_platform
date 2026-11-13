export interface TokenClaims {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  sub?: string;
  tenant_id?: string;
  org_id?: string;
  email?: string;
  email_verified?: boolean;
  phone?: string;
  role?: string;
  roles?: string[];
  aal?: 'aal1' | 'aal2';
  amr?: Array<{ method: string; timestamp?: number } | string>;
  is_mfa_verified?: boolean;
  app_metadata?: {
    tenant_id?: string;
    org_id?: string;
    role?: string;
    roles?: string[];
    [key: string]: unknown;
  };
  user_metadata?: {
    full_name?: string;
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UserSession {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  isMfaVerified: boolean;
  aal: 'aal1' | 'aal2';
  claims: TokenClaims;
}

export interface AuthConfig {
  jwtSecret: string;
  issuer: string;
  audience: string;
  clockToleranceSeconds: number;
  sessionCookieName: string;
  csrfCookieName: string;
  isProduction: boolean;
}

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean | undefined;
  secure?: boolean | undefined;
  sameSite?: 'lax' | 'strict' | 'none' | undefined;
  path?: string | undefined;
  maxAge?: number | undefined;
  expires?: Date | undefined;
  domain?: string | undefined;
}

export interface AuthenticateRequestInput {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string> | undefined;
  method?: string | undefined;
}
