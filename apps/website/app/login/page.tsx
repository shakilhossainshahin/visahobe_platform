'use client';

import React, { useState } from 'react';
import { Container, GlassCard, Button, Badge, Input } from '@visahobe/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Preview interaction — in Phase 2 this connects to @visahobe/auth endpoints
    setTimeout(() => {
      setIsLoading(false);
      window.alert('Client workspace authentication is scheduled for Phase 2 implementation.');
    }, 600);
  };

  const handleMagicLink = () => {
    if (!email) {
      window.alert('Please enter your registered email address first.');
      return;
    }
    setIsMagicLinkSent(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background radial gradient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0D3B2E]/5 via-transparent to-transparent blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <Container size="sm" className="relative z-10 max-w-md">
        <GlassCard intensity="elevated" className="p-8 sm:p-10 shadow-glassElevated">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <a
              href="/"
              className="flex items-center gap-2 font-display text-2xl font-bold text-[#0D3B2E]"
            >
              <span>VisaHobe</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#16654F]" aria-hidden="true" />
            </a>
            <Badge variant="brand" size="sm">
              Client Workspace Portal
            </Badge>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#0F172A]">
              Sign in to your account
            </h1>
            <p className="text-xs text-[#475569] leading-relaxed">
              Track case milestones, upload verified documents, and view consular updates.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="flex flex-col gap-5">
            <Input
              id="login-email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="applicant@example.com"
              autoComplete="username"
              required
            />

            <div className="flex flex-col gap-1.5">
              <Input
                id="login-password"
                type="password"
                label="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
              />
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-[#E2E8F0] text-[#0D3B2E] focus:ring-[#0D3B2E]"
                  />
                  <span>Remember device</span>
                </label>
                <a href="#forgot" className="text-[#0D3B2E] font-medium hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              loadingText="Authenticating..."
              className="w-full shadow-md mt-2"
            >
              Sign In to Client Workspace
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white/80 px-2 text-[#64748B] font-semibold">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleMagicLink}
              className="w-full"
            >
              {isMagicLinkSent ? '✓ Magic Link Sent!' : 'Send Secure Magic Link'}
            </Button>
          </form>

          {/* Security & Mobile Sync Badge */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col items-center gap-2 text-center text-xs text-[#64748B]">
            <div className="flex items-center gap-1.5 font-medium text-[#0D3B2E]">
              <span>🛡️</span>
              <span>Protected by Database Kernel RLS & Mandatory Staff MFA</span>
            </div>
            <p className="leading-relaxed">
              Unified web and Android app authentication. Session tokens are strictly encrypted.
            </p>
            <div className="pt-2 text-xs">
              <span className="text-[#475569]">Don’t have an active application? </span>
              <a href="/assess" className="font-semibold text-[#0D3B2E] hover:underline">
                Start Free Assessment
              </a>
            </div>
          </div>
        </GlassCard>
      </Container>
    </div>
  );
}
