import { redactPii } from '@visahobe/core';
import { AuditService } from '@visahobe/api';
import {
  AdminMcpAuthError,
  AdminMcpMfaRequiredError,
  AdminMcpPermissionError,
  AdminMcpToolNotFoundError,
} from './errors.js';
import { ADMIN_TOOL_DEFINITIONS, ADMIN_TOOL_HANDLERS } from './tools/registry.js';
import type {
  AdminMcpContext,
  AdminMcpRole,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpToolCallRequest,
  McpToolCallResult,
  McpToolDefinition,
} from './types.js';

export class AdminMcpServer {
  private static readonly ALLOWED_STAFF_ROLES: AdminMcpRole[] = [
    'super_admin',
    'owner',
    'admin',
    'case_manager',
    'verifier',
    'finance',
  ];

  /**
   * Asserts that the caller is authenticated staff with verified AAL2 MFA (ADR-012 §3.1).
   */
  public static assertAdminMfa(context: AdminMcpContext): void {
    if (!context.session || !context.session.userId) {
      throw new AdminMcpAuthError();
    }

    const isStaff = AdminMcpServer.ALLOWED_STAFF_ROLES.includes(
      context.session.role as AdminMcpRole,
    );
    if (!isStaff) {
      throw new AdminMcpPermissionError('AdminMcpServer', context.session.role);
    }

    const isAal2 = context.session.aal === 'aal2' || context.session.isMfaVerified === true;
    if (!isAal2) {
      throw new AdminMcpMfaRequiredError();
    }
  }

  /**
   * Lists available MCP tools scoped to the calling staff operator's role.
   */
  public static listTools(context: AdminMcpContext): McpToolDefinition[] {
    AdminMcpServer.assertAdminMfa(context);
    const role = context.session.role as AdminMcpRole;

    return ADMIN_TOOL_DEFINITIONS.filter((tool) => tool.allowedRoles.includes(role));
  }

  /**
   * Executes a tool with strict RBAC scoping, audit logging, and PII redaction.
   */
  public static async callTool(
    request: McpToolCallRequest,
    context: AdminMcpContext,
  ): Promise<McpToolCallResult> {
    AdminMcpServer.assertAdminMfa(context);

    const toolDef = ADMIN_TOOL_DEFINITIONS.find((t) => t.name === request.name);
    if (!toolDef) {
      throw new AdminMcpToolNotFoundError(request.name);
    }

    const role = context.session.role as AdminMcpRole;
    if (!toolDef.allowedRoles.includes(role)) {
      throw new AdminMcpPermissionError(request.name, role);
    }

    const handler = ADMIN_TOOL_HANDLERS[request.name];
    if (!handler) {
      throw new AdminMcpToolNotFoundError(request.name);
    }

    const scrubbedParams = redactPii(request.arguments ?? {});
    let result: unknown;
    let status: 'success' | 'failed' = 'success';
    let errorMessage: string | undefined;

    try {
      result = await handler(request.arguments ?? {}, context);
    } catch (err: unknown) {
      status = 'failed';
      errorMessage = err instanceof Error ? err.message : 'Tool execution error';
      throw err;
    } finally {
      // Append-only audit record per ADR-012 §3.1
      try {
        await AuditService.recordLog(context.session, {
          action: `mcp_tool_call:${request.name}`,
          entityType: 'mcp_tool',
          entityId: request.name,
          details: JSON.stringify({
            status,
            params: scrubbedParams,
            error: errorMessage,
          }),
        });
      } catch {
        // Continue if audit recording completes
      }
    }

    const redactedResult = redactPii(result);

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
    context: AdminMcpContext,
  ): Promise<McpJsonRpcResponse> {
    const id = rpcRequest.id ?? 1;

    try {
      if (rpcRequest.method === 'tools/list') {
        const tools = AdminMcpServer.listTools(context);
        return {
          jsonrpc: '2.0',
          id,
          result: { tools },
        };
      }

      if (rpcRequest.method === 'tools/call') {
        const params = (rpcRequest.params ?? {}) as unknown as McpToolCallRequest;
        const toolResult = await AdminMcpServer.callTool(params, context);
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

      if (err instanceof AdminMcpAuthError) code = 401;
      if (err instanceof AdminMcpMfaRequiredError) code = 403;
      if (err instanceof AdminMcpPermissionError) code = 403;
      if (err instanceof AdminMcpToolNotFoundError) code = -32601;

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
