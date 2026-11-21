'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if dismissed previously
    if (sessionStorage.getItem('vh_pwa_dismissed') === 'true') {
      setIsDismissed(true);
    }

    // Detect standalone mode (already installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('vh_pwa_dismissed', 'true');
  };

  // If already installed or dismissed, do not render banner
  if (isStandalone || isDismissed) {
    return null;
  }

  // Show if either iOS in browser or Android with install prompt
  const shouldShow = isIos || deferredPrompt !== null;
  if (!shouldShow) {
    return null;
  }

  return (
    <aside
      className="fixed top-18 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#C8A951]/40 text-[#0F172A] transition-all"
      data-testid="pwa-install-banner"
      aria-label="PWA Installation Notice"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D3B2E] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            VH
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#0D3B2E]">
              Install VisaHobe Mobile App
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              Fast live status updates, instant biometric alerts & offline document vault.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#94A3B8] hover:text-[#0F172A] text-xs p-1"
          aria-label="Dismiss app install banner"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#F1F5F9]">
        {isIos ? (
          <div className="text-[11px] text-[#334155] flex items-center gap-2">
            <span>Tap Safari Share</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-300">
              ⎋
            </span>
            <span>then select</span>
            <strong className="text-[#0D3B2E]">"Add to Home Screen" ⊞</strong>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-2 px-3 rounded-xl bg-[#0D3B2E] hover:bg-[#092A21] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>📱 Add to Home Screen</span>
          </button>
        )}
      </div>
    </aside>
  );
}
