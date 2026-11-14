import { describe, expect, it } from 'vitest';
import { resolveAppDeepLink } from '../src/bridge/native-bridge.js';

describe('Deep Link & Push Notification Router (TICKET-P1-005)', () => {
  describe('Public Acquisition Routes (Website)', () => {
    it('routes /assess to public intake wizard', () => {
      const target = resolveAppDeepLink('/assess');
      expect(target.targetApp).toBe('website');
      expect(target.path).toBe('/assess');
      expect(target.matchedRoute).toBe('assessment');
      expect(target.fullUrl).toBe('https://visahobe.com/assess');
    });

    it('routes /countries directory to website', () => {
      const target = resolveAppDeepLink('/countries');
      expect(target.targetApp).toBe('website');
      expect(target.path).toBe('/countries');
      expect(target.matchedRoute).toBe('countries-index');
      expect(target.fullUrl).toBe('https://visahobe.com/countries');
    });

    it('routes dynamic country policy guide /countries/:slug with slug param', () => {
      const target = resolveAppDeepLink('/countries/singapore?stream=employment_pass');
      expect(target.targetApp).toBe('website');
      expect(target.path).toBe('/countries/singapore');
      expect(target.params.slug).toBe('singapore');
      expect(target.params.stream).toBe('employment_pass');
      expect(target.matchedRoute).toBe('country-guide');
      expect(target.fullUrl).toContain('https://visahobe.com/countries/singapore?');
      expect(target.fullUrl).toContain('stream=employment_pass');
    });

    it('routes custom scheme visahobe://countries/germany', () => {
      const target = resolveAppDeepLink('visahobe://countries/germany?region=eu');
      expect(target.targetApp).toBe('website');
      expect(target.path).toBe('/countries/germany');
      expect(target.params.slug).toBe('germany');
      expect(target.params.region).toBe('eu');
    });
  });

  describe('Client Dashboard Workspace Routes', () => {
    it('routes /documents to client dashboard vault', () => {
      const target = resolveAppDeepLink('/documents?filter=pending');
      expect(target.targetApp).toBe('client-dashboard');
      expect(target.path).toBe('/documents');
      expect(target.matchedRoute).toBe('/documents');
      expect(target.params.filter).toBe('pending');
      expect(target.fullUrl).toBe('https://dashboard.visahobe.com/documents?filter=pending');
    });

    it('routes custom scheme visahobe://documents', () => {
      const target = resolveAppDeepLink('visahobe://documents?tab=verified');
      expect(target.targetApp).toBe('client-dashboard');
      expect(target.path).toBe('/documents');
      expect(target.params.tab).toBe('verified');
      expect(target.fullUrl).toBe('https://dashboard.visahobe.com/documents?tab=verified');
    });

    it('routes /messages to specialist communication channel', () => {
      const target = resolveAppDeepLink('visahobe://messages');
      expect(target.targetApp).toBe('client-dashboard');
      expect(target.path).toBe('/messages');
      expect(target.matchedRoute).toBe('/messages');
      expect(target.fullUrl).toBe('https://dashboard.visahobe.com/messages');
    });

    it('routes /overview or case references to dashboard root', () => {
      const target = resolveAppDeepLink('/cases/VH-2026-SG-4921');
      expect(target.targetApp).toBe('client-dashboard');
      expect(target.path).toBe('/');
      expect(target.matchedRoute).toBe('/');
      expect(target.fullUrl).toBe('https://dashboard.visahobe.com/');
    });
  });

  describe('Defense-in-Depth PII Query Parameter Scrubbing', () => {
    it('strictly redacts/strips sensitive query parameters from deep-link targets', () => {
      const dirtyUrl =
        'visahobe://documents?tab=checklist&email=applicant%40gmail.com&phone=%2B123456789&passport=A87654321&name=JohnDoe&token=secret-jwt-12345&password=hunter2';

      const target = resolveAppDeepLink(dirtyUrl);

      // Safe parameter must be preserved
      expect(target.params.tab).toBe('checklist');

      // Sensitive PII parameters must be stripped completely
      expect(target.params.email).toBeUndefined();
      expect(target.params.phone).toBeUndefined();
      expect(target.params.passport).toBeUndefined();
      expect(target.params.name).toBeUndefined();
      expect(target.params.token).toBeUndefined();
      expect(target.params.password).toBeUndefined();

      // Full generated URL must not leak any of the raw PII strings
      expect(target.fullUrl).not.toContain('applicant');
      expect(target.fullUrl).not.toContain('A87654321');
      expect(target.fullUrl).not.toContain('123456789');
      expect(target.fullUrl).not.toContain('JohnDoe');
      expect(target.fullUrl).not.toContain('secret-jwt');
      expect(target.fullUrl).not.toContain('hunter2');
    });

    it('handles malformed deep-link URLs gracefully without throwing', () => {
      const target = resolveAppDeepLink('not-a-valid-url-at-all');
      expect(target.targetApp).toBe('website');
      expect(target.path).toBe('/');
      expect(target.matchedRoute).toBe('fallback');
      expect(target.fullUrl).toBe('https://visahobe.com/');
    });
  });
});
