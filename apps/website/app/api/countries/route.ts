import { getPublishedCountryGuides } from '@visahobe/cms';
import { createLogger } from '@visahobe/core';

const logger = createLogger({ service: 'website-countries-api' });

export async function GET(): Promise<Response> {
  try {
    const guides = getPublishedCountryGuides();

    const countries = guides.map((guide) => {
      const primaryStream = guide.visaStreams[0];
      const primaryFee = guide.officialFeeSummary[0];

      return {
        id: guide.countryCode.toLowerCase(),
        name: guide.countryName,
        code: guide.countryCode,
        slug: guide.slug,
        flag: guide.flagEmoji,
        region: guide.region,
        summary: guide.summary,
        currency: guide.currency,
        primaryVisaStream: primaryStream?.name ?? 'Standard Entry',
        primaryCategory: primaryStream?.category ?? 'Skilled Work',
        processingTime: guide.processingTimeRange || primaryStream?.processingTime || '3-8 Weeks',
        officialPortalUrl: guide.officialPortalUrl,
        officialPortalName: guide.officialPortalName,
        officialFeeText: primaryFee?.governmentFee ?? 'Consular tariff varies by stream',
        baseFeeUSD: 290,
        baseFeeBDT: 290 * 122,
        streamCount: guide.visaStreams.length,
        streams: guide.visaStreams.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          processingTime: s.processingTime,
          minimumFunds: s.minimumFunds,
          keyRequirements: s.keyRequirements,
          highlightTag: s.highlightTag,
        })),
        documentChecklistCount: guide.documentChecklist.length,
        autonomySupport: guide.slug === 'singapore' || guide.slug === 'uae' ? 'Level 3' : 'Level 2',
      };
    });

    return Response.json(
      {
        success: true,
        count: countries.length,
        countries,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error: unknown) {
    logger.error(
      'Failed to fetch country guides',
      error instanceof Error ? error : new Error(String(error)),
    );
    return Response.json(
      {
        success: false,
        error: 'Failed to retrieve sovereign country directory',
      },
      { status: 500 },
    );
  }
}
