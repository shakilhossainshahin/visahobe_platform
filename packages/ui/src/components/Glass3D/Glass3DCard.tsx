'use client';

import React from 'react';
import { usePointerTilt3D } from './usePointerTilt3D.js';
import type { Glass3DCardProps, GlassGlowColor } from './types.js';

export const Glass3DCard: React.FC<Glass3DCardProps> = ({
  children,
  className = '',
  glowColor = 'gold',
  tiltIntensity = 12,
  specular = true,
  spotlight = true,
  interactive = true,
  blur = true,
  dataTestId = 'glass-3d-card',
  style,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  ...rest
}) => {
  const {
    ref,
    transformStyle,
    spotlightStyle,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
  } = usePointerTilt3D({ tiltIntensity, interactive });

  const getGlowBorderClasses = (color: GlassGlowColor) => {
    switch (color) {
      case 'gold':
        return 'hover:border-[#C8A951]/60 hover:shadow-[0_12px_40px_-10px_rgba(200,169,81,0.22)]';
      case 'emerald':
        return 'hover:border-[#10B981]/60 hover:shadow-[0_12px_40px_-10px_rgba(16,185,129,0.25)]';
      case 'amber':
        return 'hover:border-amber-400/60 hover:shadow-[0_12px_40px_-10px_rgba(245,158,11,0.25)]';
      case 'neutral':
      default:
        return 'hover:border-white/40 hover:shadow-[0_12px_40px_-10px_rgba(255,255,255,0.15)]';
    }
  };

  const blurClass = blur ? 'backdrop-blur-2xl' : 'backdrop-filter-none';

  return (
    <div
      ref={ref}
      data-testid={dataTestId}
      className={`group relative rounded-2xl transition-all duration-300 ${interactive ? 'cursor-pointer' : ''}`}
      style={{
        ...transformStyle,
        ...style,
      }}
      onPointerMove={(e) => {
        handlePointerMove(e);
        onPointerMove?.(e);
      }}
      onPointerEnter={(e) => {
        handlePointerEnter();
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        handlePointerLeave();
        onPointerLeave?.(e);
      }}
      {...rest}
    >
      {/* Multi-layer Frosted Glass Shell */}
      <div
        className={`relative h-full w-full rounded-2xl overflow-hidden ${blurClass} bg-white/[0.04] dark:bg-[#061812]/50 border border-white/15 transition-all duration-300 ${getGlowBorderClasses(glowColor)} ${className}`}
      >
        {/* Top-Edge Specular Light Reflection Border (Hairline Gradient) */}
        {specular && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-75 group-hover:opacity-100 group-hover:via-[#C8A951] transition-all duration-500"
            aria-hidden="true"
          />
        )}

        {/* Dynamic Cursor-Tracking Radial Spotlight Sheen */}
        {spotlight && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={spotlightStyle}
            aria-hidden="true"
          />
        )}

        {/* Subtle Ambient Bottom Accent Line */}
        <div
          className="pointer-events-none absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8A951]/20 to-transparent"
          aria-hidden="true"
        />

        {/* Card Content Surface */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
};
