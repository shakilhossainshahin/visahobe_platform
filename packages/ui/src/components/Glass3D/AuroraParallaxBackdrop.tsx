'use client';

import React from 'react';
import { useScrollParallax } from './useScrollParallax.js';
import type { AuroraParallaxBackdropProps } from './types.js';

export const AuroraParallaxBackdrop: React.FC<AuroraParallaxBackdropProps> = ({
  children,
  className = '',
  intensity = 'vibrant',
  variant = 'travel',
  showParticles = true,
  dataTestId = 'aurora-parallax-backdrop',
  ...rest
}) => {
  const { parallaxOffset } = useScrollParallax({ speed: 0.12 });
  const { parallaxOffset: deepOffset } = useScrollParallax({ speed: 0.05 });

  const isDark = variant === 'dark';

  const getOpacity = () => {
    switch (intensity) {
      case 'subtle':
        return isDark
          ? { primary: 'opacity-25', secondary: 'opacity-20', tertiary: 'opacity-20' }
          : { primary: 'opacity-15', secondary: 'opacity-10', tertiary: 'opacity-10' };
      case 'deep':
        return isDark
          ? { primary: 'opacity-50', secondary: 'opacity-40', tertiary: 'opacity-35' }
          : { primary: 'opacity-30', secondary: 'opacity-25', tertiary: 'opacity-20' };
      case 'vibrant':
      default:
        return isDark
          ? { primary: 'opacity-40', secondary: 'opacity-30', tertiary: 'opacity-30' }
          : { primary: 'opacity-25', secondary: 'opacity-20', tertiary: 'opacity-15' };
    }
  };

  const opacities = getOpacity();

  return (
    <div
      data-testid={dataTestId}
      className={`relative min-h-screen w-full overflow-x-hidden ${
        isDark
          ? 'bg-[#030908] text-slate-100'
          : 'bg-gradient-to-b from-[#F0F9FF] via-[#F8FAFC] to-white text-[#0F172A]'
      } ${className}`}
      {...rest}
    >
      {/* Fixed Ambient Lighting Environment */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Layer 1 (Deepest): Volumetric Primary Light Orb */}
        <div
          className={`absolute -top-40 -left-40 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full blur-[140px] transition-transform duration-700 ease-out ${
            isDark
              ? `bg-gradient-to-br from-[#0D3B2E] via-[#10B981] to-transparent ${opacities.primary}`
              : `bg-gradient-to-br from-[#0284C7] via-[#38BDF8] to-transparent ${opacities.primary}`
          }`}
          style={{
            transform: `translate3d(0, ${(deepOffset * 0.8).toFixed(1)}px, 0)`,
          }}
        />

        {/* Layer 2: Floating Secondary Light Orb */}
        <div
          className={`absolute top-1/4 -right-40 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-[150px] transition-transform duration-700 ease-out ${
            isDark
              ? `bg-gradient-to-bl from-[#C8A951] via-[#D4AF37] to-transparent ${opacities.secondary}`
              : `bg-gradient-to-bl from-[#F97316] via-[#F59E0B] to-transparent ${opacities.secondary}`
          }`}
          style={{
            transform: `translate3d(0, ${(-parallaxOffset * 0.7).toFixed(1)}px, 0)`,
          }}
        />

        {/* Layer 3: Lower Tertiary Glow Core */}
        <div
          className={`absolute bottom-10 left-1/3 w-[600px] h-[600px] rounded-full blur-[160px] transition-transform duration-700 ease-out ${
            isDark
              ? `bg-gradient-to-tr from-[#092A21] via-[#145342] to-transparent ${opacities.tertiary}`
              : `bg-gradient-to-tr from-[#0D9488] via-[#14B8A6] to-transparent ${opacities.tertiary}`
          }`}
          style={{
            transform: `translate3d(0, ${(parallaxOffset * 0.5).toFixed(1)}px, 0)`,
          }}
        />

        {/* Micro-Grid / Flight Path Matrix */}
        {showParticles && (
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'opacity-[0.04] bg-[radial-gradient(#C8A951_1px,transparent_1px)]'
                : 'opacity-[0.05] bg-[radial-gradient(#0284C7_1px,transparent_1px)]'
            } [background-size:24px_24px]`}
            aria-hidden="true"
          />
        )}

        {/* Fine Noise / Scanline Grid */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? 'opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]'
              : 'opacity-[0.03] bg-[linear-gradient(to_right,#0284C7_1px,transparent_1px),linear-gradient(to_bottom,#0284C7_1px,transparent_1px)]'
          } bg-[size:4rem_4rem]`}
          aria-hidden="true"
        />
      </div>

      {/* Foreground Content Surface */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
