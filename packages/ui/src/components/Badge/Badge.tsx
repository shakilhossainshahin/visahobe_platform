import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type BadgeVariant =
  'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'glass';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant | undefined;
  size?: BadgeSize | undefined;
  dot?: boolean | undefined;
  dotPulse?: boolean | undefined;
}

const badgeVariantStyles: Record<BadgeVariant, { base: string; dot: string }> = {
  brand: {
    base: 'bg-[#E3EFEA] text-[#0D3B2E] border border-[rgba(13,59,46,0.18)]',
    dot: 'bg-[#0D3B2E]',
  },
  success: {
    base: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
    dot: 'bg-[#15803D]',
  },
  warning: {
    base: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    dot: 'bg-[#B45309]',
  },
  danger: {
    base: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    dot: 'bg-[#B91C1C]',
  },
  info: {
    base: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
    dot: 'bg-[#0369A1]',
  },
  neutral: {
    base: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
    dot: 'bg-[#64748B]',
  },
  glass: {
    base: 'backdrop-blur-md bg-white/80 text-[#0D3B2E] border border-white/60 shadow-sm',
    dot: 'bg-[#0D3B2E]',
  },
};

const badgeSizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-medium rounded-full gap-1.5',
  md: 'px-2.5 py-1 text-xs font-semibold rounded-full gap-2',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = 'brand', size = 'sm', dot = false, dotPulse = false, className, children, ...rest },
    ref,
  ) => {
    const styles = badgeVariantStyles[variant];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans tracking-normal transition-colors select-none',
          styles.base,
          badgeSizeStyles[size],
          className,
        )}
        {...rest}
      >
        {dot && (
          <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden="true">
            {dotPulse && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                  styles.dot,
                )}
              />
            )}
            <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', styles.dot)} />
          </span>
        )}
        <span>{children}</span>
      </span>
    );
  },
);

Badge.displayName = 'Badge';
