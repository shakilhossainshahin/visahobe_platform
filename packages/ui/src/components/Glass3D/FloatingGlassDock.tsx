'use client';

import React from 'react';
import type { FloatingGlassDockProps } from './types.js';

export const FloatingGlassDock: React.FC<FloatingGlassDockProps> = ({
  items,
  className = '',
  position = 'floating',
  blur = true,
  dataTestId = 'floating-glass-dock',
  ...rest
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'fixed bottom-4 inset-x-0 mx-auto z-40 max-w-fit px-4';
      case 'top':
        return 'sticky top-4 z-40 mx-auto max-w-fit px-4';
      case 'floating':
      default:
        return 'fixed bottom-6 inset-x-0 mx-auto z-40 max-w-fit px-4';
    }
  };

  const blurClass = blur ? 'backdrop-blur-2xl' : 'backdrop-filter-none';

  return (
    <nav
      data-testid={dataTestId}
      aria-label="Floating Glass Dock"
      className={`${getPositionClasses()} transition-all duration-300`}
      {...rest}
    >
      <div
        className={`relative flex items-center gap-1.5 p-1.5 sm:gap-2 sm:p-2 rounded-2xl ${blurClass} bg-[#092A21]/70 dark:bg-[#041611]/80 border border-[#C8A951]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(200,169,81,0.12)] text-white ${className}`}
      >
        {/* Top-Edge Specular Highlight */}
        <div
          className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8A951]/70 to-transparent"
          aria-hidden="true"
        />

        {items.map((item) => {
          const content = (
            <div
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group ${
                item.active
                  ? 'bg-gradient-to-r from-[#0D3B2E] to-[#145342] text-white font-semibold shadow-inner border border-[#C8A951]/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon && (
                <span
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    item.active ? 'text-[#C8A951]' : 'text-white/70 group-hover:text-[#C8A951]'
                  }`}
                >
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#C8A951] text-[#0D3B2E]">
                  {item.badge}
                </span>
              )}
              {item.active && (
                <span
                  className="absolute bottom-1 inset-x-4 h-[2px] rounded-full bg-[#C8A951] shadow-[0_0_8px_#C8A951]"
                  aria-hidden="true"
                />
              )}
            </div>
          );

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={item.onClick}
                className="focus:outline-hidden focus:ring-2 focus:ring-[#C8A951] rounded-xl"
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="focus:outline-hidden focus:ring-2 focus:ring-[#C8A951] rounded-xl"
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
