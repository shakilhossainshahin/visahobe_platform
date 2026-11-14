import { describe, expect, it } from 'vitest';
import config from '../capacitor.config.js';
import {
  ALLOWED_NAVIGATION_DOMAINS,
  BRAND_EMERALD_COLOR,
  BRAND_SURFACE_COLOR,
  MOBILE_APP_ID,
  MOBILE_APP_NAME,
} from '../src/config/capacitor.js';

describe('Capacitor Android Configuration (TICKET-P1-005)', () => {
  it('enforces canonical app package ID and friendly name', () => {
    expect(config.appId).toBe(MOBILE_APP_ID);
    expect(config.appId).toBe('com.visahobe.app');
    expect(config.appName).toBe(MOBILE_APP_NAME);
    expect(config.appName).toBe('VisaHobe');
  });

  it('points web directory to www fallback bundle', () => {
    expect(config.webDir).toBe('www');
    expect(config.backgroundColor).toBe(BRAND_SURFACE_COLOR);
  });

  it('enforces HTTPS scheme and disallows cleartext HTTP traffic', () => {
    expect(config.server).toBeDefined();
    expect(config.server?.androidScheme).toBe('https');
    expect(config.server?.cleartext).toBe(false);
  });

  it('strictly restricts WebView navigation allowlist to authorized domains', () => {
    const allowed = config.server?.allowNavigation ?? [];
    expect(allowed).toEqual(ALLOWED_NAVIGATION_DOMAINS);
    expect(allowed).toContain('visahobe.com');
    expect(allowed).toContain('*.visahobe.com');
    expect(allowed).toContain('localhost');
    expect(allowed).toContain('127.0.0.1');
    expect(allowed).toContain('10.0.2.2');

    // Arbitrary external domains must NOT be allowlisted
    expect(allowed).not.toContain('*');
    expect(allowed).not.toContain('https://*');
    expect(allowed).not.toContain('google.com');
  });

  it('configures White + Deep Emerald Dark-Green (#0D3B2E) splash screen & status bar theme', () => {
    expect(config.android?.backgroundColor).toBe(BRAND_EMERALD_COLOR);
    expect(BRAND_EMERALD_COLOR).toBe('#0D3B2E');

    const plugins = config.plugins ?? {};
    expect(plugins.SplashScreen?.backgroundColor).toBe(BRAND_EMERALD_COLOR);
    expect(plugins.SplashScreen?.showSpinner).toBe(false);
    expect(plugins.SplashScreen?.splashFullScreen).toBe(true);

    expect(plugins.StatusBar?.backgroundColor).toBe(BRAND_EMERALD_COLOR);
    expect(plugins.StatusBar?.style).toBe('DARK');
    expect(plugins.StatusBar?.overlaysWebView).toBe(false);
  });

  it('disables mixed content and production web content debugging for Android security', () => {
    expect(config.android?.allowMixedContent).toBe(false);
    expect(config.android?.webContentsDebuggingEnabled).toBe(false);
    expect(config.loggingBehavior).toBe('none');
  });
});
