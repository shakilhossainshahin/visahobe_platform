import type { UserSession } from '@visahobe/auth';

export type AdminMcpRole =
  'super_admin' | 'owner' | 'admin' | 'case_manager' | 'verifier' | 'finance';

export interface AdminMcpContext {
  session: UserSession;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export interface McpToolInputSchema {
  type: 'object';
  properties: Record<
    string,
    {
      type: string;
      description?: string;
      enum?: string[];
      items?: { type: string };
    }
  >;
  required?: string[];
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: McpToolInputSchema;
  allowedRoles: AdminMcpRole[];
}

export interface McpToolCallRequest {
  name: string;
  arguments?: Record<string, unknown> | undefined;
}

export interface McpToolCallResult {
  content: Array<{
    type: 'text' | 'resource';
    text?: string;
    resource?: unknown;
  }>;
  isError?: boolean | undefined;
}

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown> | undefined;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface AuditRecordPayload {
  userId: string;
  toolName: string;
  status: 'success' | 'failed' | 'denied';
  scrubbedParams: Record<string, unknown>;
  timestamp: string;
  error?: string | undefined;
}
