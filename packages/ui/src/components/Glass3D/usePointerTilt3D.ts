'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface PointerTiltOptions {
  tiltIntensity?: number;
  interactive?: boolean;
}

export function usePointerTilt3D(options: PointerTiltOptions = {}) {
  const { tiltIntensity = 12, interactive = true } = options;
  const elementRef = useRef<HTMLDivElement | null>(null);

  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [spotlight, setSpotlight] = useState<{ x: number; y: number; opacity: number }>({
    x: 0,
    y: 0,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || isReducedMotion || !elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // Normalization: -1 to 1 from card center
      const normX = (pointerX / rect.width) * 2 - 1;
      const normY = (pointerY / rect.height) * 2 - 1;

      // Rotate calculations
      const rotateY = normX * tiltIntensity;
      const rotateX = -normY * tiltIntensity;

      setTilt({ rotateX, rotateY });
      setSpotlight({ x: pointerX, y: pointerY, opacity: 1 });
    },
    [interactive, isReducedMotion, tiltIntensity],
  );

  const handlePointerEnter = useCallback(() => {
    if (!interactive || isReducedMotion) return;
    setIsHovered(true);
  }, [interactive, isReducedMotion]);

  const handlePointerLeave = useCallback(() => {
    if (!interactive || isReducedMotion) return;
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  }, [interactive, isReducedMotion]);

  const transformStyle: React.CSSProperties =
    !isReducedMotion && isHovered
      ? {
          transform: `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
          transition: 'transform 0.08s ease-out',
          willChange: 'transform',
        }
      : {
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        };

  const spotlightStyle: React.CSSProperties = {
    background: `radial-gradient(circle 280px at ${spotlight.x}px ${spotlight.y}px, rgba(200, 169, 81, 0.16), transparent 70%)`,
    opacity: spotlight.opacity,
    transition: isHovered ? 'opacity 0.2s ease-in' : 'opacity 0.4s ease-out',
  };

  return {
    ref: elementRef,
    isHovered,
    transformStyle,
    spotlightStyle,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
  };
}
