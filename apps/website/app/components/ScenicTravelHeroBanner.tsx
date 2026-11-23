'use client';

import React, { useState, useEffect } from 'react';

export interface ScenicDestinationSlide {
  id: string;
  name: string;
  country: string;
  flag: string;
  badge: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  accentColor: string;
}

export const SCENIC_SLIDES: ScenicDestinationSlide[] = [
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    badge: 'MOM e-Visa • COMPASS Points Matrix',
    headline: 'Marina Bay Sands & Smart City-State',
    subheadline: 'Priority Autonomous e-Visa lodging in 3–8 weeks with S$360 MOM official fee.',
    imageUrl:
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#0284C7',
  },
  {
    id: 'uae',
    name: 'Dubai & Abu Dhabi',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    badge: '10-Year Golden Visa • ICP Fast-Track',
    headline: 'Sovereign Luxury & Future Innovation',
    subheadline: 'Instant consular clearance with zero income tax and premier residency rights.',
    imageUrl:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#F97316',
  },
  {
    id: 'uk',
    name: 'London & Oxford',
    country: 'United Kingdom',
    flag: '🇬🇧',
    badge: 'UKVI Skilled Worker & Global Talent',
    headline: 'Historic Tower Bridge & Tech Hubs',
    subheadline: 'Pre-vetted CoS sponsorships and dual accredited counsel compliance review.',
    imageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#C8A951',
  },
  {
    id: 'germany',
    name: 'Bavaria & Berlin',
    country: 'Germany / Schengen',
    flag: '🇩🇪',
    badge: 'Chancenkarte • Opportunity Card & EU Blue Card',
    headline: 'Bavarian Castles & European Mobility',
    subheadline:
      'Anabin H+ verified qualifications for unrestricted movement across 29 Schengen states.',
    imageUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#0D9488',
  },
  {
    id: 'australia',
    name: 'Sydney & Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
    badge: 'Subclass 189 / 190 • SkillSelect PR',
    headline: 'Sydney Harbour & Pristine Coastlines',
    subheadline: 'Permanent residency points optimization and credential translation.',
    imageUrl:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#0284C7',
  },
];

export interface ScenicTravelHeroBannerProps {
  onSelectDestination?: (destinationId: string) => void;
  selectedDestinationId?: string;
  className?: string;
}

export function ScenicTravelHeroBanner({
  onSelectDestination,
  selectedDestinationId = 'singapore',
  className = '',
}: ScenicTravelHeroBannerProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // Sync slide when selectedDestinationId prop updates
  useEffect(() => {
    const foundIdx = SCENIC_SLIDES.findIndex((s) => s.id === selectedDestinationId);
    if (foundIdx !== -1 && foundIdx !== currentIdx) {
      setCurrentIdx(foundIdx);
    }
  }, [selectedDestinationId]);

  // Auto-advance banner carousel every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SCENIC_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = SCENIC_SLIDES[currentIdx]!;

  const handleChipClick = (id: string, idx: number) => {
    setCurrentIdx(idx);
    onSelectDestination?.(id);
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-slate-900 ${className}`}
      data-testid="scenic-travel-hero-banner"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes kenBurnsSlow {
          0% { transform: scale(1.0) translate(0%, 0%); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1.0) translate(0%, 0%); }
        }
        .kenburns-active {
          animation: kenBurnsSlow 18s ease-in-out infinite alternate;
        }
      `,
        }}
      />

      {/* Background Image Carousel with Ken Burns Zoom */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] overflow-hidden">
        {SCENIC_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={`${slide.name} - ${slide.headline}`}
                className={`w-full h-full object-cover ${isActive ? 'kenburns-active' : ''}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              {/* Vibrant Multi-Stop Gradient Overlays for High-Contrast Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/30 to-transparent" />
            </div>
          );
        })}

        {/* Top Floating Live Trust Badges */}
        <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 z-20 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-md flex items-center gap-2">
              <span className="text-amber-500 font-bold text-xs">★ 4.9/5</span>
              <span className="text-xs font-semibold text-[#0F172A]">12,400+ Global Travelers</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0284C7]/90 text-white text-xs font-semibold shadow-md backdrop-blur-md">
              <span>✈</span>
              <span>Dhaka to 65+ Consular Corridors</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/90 text-white text-xs font-bold shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>99.4% AI-Scored Visa Approval Rate</span>
          </div>
        </div>

        {/* Bottom Banner Content Area */}
        <div className="absolute bottom-4 sm:bottom-8 inset-x-4 sm:inset-x-8 z-20 flex flex-col gap-4 text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-2">
              <span>{activeSlide.flag}</span>
              <span>{activeSlide.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-tight drop-shadow-md">
              {activeSlide.headline}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 mt-1 sm:mt-2 max-w-xl line-clamp-2 drop-shadow-sm font-medium">
              {activeSlide.subheadline}
            </p>
          </div>

          {/* Popular Visa Quick-Select Route Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Popular Routes:
            </span>
            {SCENIC_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleChipClick(slide.id, idx)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  idx === currentIdx
                    ? 'bg-white text-[#0F172A] border-white shadow-lg scale-105'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
                aria-pressed={idx === currentIdx}
              >
                <span>{slide.flag}</span>
                <span>{slide.name}</span>
              </button>
            ))}
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 mt-1">
            {SCENIC_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleChipClick(slide.id, idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIdx ? 'w-8 bg-[#C8A951]' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${slide.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
