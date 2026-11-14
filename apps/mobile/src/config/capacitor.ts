import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Authoritative brand and security constants for the VisaHobe Android mobile container.
 */
export const MOBILE_APP_ID = 'com.visahobe.app';
export const MOBILE_APP_NAME = 'VisaHobe';
export const BRAND_EMERALD_COLOR = '#0D3B2E';
export const BRAND_SURFACE_COLOR = '#FFFFFF';

/**
 * Strict domain allowlist for Capacitor WebView navigation.
 * All external non-allowlisted links must be intercepted or opened in external browser.
 */
export const ALLOWED_NAVIGATION_DOMAINS = [
  'visahobe.com',
  '*.visahobe.com',
  'localhost',
  '127.0.0.1',
  '10.0.2.2', // Standard Android Emulator host bridge IP
];

/**
 * Core Capacitor 6 configuration object for VisaHobe Android.
 */
export const capacitorConfig: CapacitorConfig = {
  appId: MOBILE_APP_ID,
  appName: MOBILE_APP_NAME,
  webDir: 'www',
  backgroundColor: BRAND_SURFACE_COLOR,
  loggingBehavior: 'none',
  android: {
    backgroundColor: BRAND_EMERALD_COLOR,
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: ALLOWED_NAVIGATION_DOMAINS,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: BRAND_EMERALD_COLOR,
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      backgroundColor: BRAND_EMERALD_COLOR,
      style: 'DARK',
      overlaysWebView: false,
    },
  },
};
