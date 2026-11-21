'use client';

import { useState, useEffect } from 'react';

export interface ScrollParallaxOptions {
  speed?: number;
  offset?: number;
}

export function useScrollParallax(options: ScrollParallaxOptions = {}) {
  const { speed = 0.15, offset = 0 } = options;
  const [scrollY, setScrollY] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parallaxOffset = isReducedMotion ? 0 : (scrollY - offset) * speed;

  const style: React.CSSProperties = {
    transform: isReducedMotion ? undefined : `translate3d(0, ${parallaxOffset.toFixed(1)}px, 0)`,
    willChange: isReducedMotion ? undefined : 'transform',
  };

  return { scrollY, parallaxOffset, style, isReducedMotion };
}
