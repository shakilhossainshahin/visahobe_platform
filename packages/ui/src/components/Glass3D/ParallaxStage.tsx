'use client';

import React from 'react';
import { useScrollParallax } from './useScrollParallax.js';
import type { ParallaxStageProps } from './types.js';

export const ParallaxStage: React.FC<ParallaxStageProps> = ({
  children,
  className = '',
  perspective = 1200,
  depthSpeed = 0.08,
  dataTestId = 'parallax-stage',
  style,
  ...rest
}) => {
  const { parallaxOffset, isReducedMotion } = useScrollParallax({ speed: depthSpeed });

  return (
    <div
      data-testid={dataTestId}
      className={`relative w-full overflow-visible ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      {...rest}
    >
      <div
        className="w-full transition-transform duration-500 ease-out"
        style={{
          transform: isReducedMotion
            ? undefined
            : `translate3d(0, ${parallaxOffset.toFixed(1)}px, 0)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
};
