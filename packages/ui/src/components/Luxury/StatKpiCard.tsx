import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type StatKpiVariant = 'glass' | 'solid' | 'emerald';

export interface StatKpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  subvalue?: React.ReactNode | undefined;
  trend?:
    | {
        label: string;
        direction?: 'up' | 'down' | 'neutral' | undefined;
      }
    | undefined;
  badge?: React.ReactNode | undefined;
  icon?: React.ReactNode | undefined;
  variant?: StatKpiVariant | undefined;
  goldDivider?: boolean | undefined;
}

const variantClasses: Record<StatKpiVariant, string> = {
  glass:
    'backdrop-blur-md bg-white/85 border border-[#C8A951]/35 shadow-glass text-[#111827] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/80',
  solid: 'bg-white border border-[#E2E8F0] shadow-xs text-[#111827]',
  emerald: 'bg-[#0D3B2E] border border-[#C8A951]/50 shadow-md text-white',
};

export const StatKpiCard = forwardRef<HTMLDivElement, StatKpiCardProps>(
  (
    {
      label,
      value,
      subvalue,
      trend,
      badge,
      icon,
      variant = 'glass',
      goldDivider = true,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isEmerald = variant === 'emerald';

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl p-5 overflow-hidden transition-all duration-200',
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        {goldDivider && (
          <div
            aria-hidden="true"
            className="h-[2px] w-10 rounded-full bg-gradient-to-r from-[#C8A951] to-[#C8A951]/30 mb-3"
          />
        )}

        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isEmerald ? 'text-[#E3EFEA]/85' : 'text-[#64748B]',
            )}
          >
            {label}
          </p>
          {icon && (
            <span
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold shrink-0',
                isEmerald
                  ? 'bg-white/10 text-[#C8A951] border border-[#C8A951]/30'
                  : 'bg-[#F0F7F4] text-[#0D3B2E] border border-[#0D3B2E]/10',
              )}
            >
              {icon}
            </span>
          )}
          {!icon && badge && <div className="shrink-0">{badge}</div>}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'text-2xl sm:text-3xl font-extrabold tracking-tight',
              isEmerald ? 'text-white' : 'text-[#111827]',
            )}
          >
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                trend.direction === 'up' &&
                  (isEmerald
                    ? 'bg-[#15803D]/30 text-[#86EFAC] border border-[#86EFAC]/30'
                    : 'bg-[#DCFCE7] text-[#15803D]'),
                trend.direction === 'down' &&
                  (isEmerald
                    ? 'bg-[#B91C1C]/30 text-[#FECACA] border border-[#FECACA]/30'
                    : 'bg-[#FEE2E2] text-[#B91C1C]'),
                (!trend.direction || trend.direction === 'neutral') &&
                  (isEmerald ? 'bg-white/10 text-[#C8A951]' : 'bg-[#F0F7F4] text-[#0D3B2E]'),
              )}
            >
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              <span>{trend.label}</span>
            </span>
          )}
        </div>

        {subvalue && (
          <div className={cn('mt-1.5 text-xs', isEmerald ? 'text-[#E3EFEA]/80' : 'text-[#475569]')}>
            {subvalue}
          </div>
        )}

        {children}
      </div>
    );
  },
);

StatKpiCard.displayName = 'StatKpiCard';
