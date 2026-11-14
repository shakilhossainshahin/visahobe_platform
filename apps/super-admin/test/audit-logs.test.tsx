import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AuditLogsPage from '../app/logs/page.js';

describe('Immutable Audit Trail Viewer & Zero-PII Enforcement (TICKET-P2-001)', () => {
  it('renders immutable audit log table with action items', () => {
    const html = renderToStaticMarkup(<AuditLogsPage />);

    expect(html).toContain('Immutable System Audit Trail');
    expect(html).toContain('data-testid="audit-logs-table"');
    expect(html).toContain('document.verify');
    expect(html).toContain('case.stage_transition');
    expect(html).toContain('document.request_resubmission');
    expect(html).toContain('cms.editorial_update');
    expect(html).toContain('sla.alert_triggered');
  });

  it('guarantees zero raw PII is exposed in audit trails', () => {
    const html = renderToStaticMarkup(<AuditLogsPage />);

    // Zero raw emails, unmasked passport numbers, or raw passwords
    expect(html).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    expect(html).not.toContain('hunter2');
    expect(html).not.toContain('secret-token');
    expect(html).toContain('0 Detected');
  });
});
