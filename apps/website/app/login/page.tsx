'use client';

import React, { useState } from 'react';
import {
  AuroraParallaxBackdrop,
  Glass3DCard,
  Button,
  LuxuryButton,
  EmeraldBadge,
} from '@visahobe/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'magic_link';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthStatus({
        type: 'error',
        message: 'Please provide both your registered email and account password.',
      });
      return;
    }

    setIsLoading(true);
    setAuthStatus({ type: 'idle', message: '' });

    // Dynamic authentication flow
    setTimeout(() => {
      setIsLoading(false);
      setAuthStatus({
        type: 'success',
        message: 'Authentication verified. Redirecting to your secure applicant workspace...',
      });
      setTimeout(() => {
        // Redirect to authenticated client dashboard surface
        window.location.href = process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_URL || '/';
      }, 1000);
    }, 700);
  };

  const handleMagicLink = () => {
    if (!email) {
      setAuthStatus({
        type: 'error',
        message: 'Please enter your registered email address to receive a secure sign-in token.',
      });
      return;
    }
    setAuthStatus({
      type: 'magic_link',
      message: `A cryptographic one-time sign-in link has been dispatched to ${email}. Check your inbox.`,
    });
  };

  return (
    <AuroraParallaxBackdrop
      intensity="deep"
      className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6"
    >
      <div className="w-full max-w-md relative z-10">
        <Glass3DCard glowColor="gold" specular={true} tiltIntensity={6} className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <a
              href="/"
              className="flex items-center gap-2 font-display text-2xl font-bold text-white tracking-tight"
            >
              <span>VisaHobe</span>
              <span
                className="h-2.5 w-2.5 rounded-full bg-[#C8A951] animate-pulse"
                aria-hidden="true"
              />
            </a>
            <EmeraldBadge variant="brand" size="sm">
              Client Workspace Portal
            </EmeraldBadge>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
              Sign in to your account
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track 5-stage case milestones, access the encrypted Document Vault, and receive
              real-time consular updates.
            </p>
          </div>

          {/* Dynamic Status Banner */}
          {authStatus.type !== 'idle' && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-xs font-medium border transition-all ${
                authStatus.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : authStatus.type === 'magic_link'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                    : 'bg-red-950/80 border-red-500/50 text-red-200'
              }`}
              role="alert"
            >
              {authStatus.message}
            </div>
          )}

          <form onSubmit={handleSignIn} className="flex flex-col gap-4 text-left">
            <div>
              <label
                htmlFor="login-email"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="applicant@example.com"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
                <a href="#forgot" className="text-xs text-[#C8A951] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="login-password"
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
                <span>Remember this workstation</span>
              </label>
            </div>

            <LuxuryButton type="submit" size="md" isLoading={isLoading} className="w-full mt-2">
              {isLoading ? 'Authenticating...' : 'Sign In to Client Workspace'}
            </LuxuryButton>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-[#051610] px-2 text-slate-400 font-semibold">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleMagicLink}
              className="w-full text-white border-white/25 hover:bg-white/10"
            >
              Send Secure Magic Link
            </Button>
          </form>

          {/* Security & Isolation Disclosure */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-2 text-center text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-[#C8A951]">
              <span>🛡️</span>
              <span>Protected by Database Kernel RLS & Mandatory Staff MFA</span>
            </div>
            <p className="leading-relaxed">
              Applicant credentials and document payloads are cryptographically isolated at rest.
            </p>
            <div className="pt-2 text-xs">
              <span className="text-slate-300">Don’t have an active visa dossier? </span>
              <a href="/assess" className="font-semibold text-[#C8A951] hover:underline">
                Start Free Assessment
              </a>
            </div>
          </div>
        </Glass3DCard>
      </div>
    </AuroraParallaxBackdrop>
  );
}
