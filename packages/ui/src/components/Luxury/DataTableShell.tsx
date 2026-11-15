import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export interface DataTableShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode | undefined;
  description?: React.ReactNode | undefined;
  toolbar?: React.ReactNode | undefined;
  footer?: React.ReactNode | undefined;
  goldAccentBar?: boolean | undefined;
}

/**
 * DataTableShell
 *
 * Strictly enforces ADR-009 High-Contrast Solid Table Rule:
 * - Solid #FFFFFF background (bg-white) with zero backdrop-blur
 * - Crisp 1px border (#E2E8F0) and Deep Emerald (#0D3B2E) header readiness
 * - Optional Champagne Gold (#C8A951) executive accent divider
 */
export const DataTableShell = forwardRef<HTMLDivElement, DataTableShellProps>(
  (
    { title, description, toolbar, footer, goldAccentBar = true, className, children, ...rest },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden text-[#111827]',
          className,
        )}
        {...rest}
      >
        {goldAccentBar && (
          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-gradient-to-r from-[#0D3B2E] via-[#C8A951] to-[#0D3B2E]"
          />
        )}

        {(title || description || toolbar) && (
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-base font-bold text-[#111827] tracking-tight">{title}</h2>
              )}
              {description && <p className="text-xs text-[#64748B] mt-0.5">{description}</p>}
            </div>
            {toolbar && <div className="flex flex-wrap items-center gap-2.5">{toolbar}</div>}
          </div>
        )}

        <div className="overflow-x-auto bg-white">{children}</div>

        {footer && (
          <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#475569] flex flex-wrap items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

DataTableShell.displayName = 'DataTableShell';
