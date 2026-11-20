export class PartnerMcpAuthError extends Error {
  readonly code = 'PARTNER_MCP_AUTH_ERROR';
  readonly statusCode = 401;

  constructor(
    message = 'Authentication required. Verified partner agency token must be provided.',
  ) {
    super(message);
    this.name = 'PartnerMcpAuthError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PartnerMcpBoundaryViolationError extends Error {
  readonly code = 'PARTNER_MCP_BOUNDARY_VIOLATION';
  readonly statusCode = 403;

  constructor(
    message = 'Cross-tenant access denied by PostgreSQL 16 Kernel RLS. Tools are scoped strictly to the calling partner agency (ADR-012).',
  ) {
    super(message);
    this.name = 'PartnerMcpBoundaryViolationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PartnerMcpForbiddenToolError extends Error {
  readonly code = 'PARTNER_MCP_FORBIDDEN_TOOL';
  readonly statusCode = 403;

  constructor(toolName: string) {
    super(
      `Access denied: Tool '${toolName}' is an internal platform administrative tool and is strictly forbidden on the Partner MCP Server (ADR-012 §3.2).`,
    );
    this.name = 'PartnerMcpForbiddenToolError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PartnerMcpToolNotFoundError extends Error {
  readonly code = 'PARTNER_MCP_TOOL_NOT_FOUND';
  readonly statusCode = 404;

  constructor(toolName: string) {
    super(`Tool '${toolName}' is not registered on the Partner MCP Server.`);
    this.name = 'PartnerMcpToolNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
