import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NavbarShell, FooterShell } from '../src/components/Shell/index.js';

describe('Navigation & Layout Shells (NavbarShell, FooterShell)', () => {
  describe('NavbarShell', () => {
    it('should render brand logo, navigation links, and action buttons', () => {
      const navLinks = [
        { label: 'Services', href: '/services' },
        { label: 'Eligibility', href: '/eligibility', active: true },
        { label: 'Pricing', href: '/pricing' },
      ];
      const actions = <button type="button">Sign In</button>;

      const html = renderToStaticMarkup(
        <NavbarShell navLinks={navLinks} actions={actions} variant="glass" />,
      );

      expect(html).toContain('VisaHobe');
      expect(html).toContain('Services');
      expect(html).toContain('Eligibility');
      expect(html).toContain('aria-current="page"');
      expect(html).toContain('Pricing');
      expect(html).toContain('Sign In');
      expect(html).toContain('backdrop-blur-md');
      expect(html).toContain('sticky top-0');
    });

    it('should render solid variant without glass blur', () => {
      const html = renderToStaticMarkup(<NavbarShell variant="solid" />);
      expect(html).toContain('bg-white');
      expect(html).not.toContain('backdrop-blur-md');
    });
  });

  describe('FooterShell', () => {
    it('should render brand info, categorized columns, disclaimer, and copyright', () => {
      const columns = [
        {
          title: 'Services',
          links: [
            { label: 'Student Visas', href: '/services/student' },
            { label: 'Work Permits', href: '/services/work' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ],
        },
      ];
      const disclaimer =
        'VisaHobe is an independent technology platform and does not provide legal advice.';
      const bottomLinks = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ];

      const html = renderToStaticMarkup(
        <FooterShell
          brandDescription="AI-Powered Visa Operations Platform"
          columns={columns}
          disclaimer={disclaimer}
          bottomLinks={bottomLinks}
        />,
      );

      expect(html).toContain('VisaHobe');
      expect(html).toContain('AI-Powered Visa Operations Platform');
      expect(html).toContain('Student Visas');
      expect(html).toContain('Work Permits');
      expect(html).toContain('About Us');
      expect(html).toContain('VisaHobe is an independent technology platform');
      expect(html).toContain('Privacy Policy');
      expect(html).toContain('Terms of Service');
      expect(html).toContain('All rights reserved');
    });
  });
});
