'use client';

import React from 'react';
import { useScrollParallax } from './useScrollParallax.js';
import type { AuroraParallaxBackdropProps } from './types.js';

export const AuroraParallaxBackdrop: React.FC<AuroraParallaxBackdropProps> = ({
  children,
  className = '',
  intensity = 'vibrant',
  showParticles = true,
  dataTestId = 'aurora-parallax-backdrop',
  ...rest
}) => {
  const { parallaxOffset } = useScrollParallax({ speed: 0.12 });
  const { parallaxOffset: deepOffset } = useScrollParallax({ speed: 0.05 });

  const getOpacity = () => {
    switch (intensity) {
      case 'subtle':
        return { emerald: 'opacity-25', gold: 'opacity-20', teal: 'opacity-20' };
      case 'deep':
        return { emerald: 'opacity-50', gold: 'opacity-40', teal: 'opacity-35' };
      case 'vibrant':
      default:
        return { emerald: 'opacity-40', gold: 'opacity-30', teal: 'opacity-30' };
    }
  };

  const opacities = getOpacity();

  return (
    <div
      data-testid={dataTestId}
      className={`relative min-h-screen w-full bg-[#030908] text-slate-100 overflow-x-hidden ${className}`}
      {...rest}
    >
      {/* Fixed Ambient Aurora Lighting Environment */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Layer 1 (Deepest): Volumetric Emerald Light Orb */}
        <div
          className={`absolute -top-40 -left-40 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full blur-[140px] bg-gradient-to-br from-[#0D3B2E] via-[#10B981] to-transparent ${opacities.emerald} transition-transform duration-700 ease-out`}
          style={{
            transform: `translate3d(0, ${(deepOffset * 0.8).toFixed(1)}px, 0)`,
          }}
        />

        {/* Layer 2: Floating Champagne Gold Light Orb */}
        <div
          className={`absolute top-1/4 -right-40 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-[150px] bg-gradient-to-bl from-[#C8A951] via-[#D4AF37] to-transparent ${opacities.gold} transition-transform duration-700 ease-out`}
          style={{
            transform: `translate3d(0, ${(-parallaxOffset * 0.7).toFixed(1)}px, 0)`,
          }}
        />

        {/* Layer 3: Lower Mid-Emerald Glow Core */}
        <div
          className={`absolute bottom-10 left-1/3 w-[600px] h-[600px] rounded-full blur-[160px] bg-gradient-to-tr from-[#092A21] via-[#145342] to-transparent ${opacities.teal} transition-transform duration-700 ease-out`}
          style={{
            transform: `translate3d(0, ${(parallaxOffset * 0.5).toFixed(1)}px, 0)`,
          }}
        />

        {/* Micro-Grid / Star Dust Texture */}
        {showParticles && (
          <div
            className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#C8A951_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />
        )}

        {/* Subtle Horizontal Scanlines / Cosmic Noise Grid */}
        <div
          className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"
          aria-hidden="true"
        />
      </div>

      {/* Foreground Content Surface */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
