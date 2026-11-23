'use client';

import React from 'react';
import type { Glass3DCardProps, GlassGlowColor } from './types.js';

export const Glass3DCard: React.FC<Glass3DCardProps> = ({
  children,
  className = '',
  glowColor = 'azure',
  tiltIntensity: _tiltIntensity = 0,
  specular = true,
  spotlight: _spotlight = false,
  interactive = true,
  blur = true,
  dataTestId = 'glass-3d-card',
  style,
  ...rest
}) => {
  const getGlowBorderClasses = (color: GlassGlowColor) => {
    switch (color) {
      case 'azure':
        return 'hover:border-[#0284C7]/60 hover:shadow-[0_16px_36px_-8px_rgba(2,132,199,0.18)]';
      case 'coral':
        return 'hover:border-[#F97316]/60 hover:shadow-[0_16px_36px_-8px_rgba(249,115,22,0.18)]';
      case 'gold':
        return 'hover:border-[#C8A951]/60 hover:shadow-[0_16px_36px_-8px_rgba(200,169,81,0.22)]';
      case 'emerald':
        return 'hover:border-[#0D9488]/60 hover:shadow-[0_16px_36px_-8px_rgba(13,148,136,0.22)]';
      case 'amber':
        return 'hover:border-amber-400/60 hover:shadow-[0_16px_36px_-8px_rgba(245,158,11,0.22)]';
      case 'neutral':
      default:
        return 'hover:border-slate-300 hover:shadow-[0_16px_36px_-8px_rgba(15,23,42,0.10)]';
    }
  };

  const blurClass = blur ? 'backdrop-blur-2xl' : 'backdrop-filter-none';

  return (
    <div
      data-testid={dataTestId}
      className={`group relative rounded-2xl transition-all duration-300 ease-out ${
        interactive ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
      style={style}
      {...rest}
    >
      {/* Crisp Translucent Glass Shell */}
      <div
        className={`relative h-full w-full rounded-2xl overflow-hidden ${blurClass} bg-white/85 border border-white/60 shadow-lg dark:bg-[#061812]/50 dark:border-white/15 transition-all duration-300 ${getGlowBorderClasses(
          glowColor,
        )} ${className}`}
      >
        {/* Top-Edge Specular Light Reflection Border (Hairline Gradient) */}
        {specular && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-75 group-hover:opacity-100 group-hover:via-[#0284C7]/40 transition-all duration-500"
            aria-hidden="true"
          />
        )}

        {/* Ambient Bottom Accent Line */}
        <div
          className="pointer-events-none absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#0284C7]/15 to-transparent"
          aria-hidden="true"
        />

        {/* Card Content Surface */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
};
