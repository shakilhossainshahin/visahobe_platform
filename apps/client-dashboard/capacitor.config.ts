import type { CapacitorConfig } from '@capacitor/cli';

/**
 * VisaHobe Client Dashboard — Android Capacitor 6 Container Configuration
 * (ADR-009 / ADR-012)
 */
export const CLIENT_APP_ID = 'com.visahobe.client';
export const CLIENT_APP_NAME = 'VisaHobe';
export const BRAND_EMERALD_COLOR = '#0D3B2E';
export const BRAND_SURFACE_COLOR = '#F8FAFC';

export const ALLOWED_NAVIGATION_DOMAINS = [
  'visahobe.com',
  '*.visahobe.com',
  'localhost',
  '127.0.0.1',
  '10.0.2.2', // Standard Android Emulator host bridge IP
];

export const capacitorConfig: CapacitorConfig = {
  appId: CLIENT_APP_ID,
  appName: CLIENT_APP_NAME,
  webDir: 'out',
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
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: BRAND_EMERALD_COLOR,
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default capacitorConfig;
