'use client';

import React, { useState } from 'react';
import { AuroraParallaxBackdrop, Glass3DCard, LuxuryButton, EmeraldBadge } from '@visahobe/ui';

export default function SuperAdminLoginPage() {
  const [operatorId, setOperatorId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleOperatorSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!operatorId.trim() || !password) {
      setError('Please provide your staff operator email or credential ID.');
      return;
    }

    setIsLoading(true);

    // Operator authentication simulation routing to mandatory MFA challenge
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage(
        'Operator identity verified. Forwarding to hardware MFA challenge (AAL2)...',
      );
      setTimeout(() => {
        window.location.href = '/mfa-verify?redirect=/';
      }, 700);
    }, 600);
  };

  return (
    <AuroraParallaxBackdrop
      intensity="deep"
      className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6"
    >
      <div className="w-full max-w-md relative z-10">
        <Glass3DCard glowColor="gold" specular={true} tiltIntensity={6} className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="flex items-center gap-2.5 font-display text-2xl font-bold text-white tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-[#0D3B2E] border border-[#C8A951]/70 flex items-center justify-center text-[#C8A951] font-bold text-base shadow-md">
                VH
              </div>
              <span>Command Center</span>
            </div>
            <EmeraldBadge variant="gold" size="sm" dot={false}>
              Restricted Operations Desk
            </EmeraldBadge>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
              Staff Operator Sign In
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Internal operations environment for verifiers, case managers, and platform
              administrators.
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs font-medium bg-red-950/80 border border-red-500/50 text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          {statusMessage && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs font-medium bg-emerald-950/80 border border-emerald-500/50 text-emerald-200"
              role="status"
            >
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleOperatorSignIn} className="flex flex-col gap-4 text-left">
            <div>
              <label
                htmlFor="admin-operator-id"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5"
              >
                Operator Email / Staff ID
              </label>
              <input
                id="admin-operator-id"
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                placeholder="verifier@visahobe.internal"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
                <a href="#reset" className="text-xs text-[#C8A951] hover:underline">
                  Key Recovery
                </a>
              </div>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-white/30 bg-black/40 text-[#0D3B2E] focus:ring-[#C8A951]"
                />
                <span>Hardware Trust Sealed</span>
              </label>
              <span className="text-[11px] font-mono text-[#C8A951]">MFA Required</span>
            </div>

            <LuxuryButton type="submit" size="md" isLoading={isLoading} className="w-full mt-2">
              {isLoading ? 'Verifying Key...' : 'Authenticate & Challenge MFA →'}
            </LuxuryButton>
          </form>

          {/* Governance Notice */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-2 text-center text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-[#C8A951]">
              <span>🛡️</span>
              <span>Mandatory AAL2 MFA • Kernel RLS Session Enforcement</span>
            </div>
            <p className="leading-relaxed">
              Unauthorized access attempts are monitored and recorded in the immutable PostgreSQL
              audit trail.
            </p>
          </div>
        </Glass3DCard>
      </div>
    </AuroraParallaxBackdrop>
  );
}
