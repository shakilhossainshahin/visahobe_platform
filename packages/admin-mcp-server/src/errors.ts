export class AdminMcpAuthError extends Error {
  readonly code = 'ADMIN_MCP_AUTH_ERROR';
  readonly statusCode = 401;

  constructor(
    message = 'Authentication required. Staff credentials with AAL2 MFA must be supplied.',
  ) {
    super(message);
    this.name = 'AdminMcpAuthError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AdminMcpMfaRequiredError extends Error {
  readonly code = 'ADMIN_MCP_MFA_REQUIRED';
  readonly statusCode = 403;

  constructor(
    message = 'Admin MCP server strictly requires Authenticator Assurance Level 2 (AAL2 MFA). Single-factor sessions (AAL1) are forbidden (ADR-012).',
  ) {
    super(message);
    this.name = 'AdminMcpMfaRequiredError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AdminMcpPermissionError extends Error {
  readonly code = 'ADMIN_MCP_PERMISSION_DENIED';
  readonly statusCode = 403;

  constructor(toolName: string, role: string) {
    super(`Role '${role}' is not authorized to invoke tool '${toolName}'.`);
    this.name = 'AdminMcpPermissionError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AdminMcpToolNotFoundError extends Error {
  readonly code = 'ADMIN_MCP_TOOL_NOT_FOUND';
  readonly statusCode = 404;

  constructor(toolName: string) {
    super(`Tool '${toolName}' is not registered in the Admin MCP Server.`);
    this.name = 'AdminMcpToolNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
