'use client';

import React, { useState } from 'react';
import { Button, Card, Badge } from '@visahobe/ui';

export default function MfaVerifyPage() {
  const [totpCode, setTotpCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'totp' | 'passkey'>('totp');

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totpCode.length !== 6 || !/^\d{6}$/.test(totpCode)) {
      setError('Please enter a valid 6-digit numeric authenticator code.');
      return;
    }

    setIsVerifying(true);
    // Simulate instantaneous verification
    setTimeout(() => {
      setIsVerifying(false);
      if (totpCode === '000000') {
        setError('Invalid or expired authenticator code. Please try again.');
      } else {
        setSuccess(true);
        // In real flow, router.push('/') or reload session
      }
    }, 400);
  };

  const handlePasskeySubmit = () => {
    setError(null);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setSuccess(true);
    }, 500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0D3B2E] text-white font-bold text-xl shadow-md">
            VH
          </div>
          <h1 className="text-2xl font-display font-bold text-[#0D3B2E]">
            Staff Security Verification
          </h1>
          <p className="text-sm text-[#64748B]">
            AAL2 Multi-Factor Authentication required for VisaHobe Command Center operators.
          </p>
        </div>

        {/* Liquid Glass Container Card */}
        <Card
          className="p-6 sm:p-8 bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-lg rounded-2xl"
          data-testid="mfa-verify-card"
        >
          {/* Method Selector Tabs */}
          <div className="flex rounded-lg bg-[#F1F5F9] p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('totp');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMethod === 'totp'
                  ? 'bg-white text-[#0D3B2E] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0D3B2E]'
              }`}
            >
              Authenticator App (TOTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('passkey');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMethod === 'passkey'
                  ? 'bg-white text-[#0D3B2E] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0D3B2E]'
              }`}
            >
              Passkey / Security Key
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="text-center space-y-4 py-4" data-testid="mfa-success-banner">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D3B2E]">Identity Verified (AAL2)</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  MFA challenge satisfied. Redirecting to your assigned case queue...
                </p>
              </div>
              <Badge variant="success" size="md">
                Session Sealed
              </Badge>
            </div>
          ) : authMethod === 'totp' ? (
            /* TOTP 6-Digit Form */
            <form onSubmit={handleTotpSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="totp-code"
                  className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                >
                  6-Digit Authenticator Code
                </label>
                <input
                  id="totp-code"
                  name="totpCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent transition-all"
                  data-testid="totp-input"
                  autoFocus
                />
                <span className="block text-[11px] text-[#64748B] mt-1 text-center">
                  Open Google Authenticator, 1Password, or YubiKey Authenticator
                </span>
              </div>

              {error && (
                <div
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#B91C1C] font-medium"
                  data-testid="mfa-error-message"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isVerifying}
                className="w-full justify-center bg-[#0D3B2E] hover:bg-[#092A21] text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                data-testid="verify-totp-button"
              >
                Verify &amp; Continue
              </Button>
            </form>
          ) : (
            /* Passkey / FIDO2 Challenge */
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center mx-auto text-2xl">
                🔑
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Hardware Security Key</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Insert your YubiKey or authenticate with Touch ID / Windows Hello.
                </p>
              </div>

              {error && (
                <div
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#B91C1C] font-medium text-left"
                  data-testid="mfa-error-message"
                >
                  {error}
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isVerifying}
                onClick={handlePasskeySubmit}
                className="w-full justify-center bg-[#0D3B2E] hover:bg-[#092A21] text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                data-testid="verify-passkey-button"
              >
                Trigger Passkey Verification
              </Button>
            </div>
          )}

          {/* Security Compliance Footer Note */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
              <span>TLS 1.3 End-to-End Encrypted • FIPS 140-3 Hardware Compliant</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Lost your device? Contact your organization’s Lead Security Administrator.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
