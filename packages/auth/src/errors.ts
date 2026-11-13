export class AuthError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 401, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message = 'Invalid or tampered authentication token') {
    super(message, 401, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message = 'Authentication token has expired') {
    super(message, 401, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class MissingTenantClaimError extends AuthError {
  constructor(message = 'Authentication token is missing mandatory tenant_id claim') {
    super(message, 401, 'MISSING_TENANT_CLAIM');
    this.name = 'MissingTenantClaimError';
  }
}

export class InvalidIssuerError extends AuthError {
  constructor(message = 'Token issuer does not match configured authentication authority') {
    super(message, 401, 'INVALID_ISSUER');
    this.name = 'InvalidIssuerError';
  }
}

export class InvalidAudienceError extends AuthError {
  constructor(message = 'Token audience does not match application audience') {
    super(message, 401, 'INVALID_AUDIENCE');
    this.name = 'InvalidAudienceError';
  }
}

export class MfaRequiredError extends AuthError {
  constructor(message = 'Staff and privileged roles require Multi-Factor Authentication (AAL2)') {
    super(message, 403, 'MFA_CHALLENGE_REQUIRED');
    this.name = 'MfaRequiredError';
  }
}

export class CsrfValidationError extends AuthError {
  constructor(message = 'CSRF token validation failed on state-changing request') {
    super(message, 403, 'CSRF_VALIDATION_FAILED');
    this.name = 'CsrfValidationError';
  }
}

export class PermissionDeniedError extends AuthError {
  readonly requiredPermission: string;

  constructor(permission: string, message = `Permission denied: required '${permission}'`) {
    super(message, 403, 'PERMISSION_DENIED');
    this.name = 'PermissionDeniedError';
    this.requiredPermission = permission;
  }
}
