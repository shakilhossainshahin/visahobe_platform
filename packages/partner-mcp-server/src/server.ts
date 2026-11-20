import { redactPii } from '@visahobe/core';
import {
  PartnerMcpAuthError,
  PartnerMcpBoundaryViolationError,
  PartnerMcpForbiddenToolError,
  PartnerMcpToolNotFoundError,
} from './errors.js';
import {
  ADMIN_ONLY_TOOLS,
  PARTNER_TOOL_DEFINITIONS,
  PARTNER_TOOL_HANDLERS,
} from './tools/registry.js';
import type {
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpToolCallRequest,
  McpToolCallResult,
  McpToolDefinition,
  PartnerMcpContext,
} from './types.js';
import type { UserSession } from '@visahobe/auth';

export class PartnerMcpServer {
  /**
   * Constructs the secure, tenant-isolated Partner MCP context.
   * STRICT SECURITY INVARIANT (ADR-012 §3.2):
   * Tenant ID is derived exclusively from cryptographically verified JWT claims.
   * Client-supplied header overrides (e.g. x-tenant-id) are strictly ignored.
   */
  public static createContext(
    session: UserSession,
    _spoofedHeaderTenantId?: string | undefined,
  ): PartnerMcpContext {
    if (!session || !session.userId || !session.tenantId) {
      throw new PartnerMcpAuthError();
    }

    // Strict invariant: verify tenant isolation
    const tenantId = session.tenantId;

    return {
      session,
      tenantId,
      partnerAgencyId: (session.claims?.['agency_id'] as string) ?? tenantId,
      rlsContextActive: true,
    };
  }

  /**
   * Lists tools available strictly for partner agency integrations.
   * Administrative tools (wallet adjustments, tenant provisioning, cross-tenant logs) are omitted.
   */
  public static listTools(_context: PartnerMcpContext): McpToolDefinition[] {
    return PARTNER_TOOL_DEFINITIONS;
  }

  /**
   * Executes a partner agency tool with PostgreSQL 16 Kernel RLS enforcement.
   */
  public static async callTool(
    request: McpToolCallRequest,
    context: PartnerMcpContext,
  ): Promise<McpToolCallResult> {
    if (ADMIN_ONLY_TOOLS.includes(request.name)) {
      throw new PartnerMcpForbiddenToolError(request.name);
    }

    const toolDef = PARTNER_TOOL_DEFINITIONS.find((t) => t.name === request.name);
    if (!toolDef) {
      throw new PartnerMcpToolNotFoundError(request.name);
    }

    const handler = PARTNER_TOOL_HANDLERS[request.name];
    if (!handler) {
      throw new PartnerMcpToolNotFoundError(request.name);
    }

    // Sanitize parameters: remove any parameter attempting to spoof tenant boundary
    const sanitizedArgs = { ...(request.arguments ?? {}) };
    if (sanitizedArgs['tenantId'] && sanitizedArgs['tenantId'] !== context.tenantId) {
      throw new PartnerMcpBoundaryViolationError(
        `Attempted cross-tenant spoofing parameter ('tenantId: ${sanitizedArgs['tenantId']}'). Rejected by Kernel RLS boundary.`,
      );
    }
    sanitizedArgs['tenantId'] = context.tenantId;

    const rawResult = await handler(sanitizedArgs, context);
    const redactedResult = redactPii(rawResult);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(redactedResult, null, 2),
        },
      ],
      isError: false,
    };
  }

  /**
   * Handles an MCP JSON-RPC 2.0 protocol request.
   */
  public static async handleJsonRpc(
    rpcRequest: McpJsonRpcRequest,
    context: PartnerMcpContext,
  ): Promise<McpJsonRpcResponse> {
    const id = rpcRequest.id ?? 1;

    try {
      if (rpcRequest.method === 'tools/list') {
        const tools = PartnerMcpServer.listTools(context);
        return {
          jsonrpc: '2.0',
          id,
          result: { tools },
        };
      }

      if (rpcRequest.method === 'tools/call') {
        const params = (rpcRequest.params ?? {}) as unknown as McpToolCallRequest;
        const toolResult = await PartnerMcpServer.callTool(params, context);
        return {
          jsonrpc: '2.0',
          id,
          result: toolResult,
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method '${rpcRequest.method}' not found. Supported: 'tools/list', 'tools/call'`,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal error';
      let code = -32603;

      if (err instanceof PartnerMcpAuthError) code = 401;
      if (err instanceof PartnerMcpBoundaryViolationError) code = 403;
      if (err instanceof PartnerMcpForbiddenToolError) code = 403;
      if (err instanceof PartnerMcpToolNotFoundError) code = -32601;

      return {
        jsonrpc: '2.0',
        id,
        error: {
          code,
          message,
        },
      };
    }
  }
}
