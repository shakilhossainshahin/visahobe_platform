import { describe, it, expect } from 'vitest';
import {
  getPublishedCountryGuides,
  getCountryGuideBySlug,
  getGuidesByStream,
  getGuidesByRegion,
  getAllCountryGuides,
  getPublishedCountrySlugs,
  launchCountryGuides,
  newZealandDraftGuide,
  japanInReviewGuide,
} from '../src/index.js';

describe('@visahobe/cms - Country Visa Guide Engine', () => {
  describe('getPublishedCountryGuides', () => {
    it('returns exactly the 6 launch destination countries', () => {
      expect(launchCountryGuides).toHaveLength(6);
      const guides = getPublishedCountryGuides();
      expect(guides).toHaveLength(6);

      const slugs = guides.map((g) => g.slug);
      expect(slugs).toContain('singapore');
      expect(slugs).toContain('germany');
      expect(slugs).toContain('united-kingdom');
      expect(slugs).toContain('canada');
      expect(slugs).toContain('australia');
      expect(slugs).toContain('uae');
    });

    it('strictly excludes unpublished drafts and in-review packages', () => {
      const guides = getPublishedCountryGuides();
      const slugs = guides.map((g) => g.slug);

      expect(slugs).not.toContain('new-zealand');
      expect(slugs).not.toContain('japan');

      guides.forEach((guide) => {
        expect(guide.editorialStatus).toBe('published');
      });
    });

    it('contains comprehensive and authoritative data fields for each published guide', () => {
      const guides = getPublishedCountryGuides();

      guides.forEach((guide) => {
        expect(guide.slug).toBeTruthy();
        expect(guide.countryName).toBeTruthy();
        expect(guide.countryCode).toMatch(/^[A-Z]{2}$/);
        expect(guide.region).toBeTruthy();
        expect(guide.flagEmoji).toBeTruthy();
        expect(guide.tagline).toBeTruthy();
        expect(guide.summary.length).toBeGreaterThan(50);
        expect(guide.capital).toBeTruthy();
        expect(guide.currency).toBeTruthy();
        expect(guide.officialLanguage).toBeTruthy();
        expect(guide.processingTimeRange).toBeTruthy();
        expect(guide.minimumFundsRequirement).toBeTruthy();
        expect(guide.officialPortalUrl).toMatch(/^https?:\/\//);
        expect(guide.officialPortalName).toBeTruthy();
        expect(guide.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Visa streams verification
        expect(guide.visaStreams.length).toBeGreaterThanOrEqual(2);
        guide.visaStreams.forEach((stream) => {
          expect(stream.id).toBeTruthy();
          expect(stream.name).toBeTruthy();
          expect(stream.category).toBeTruthy();
          expect(stream.processingTime).toBeTruthy();
          expect(stream.minimumFunds).toBeTruthy();
          expect(stream.eligibleProfiles.length).toBeGreaterThanOrEqual(1);
          expect(stream.keyRequirements.length).toBeGreaterThanOrEqual(1);
        });

        // Document checklist verification
        expect(guide.documentChecklist.length).toBeGreaterThanOrEqual(3);
        guide.documentChecklist.forEach((doc) => {
          expect(doc.id).toBeTruthy();
          expect(doc.title).toBeTruthy();
          expect(typeof doc.mandatory).toBe('boolean');
          expect(['identity', 'financial', 'professional', 'educational', 'health']).toContain(
            doc.category,
          );
        });

        // Official fee summary
        expect(guide.officialFeeSummary.length).toBeGreaterThanOrEqual(1);
        guide.officialFeeSummary.forEach((fee) => {
          expect(fee.streamName).toBeTruthy();
          expect(fee.governmentFee).toBeTruthy();
        });
      });
    });
  });

  describe('getCountryGuideBySlug', () => {
    it('retrieves published country guide by slug case-insensitively', () => {
      const sg = getCountryGuideBySlug('singapore');
      expect(sg).toBeDefined();
      expect(sg?.countryName).toBe('Singapore');

      const deUpper = getCountryGuideBySlug('GERMANY');
      expect(deUpper).toBeDefined();
      expect(deUpper?.countryName).toBe('Germany');

      const uk = getCountryGuideBySlug('united-kingdom');
      expect(uk).toBeDefined();
      expect(uk?.countryName).toBe('United Kingdom');
    });

    it('returns undefined for non-existent country slug', () => {
      const result = getCountryGuideBySlug('non-existent-nation');
      expect(result).toBeUndefined();
    });

    it('strictly returns undefined for draft country slug', () => {
      expect(newZealandDraftGuide.slug).toBe('new-zealand');
      expect(newZealandDraftGuide.editorialStatus).toBe('draft');

      const result = getCountryGuideBySlug('new-zealand');
      expect(result).toBeUndefined();
    });

    it('strictly returns undefined for in-review country slug', () => {
      expect(japanInReviewGuide.slug).toBe('japan');
      expect(japanInReviewGuide.editorialStatus).toBe('in_review');

      const result = getCountryGuideBySlug('japan');
      expect(result).toBeUndefined();
    });
  });

  describe('getGuidesByStream', () => {
    it('returns published countries offering Skilled Work visas', () => {
      const skilled = getGuidesByStream('Skilled Work');
      expect(skilled.length).toBeGreaterThanOrEqual(5);

      skilled.forEach((guide) => {
        expect(guide.editorialStatus).toBe('published');
        const hasSkilled = guide.visaStreams.some((s) => s.category === 'Skilled Work');
        expect(hasSkilled).toBe(true);
      });
    });

    it('returns published countries offering Student Visas', () => {
      const student = getGuidesByStream('Student Visa');
      expect(student.length).toBeGreaterThanOrEqual(4);

      student.forEach((guide) => {
        expect(guide.editorialStatus).toBe('published');
        const hasStudent = guide.visaStreams.some((s) => s.category === 'Student Visa');
        expect(hasStudent).toBe(true);
      });
    });
  });

  describe('getGuidesByRegion', () => {
    it('returns countries in Europe', () => {
      const europe = getGuidesByRegion('Europe');
      const slugs = europe.map((g) => g.slug);
      expect(slugs).toContain('germany');
      expect(slugs).toContain('united-kingdom');
      expect(slugs).not.toContain('singapore');
    });

    it('returns countries in Asia Pacific', () => {
      const apac = getGuidesByRegion('Asia Pacific');
      const slugs = apac.map((g) => g.slug);
      expect(slugs).toContain('singapore');
      // Should NOT contain Japan because Japan is in_review!
      expect(slugs).not.toContain('japan');
    });
  });

  describe('getAllCountryGuides', () => {
    it('returns only published guides by default', () => {
      const guides = getAllCountryGuides();
      expect(guides).toHaveLength(6);
    });

    it('returns all guides including drafts when includeDrafts is true', () => {
      const allGuides = getAllCountryGuides({ includeDrafts: true });
      expect(allGuides.length).toBe(8);

      const draft = allGuides.find((g) => g.editorialStatus === 'draft');
      expect(draft).toBeDefined();
      expect(draft?.slug).toBe('new-zealand');

      const inReview = allGuides.find((g) => g.editorialStatus === 'in_review');
      expect(inReview).toBeDefined();
      expect(inReview?.slug).toBe('japan');
    });
  });

  describe('getPublishedCountrySlugs', () => {
    it('returns 6 unique published slugs for static generation', () => {
      const slugs = getPublishedCountrySlugs();
      expect(slugs).toEqual([
        'singapore',
        'germany',
        'united-kingdom',
        'canada',
        'australia',
        'uae',
      ]);
    });
  });
});
