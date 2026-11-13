import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { Container } from '../Layout/Container.js';

export interface FooterColumnLink {
  label: string;
  href: string;
  external?: boolean | undefined;
}

export interface FooterColumn {
  title: string;
  links: FooterColumnLink[];
}

export interface FooterShellProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode | undefined;
  brandDescription?: string | undefined;
  columns?: FooterColumn[] | undefined;
  disclaimer?: string | React.ReactNode | undefined;
  copyright?: string | undefined;
  bottomLinks?: Array<{ label: string; href: string }> | undefined;
}

export const FooterShell = forwardRef<HTMLElement, FooterShellProps>(
  (
    {
      brand,
      brandDescription,
      columns = [],
      disclaimer,
      copyright = `© ${new Date().getFullYear()} VisaHobe. All rights reserved.`,
      bottomLinks = [],
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <footer
        ref={ref}
        className={cn('w-full bg-[#F8FAFC] border-t border-[#E2E8F0] text-[#0F172A]', className)}
        {...rest}
      >
        <Container size="2xl" className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="md:col-span-4 flex flex-col gap-4">
              {brand || (
                <div className="flex items-center gap-2 font-display text-xl font-bold text-[#0D3B2E]">
                  <span>VisaHobe</span>
                  <span className="h-2 w-2 rounded-full bg-[#16654F]" aria-hidden="true" />
                </div>
              )}
              {brandDescription && (
                <p className="text-sm text-[#475569] leading-relaxed max-w-sm">
                  {brandDescription}
                </p>
              )}
            </div>

            {/* Link Columns */}
            {columns.length > 0 && (
              <div
                className={cn(
                  'md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8',
                  columns.length === 4 && 'sm:grid-cols-4',
                )}
              >
                {columns.map((col) => (
                  <div key={col.title} className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                      {col.title}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {col.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            className="text-sm text-[#475569] hover:text-[#0D3B2E] transition-colors duration-150"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal Disclaimer Box */}
          {disclaimer && (
            <div className="mt-12 pt-6 border-t border-[#E2E8F0]">
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#64748B] leading-relaxed">
                {typeof disclaimer === 'string' ? <p>{disclaimer}</p> : disclaimer}
              </div>
            </div>
          )}

          {/* Bottom Bar: Copyright & Legal links */}
          <div className="mt-8 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>{copyright}</div>
            {bottomLinks.length > 0 && (
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                {bottomLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="hover:text-[#0D3B2E] transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {children}
        </Container>
      </footer>
    );
  },
);

FooterShell.displayName = 'FooterShell';
