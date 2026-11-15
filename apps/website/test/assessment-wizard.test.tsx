import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AssessmentPage from '../app/assess/page.js';
import LoginPage from '../app/login/page.js';

describe('Assessment Wizard & Login Preview Components', () => {
  describe('AssessmentPage', () => {
    it('should render Step 1 destination and stream fields by default', () => {
      const html = renderToStaticMarkup(<AssessmentPage />);
      expect(html).toContain('Visa Eligibility &amp; Intake Wizard');
      expect(html).toContain('Step 1 of 4');
      expect(html).toContain('Destination &amp; Visa Stream');
      expect(html).toContain('Target Destination Country');
      expect(html).toContain('Intended Visa Category');
      expect(html).toContain('Citizenship / Passport Country');
      expect(html).toContain('Continue →');
    });

    it('should display AI Assessment Engine badge', () => {
      const html = renderToStaticMarkup(<AssessmentPage />);
      expect(html).toContain('AI Assessment Engine v2.0');
    });

    it('should render real-time eligibility score estimator, transparent fee breakdown, and dynamic document checklist preview', () => {
      const html = renderToStaticMarkup(<AssessmentPage />);
      expect(html).toContain('Real-Time Eligibility &amp; Fee Estimator');
      expect(html).toContain('Live Consular Score');
      expect(html).toContain('Transparent Fee Breakdown');
      expect(html).toContain('Dynamic Document Checklist Preview');
      expect(html).toContain('Open Client Dashboard Document Vault →');
    });
  });

  describe('LoginPage', () => {
    it('should render client sign-in form with email and password inputs', () => {
      const html = renderToStaticMarkup(<LoginPage />);
      expect(html).toContain('Client Workspace Portal');
      expect(html).toContain('Sign in to your account');
      expect(html).toContain('id="login-email"');
      expect(html).toContain('id="login-password"');
      expect(html).toContain('Sign In to Client Workspace');
      expect(html).toContain('Send Secure Magic Link');
    });

    it('should display database kernel RLS protection notice', () => {
      const html = renderToStaticMarkup(<LoginPage />);
      expect(html).toContain('Protected by Database Kernel RLS &amp; Mandatory Staff MFA');
    });
  });
});
