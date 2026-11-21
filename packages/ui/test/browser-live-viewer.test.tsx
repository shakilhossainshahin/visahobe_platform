import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrowserLiveViewer } from '../src/index.js';

describe('BrowserLiveViewer Component (ADR-009 / ADR-011)', () => {
  it('renders active browser session with case details and view-only badge for clients', () => {
    const html = renderToStaticMarkup(
      <BrowserLiveViewer
        sessionId="sess-brw-test-01"
        caseId="case-sg-100"
        caseNumber="VH-2026-SG-4091"
        destinationCountry="SG"
        status="active"
        isClientViewOnly={true}
        userRole="client"
        currentUrl="https://eservices.ica.gov.sg/sgarrivalcard/"
      />,
    );

    expect(html).toContain('Live Consular Browser');
    expect(html).toContain('VH-2026-SG-4091');
    expect(html).toContain('SG');
    expect(html).toContain('View-Only Stream (Zero-Trust)');
    expect(html).toContain('Automated Agent Active');
    expect(html).toContain('https://eservices.ica.gov.sg/sgarrivalcard/');
    expect(html).toContain('Active Defense:');
  });

  it('renders safety gate alert when session is paused on consular gate', () => {
    const html = renderToStaticMarkup(
      <BrowserLiveViewer
        sessionId="sess-brw-test-02"
        caseId="case-ae-200"
        caseNumber="VH-2026-AE-5012"
        destinationCountry="AE"
        status="paused_safety_gate"
        safetyPauseReason="Autonomous execution of live consular portal payment is strictly forbidden. Human financial authorization required."
        blockedAction="portal_payment"
        userRole="client"
      />,
    );

    expect(html).toContain('Consular Safety Gate Engaged');
    expect(html).toContain('Mandatory Safety Gate Paused Automated Execution (ADR-011)');
    expect(html).toContain(
      'Autonomous execution of live consular portal payment is strictly forbidden',
    );
    expect(html).toContain('Blocked action: portal_payment');
  });

  it('renders operator takeover controls for browser_operator / admin role', () => {
    const html = renderToStaticMarkup(
      <BrowserLiveViewer
        sessionId="sess-brw-test-03"
        caseId="case-tr-300"
        status="active"
        isClientViewOnly={false}
        userRole="browser_operator"
        takeoverMode="view_only"
        onRequestTakeover={() => {}}
      />,
    );

    expect(html).toContain('Operator Terminal:');
    expect(html).toContain('Take Over Session (Interactive)');
  });

  it('renders release takeover banner when operator takeover is active', () => {
    const html = renderToStaticMarkup(
      <BrowserLiveViewer
        sessionId="sess-brw-test-04"
        caseId="case-tr-301"
        status="paused_human_takeover"
        isClientViewOnly={false}
        userRole="admin"
        takeoverMode="interactive"
        onReleaseTakeover={() => {}}
      />,
    );

    expect(html).toContain('Human Operator Takeover');
    expect(html).toContain('You have active control of this browser container.');
    expect(html).toContain('Release Control (Return to AI)');
  });

  it('renders terminated state with 10m TTL explanation', () => {
    const html = renderToStaticMarkup(
      <BrowserLiveViewer sessionId="sess-brw-test-05" caseId="case-gb-400" status="terminated" />,
    );

    expect(html).toContain('Browser Session Terminated');
    expect(html).toContain('10-minute idle TTL policy');
  });
});
