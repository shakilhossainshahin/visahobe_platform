import { singaporeGuide } from './singapore.js';
import { germanyGuide } from './germany.js';
import { unitedKingdomGuide } from './united-kingdom.js';
import { canadaGuide } from './canada.js';
import { australiaGuide } from './australia.js';
import { uaeGuide } from './uae.js';
import { newZealandDraftGuide, japanInReviewGuide } from './draft-fixtures.js';
import type { CountryVisaGuide } from '../../types/country.js';

export {
  singaporeGuide,
  germanyGuide,
  unitedKingdomGuide,
  canadaGuide,
  australiaGuide,
  uaeGuide,
  newZealandDraftGuide,
  japanInReviewGuide,
};

/**
 * Authoritative list of launch destination guides (all published).
 */
export const launchCountryGuides: CountryVisaGuide[] = [
  singaporeGuide,
  germanyGuide,
  unitedKingdomGuide,
  canadaGuide,
  australiaGuide,
  uaeGuide,
];

/**
 * Complete internal country guide registry including drafts and in-review packages.
 */
export const allInternalCountryGuides: CountryVisaGuide[] = [
  ...launchCountryGuides,
  newZealandDraftGuide,
  japanInReviewGuide,
];
