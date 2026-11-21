'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ScrollReveal3DProps } from './types.js';

export const ScrollReveal3D: React.FC<ScrollReveal3DProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  dataTestId = 'scroll-reveal-3d',
  style,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsVisible(true);
        return;
      }
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getInitialTransform = () => {
    if (isReducedMotion) return 'none';
    switch (direction) {
      case 'down':
        return 'perspective(1000px) rotateX(-12deg) translate3d(0, -40px, -20px)';
      case 'left':
        return 'perspective(1000px) rotateY(12deg) translate3d(-40px, 0, -20px)';
      case 'right':
        return 'perspective(1000px) rotateY(-12deg) translate3d(40px, 0, -20px)';
      case 'zoom':
        return 'perspective(1000px) scale3d(0.92, 0.92, 0.92) translate3d(0, 20px, -40px)';
      case 'up':
      default:
        return 'perspective(1000px) rotateX(12deg) translate3d(0, 40px, -20px)';
    }
  };

  const dynamicStyle: React.CSSProperties = isVisible
    ? {
        opacity: 1,
        transform:
          'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: 'opacity, transform',
        ...style,
      }
    : {
        opacity: 0,
        transform: getInitialTransform(),
        ...style,
      };

  return (
    <div
      ref={ref}
      data-testid={dataTestId}
      className={`w-full ${className}`}
      style={dynamicStyle}
      {...rest}
    >
      {children}
    </div>
  );
};
