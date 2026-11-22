'use client';

import React from 'react';
import { useScrollParallax } from './useScrollParallax.js';
import type { ParallaxLayerProps } from './types.js';

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  className = '',
  speed = 0.1,
  zOffset = 0,
  dataTestId = 'parallax-layer',
  style,
  ...rest
}) => {
  const { parallaxOffset, isReducedMotion } = useScrollParallax({ speed });

  const transform = isReducedMotion
    ? undefined
    : `translate3d(0, ${parallaxOffset.toFixed(1)}px, ${zOffset}px)`;

  return (
    <div
      data-testid={dataTestId}
      className={`relative w-full ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
