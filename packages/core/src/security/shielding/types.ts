import type { WhiteLabelBranding } from '../../tenant/types.js';

export type ClientTier = 'b2c_retail' | 'b2b2c_partner' | 'internal_staff';

export class RawMcpAccessForbiddenError extends Error {
  readonly code = 'RAW_MCP_ACCESS_FORBIDDEN';
  readonly statusCode = 403;

  constructor(message?: string) {
    super(
      message ??
        'Access denied: Direct/raw MCP tool endpoints are strictly forbidden for retail applicants. Interact via the built-in AI Concierge (ADR-012).',
    );
    this.name = 'RawMcpAccessForbiddenError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface ShieldOptions {
  callerTenantId?: string | undefined;
  callerRole?: string | undefined;
}

export interface CasePayloadInput {
  id?: string | undefined;
  caseNumber?: string | undefined;
  tenantId?: string | undefined;
  clientId?: string | undefined;
  countryCode?: string | undefined;
  serviceType?: string | undefined;
  status?: string | undefined;
  priority?: string | undefined;
  assignedToUserId?: string | undefined;
  wholesaleCost?: number | undefined;
  wholesaleDiscountPercentage?: number | undefined;
  agencyMarkup?: number | undefined;
  internalCaseworkNotes?: string | undefined;
  agentConfidenceScore?: number | undefined;
  agentAutonomyLevel?: string | undefined;
  agentAuditHash?: string | undefined;
  partnerAgencyId?: string | undefined;
  partnerAgencyName?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

export interface IntakeAssessmentInput {
  referenceId: string;
  destinationCountry: string;
  visaCategory: string;
  score: number;
  tier: string;
  recommendedPathways: string[];
  retailFee: number;
  wholesaleFee?: number | undefined;
  partnerAgencyDiscount?: number | undefined;
  internalConfidenceScore?: number | undefined;
  caseworkRoutingNotes?: string | undefined;
  branding?: WhiteLabelBranding | undefined;
  [key: string]: unknown;
}

export interface ConciergeMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown> | undefined;
}
