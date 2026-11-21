'use client';

import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

export interface BrowserLiveViewerProps {
  sessionId: string;
  caseId: string;
  caseNumber?: string | undefined;
  destinationCountry?: string | undefined;
  status: 'provisioning' | 'active' | 'paused_safety_gate' | 'paused_human_takeover' | 'terminated';
  streamUrl?: string | undefined;
  isClientViewOnly?: boolean | undefined;
  userRole?: string | undefined;
  takeoverMode?: 'view_only' | 'interactive' | undefined;
  safetyPauseReason?: string | undefined;
  blockedAction?: string | undefined;
  currentUrl?: string | undefined;
  onRequestTakeover?: (() => void | Promise<void>) | undefined;
  onReleaseTakeover?: (() => void | Promise<void>) | undefined;
  onRefreshStream?: (() => void) | undefined;
  className?: string | undefined;
}

export const BrowserLiveViewer: React.FC<BrowserLiveViewerProps> = ({
  sessionId,
  caseId: _caseId,
  caseNumber,
  destinationCountry,
  status,
  streamUrl,
  isClientViewOnly = true,
  userRole = 'client',
  takeoverMode = 'view_only',
  safetyPauseReason,
  blockedAction,
  currentUrl,
  onRequestTakeover,
  onReleaseTakeover,
  onRefreshStream,
  className,
}) => {
  const [isTakingOver, setIsTakingOver] = useState(false);

  const isOperator = ['browser_operator', 'admin', 'owner', 'super_admin'].includes(userRole);
  const isInteractive = takeoverMode === 'interactive' || status === 'paused_human_takeover';
  const isSafetyPaused = status === 'paused_safety_gate';
  const isTerminated = status === 'terminated';

  const handleTakeover = async () => {
    if (!onRequestTakeover || isTakingOver) return;
    try {
      setIsTakingOver(true);
      await onRequestTakeover();
    } finally {
      setIsTakingOver(false);
    }
  };

  const handleRelease = async () => {
    if (!onReleaseTakeover || isTakingOver) return;
    try {
      setIsTakingOver(true);
      await onReleaseTakeover();
    } finally {
      setIsTakingOver(false);
    }
  };

  return (
    <div
      data-testid="browser-live-viewer"
      className={cn(
        'relative flex flex-col rounded-2xl border border-[#C8A951]/30 bg-white/90 backdrop-blur-md shadow-2xl overflow-hidden',
        className,
      )}
    >
      {/* Top Emerald & Gold Luxury Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 items-center justify-center">
            <span
              className={cn(
                'relative flex h-2.5 w-2.5 rounded-full',
                status === 'active' && 'bg-emerald-500 animate-pulse',
                status === 'paused_safety_gate' && 'bg-amber-500',
                status === 'paused_human_takeover' && 'bg-blue-600',
                status === 'terminated' && 'bg-slate-400',
                status === 'provisioning' && 'bg-indigo-400',
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold text-[#0D3B2E]">
              Live Consular Browser
            </span>
            {caseNumber && (
              <span className="rounded bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 font-mono text-xs text-[#111827]">
                {caseNumber}
              </span>
            )}
            {destinationCountry && (
              <span className="rounded bg-[#0D3B2E]/10 px-2 py-0.5 font-sans text-xs font-semibold text-[#0D3B2E]">
                {destinationCountry}
              </span>
            )}
          </div>
        </div>

        {/* Center / Right Status & Privacy Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {isClientViewOnly && (
            <span
              data-testid="badge-view-only"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View-Only Stream (Zero-Trust)
            </span>
          )}

          {status === 'active' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Automated Agent Active
            </span>
          )}

          {isSafetyPaused && (
            <span
              data-testid="badge-safety-paused"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-900"
            >
              <svg className="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Consular Safety Gate Engaged
            </span>
          )}

          {isInteractive && (
            <span
              data-testid="badge-takeover-active"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-900"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Human Operator Takeover
            </span>
          )}

          {isTerminated && (
            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600">
              Session Terminated (10m TTL)
            </span>
          )}

          {onRefreshStream && (
            <button
              type="button"
              onClick={onRefreshStream}
              aria-label="Refresh live stream"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Refresh Stream"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Safety Gate Alert Banner */}
      {isSafetyPaused && (
        <div
          data-testid="alert-safety-gate"
          className="border-b border-amber-200 bg-amber-50/95 px-5 py-3 text-sm text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
        >
          <div className="flex items-start gap-2.5">
            <svg
              className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold text-amber-900">
                Mandatory Safety Gate Paused Automated Execution (ADR-011)
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                {safetyPauseReason ??
                  'High-risk consular action detected. Autonomous progression is halted until human sign-off.'}
              </p>
              {blockedAction && (
                <span className="inline-block mt-1.5 rounded bg-amber-200/80 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-900">
                  Blocked action: {blockedAction}
                </span>
              )}
            </div>
          </div>

          {isOperator && onRequestTakeover && (
            <button
              type="button"
              data-testid="btn-takeover-alert"
              onClick={handleTakeover}
              disabled={isTakingOver}
              className="shrink-0 rounded-lg bg-[#0D3B2E] px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#092A21] border border-[#C8A951]/40 transition disabled:opacity-50"
            >
              {isTakingOver ? 'Taking Over...' : 'Take Over Session'}
            </button>
          )}
        </div>
      )}

      {/* Operator Takeover Control Banner */}
      {isOperator && (
        <div
          data-testid="banner-operator-takeover"
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 border-b px-5 py-2.5 text-xs transition',
            isInteractive
              ? 'border-blue-200 bg-blue-50/90 text-blue-900'
              : 'border-slate-200 bg-slate-50 text-slate-700',
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#0D3B2E]">Operator Terminal:</span>
            {isInteractive ? (
              <span className="font-semibold text-blue-950">
                You have active control of this browser container.
              </span>
            ) : (
              <span>Automated agent is running. You may take over at any checkpoint.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isInteractive ? (
              <button
                type="button"
                data-testid="btn-release-takeover"
                onClick={handleRelease}
                disabled={isTakingOver}
                className="rounded-lg bg-white border border-blue-300 px-3 py-1 font-semibold text-blue-900 shadow-sm hover:bg-blue-100 transition disabled:opacity-50"
              >
                {isTakingOver ? 'Releasing...' : 'Release Control (Return to AI)'}
              </button>
            ) : (
              onRequestTakeover && (
                <button
                  type="button"
                  data-testid="btn-request-takeover"
                  onClick={handleTakeover}
                  disabled={isTakingOver}
                  className="rounded-lg bg-[#0D3B2E] border border-[#C8A951]/40 px-3 py-1 font-semibold text-white shadow-sm hover:bg-[#092A21] transition disabled:opacity-50"
                >
                  {isTakingOver ? 'Authorizing...' : 'Take Over Session (Interactive)'}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Main Viewport Screen */}
      <div className="relative aspect-[16/10] w-full bg-[#111827] overflow-hidden flex items-center justify-center">
        {isTerminated ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <svg
              className="h-12 w-12 text-slate-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="font-heading text-base font-bold text-slate-200">
              Browser Session Terminated
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              This isolated container has been recycled according to the 10-minute idle TTL policy.
            </p>
          </div>
        ) : (
          <div className="relative h-full w-full flex flex-col justify-between">
            {/* Virtual Browser Top Address Bar (Simulated & Sanitized) */}
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[11px] text-emerald-400">TLS SECURE</span>
                <span className="font-mono text-slate-400">|</span>
                <span className="font-mono text-slate-300 truncate max-w-md">
                  {currentUrl ?? 'https://eservices.ica.gov.sg/sgarrivalcard/'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                <span>Display :99</span>
                <span>•</span>
                <span>noVNC: 6080</span>
              </div>
            </div>

            {/* Simulated Live Viewport Canvas / Frame */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 opacity-90" />

              {/* Watermark */}
              <div className="relative z-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md mb-3">
                  <svg
                    className="h-7 w-7 text-[#C8A951]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-bold text-white tracking-wide">
                  VisaHobe Zero-Trust Browser Sandbox
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Isolated virtual display streaming via encrypted WebSocket. Internal credentials
                  and direct VNC sockets are shielded.
                </p>

                {streamUrl && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-3 py-1 font-mono text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>
                      Stream Endpoint: /api/v1/browser/stream?session={sessionId.slice(0, 10)}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Active Redaction Banner */}
              <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between rounded-lg bg-black/60 border border-white/10 px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#C8A951]">🔒 Active Defense:</span>
                  <span>
                    Sensitive passport numbers, CVVs, and passwords are cryptographically redacted.
                  </span>
                </div>
                <span className="font-mono text-slate-500">1280x800 @ 30fps</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] bg-white px-5 py-2.5 text-xs text-[#111827]">
        <div className="flex items-center gap-2 text-slate-600">
          <span>Session ID:</span>
          <span className="font-mono font-medium text-slate-800">{sessionId}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span>Single-Use Container</span>
          <span>•</span>
          <span>Automatic 10m TTL Cleanup</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">ADR-005 Compliant</span>
        </div>
      </div>
    </div>
  );
};
