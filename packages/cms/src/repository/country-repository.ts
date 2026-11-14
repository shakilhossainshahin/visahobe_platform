import { allInternalCountryGuides } from '../data/countries/index.js';
import type { CountryVisaGuide, VisaCategory } from '../types/country.js';

export interface GetAllCountryGuidesOptions {
  includeDrafts?: boolean | undefined;
}

/**
 * Returns all published country visa guides.
 * Unpublished drafts and in-review packages are strictly filtered out.
 */
export function getPublishedCountryGuides(): CountryVisaGuide[] {
  return allInternalCountryGuides.filter((guide) => guide.editorialStatus === 'published');
}

/**
 * Fetches a single country visa guide by its URL slug.
 * If the country exists but has not been published (draft/in_review), this function
 * returns `undefined` to guarantee zero exposure of non-public policy content.
 */
export function getCountryGuideBySlug(slug: string): CountryVisaGuide | undefined {
  const normalizedSlug = slug.trim().toLowerCase();
  const guide = allInternalCountryGuides.find((g) => g.slug.toLowerCase() === normalizedSlug);

  if (!guide || guide.editorialStatus !== 'published') {
    return undefined;
  }

  return guide;
}

/**
 * Returns all published country guides offering visa streams under a given category.
 */
export function getGuidesByStream(streamCategory: VisaCategory): CountryVisaGuide[] {
  return getPublishedCountryGuides().filter((guide) =>
    guide.visaStreams.some((stream) => stream.category === streamCategory),
  );
}

/**
 * Returns all published country guides located within a specific global region.
 */
export function getGuidesByRegion(region: string): CountryVisaGuide[] {
  const normalizedRegion = region.trim().toLowerCase();
  return getPublishedCountryGuides().filter(
    (guide) => guide.region.toLowerCase() === normalizedRegion,
  );
}

/**
 * Internal/Admin helper to retrieve country guides.
 * Defaults to published-only unless explicitly requested with includeDrafts: true.
 */
export function getAllCountryGuides(options?: GetAllCountryGuidesOptions): CountryVisaGuide[] {
  if (options?.includeDrafts === true) {
    return [...allInternalCountryGuides];
  }
  return getPublishedCountryGuides();
}

/**
 * Returns all published slug identifiers for Next.js static parameter generation.
 */
export function getPublishedCountrySlugs(): string[] {
  return getPublishedCountryGuides().map((guide) => guide.slug);
}
