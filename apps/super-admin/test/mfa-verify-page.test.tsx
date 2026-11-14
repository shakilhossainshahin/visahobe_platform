import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MfaVerifyPage from '../app/mfa-verify/page.js';

describe('MfaVerifyPage Component & Liquid Glass Styling (TICKET-P2-002)', () => {
  it('renders TOTP challenge form with 6-digit input and brand branding', () => {
    const html = renderToStaticMarkup(<MfaVerifyPage />);

    expect(html).toContain('Staff Security Verification');
    expect(html).toContain('data-testid="mfa-verify-card"');
    expect(html).toContain('data-testid="totp-input"');
    expect(html).toContain('data-testid="verify-totp-button"');
    expect(html).toContain('Authenticator App (TOTP)');
    expect(html).toContain('Passkey / Security Key');
    expect(html).toContain('6-Digit Authenticator Code');
    expect(html).toContain('FIPS 140-3 Hardware Compliant');
  });

  it('renders Liquid Glass card with Deep Emerald brand accents', () => {
    const html = renderToStaticMarkup(<MfaVerifyPage />);

    // Deep emerald brand color tokens
    expect(html).toContain('#0D3B2E');
    // Liquid glass card with backdrop blur
    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('bg-white/90');
  });
});
