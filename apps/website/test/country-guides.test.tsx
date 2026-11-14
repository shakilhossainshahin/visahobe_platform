import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CountriesDirectoryPage from '../app/countries/page.js';
import CountryGuideDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '../app/countries/[slug]/page.js';

describe('Website Country Guides Routes', () => {
  describe('Countries Directory Page (/countries)', () => {
    it('renders directory heading and filter controls', () => {
      const html = renderToStaticMarkup(<CountriesDirectoryPage />);
      expect(html).toContain('Global Visa &amp; Immigration Directory');
      expect(html).toContain('Official Consular Guides');
      expect(html).toContain('Region:');
      expect(html).toContain('Visa Stream:');
    });

    it('renders all 6 published destination cards with links', () => {
      const html = renderToStaticMarkup(<CountriesDirectoryPage />);
      expect(html).toContain('Singapore');
      expect(html).toContain('Germany');
      expect(html).toContain('United Kingdom');
      expect(html).toContain('Canada');
      expect(html).toContain('Australia');
      expect(html).toContain('United Arab Emirates');

      expect(html).toContain('/countries/singapore');
      expect(html).toContain('/countries/germany');
      expect(html).toContain('/countries/united-kingdom');
      expect(html).toContain('/countries/canada');
      expect(html).toContain('/countries/australia');
      expect(html).toContain('/countries/uae');
    });

    it('does not display unpublished drafts on the directory page', () => {
      const html = renderToStaticMarkup(<CountriesDirectoryPage />);
      expect(html).not.toContain('/countries/new-zealand');
      expect(html).not.toContain('/countries/japan');
    });
  });

  describe('Country Detail Guide Page (/countries/[slug])', () => {
    it('generates correct static parameters for all 6 launch countries', async () => {
      const params = await generateStaticParams();
      expect(params).toHaveLength(6);
      const slugs = params.map((p) => p.slug);
      expect(slugs).toEqual([
        'singapore',
        'germany',
        'united-kingdom',
        'canada',
        'australia',
        'uae',
      ]);
    });

    it('generates rich dynamic SEO metadata for a valid country guide', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'singapore' }),
      });

      expect(metadata.title).toBe('Singapore Visa & Immigration Guide (2026) | VisaHobe');
      expect(metadata.description).toContain('Singapore');
      expect(metadata.description).toContain('processing timeline');
      expect(metadata.openGraph?.title).toContain('Singapore');
    });

    it('provides fallback metadata for non-existent destination', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'atlantis' }),
      });

      expect(metadata.title).toBe('Destination Not Found | VisaHobe');
    });

    it('renders comprehensive guide layout with streams, documents, and fees', async () => {
      const Page = await CountryGuideDetailPage({
        params: Promise.resolve({ slug: 'singapore' }),
      });
      const html = renderToStaticMarkup(Page);

      expect(html).toContain('Singapore Visa &amp; Immigration Guide');
      expect(html).toContain('Ministry of Manpower (MOM) Singapore');
      expect(html).toContain('Employment Pass (EP)');
      expect(html).toContain('Key Visa Streams &amp; Qualification Criteria');
      expect(html).toContain('Required Document Checklist');
      expect(html).toContain('Official Government Fee Summary');
      expect(html).toContain('Assess My Eligibility');
      expect(html).toContain('Official Consular &amp; Legal Disclaimer');
    });

    it('triggers notFound() when slug is invalid', async () => {
      await expect(
        CountryGuideDetailPage({
          params: Promise.resolve({ slug: 'non-existent-country' }),
        }),
      ).rejects.toThrow();
    });

    it('triggers notFound() when slug is an unpublished draft', async () => {
      await expect(
        CountryGuideDetailPage({
          params: Promise.resolve({ slug: 'new-zealand' }),
        }),
      ).rejects.toThrow();
    });
  });
});
