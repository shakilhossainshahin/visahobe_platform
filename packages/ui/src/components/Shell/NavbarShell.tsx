'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Container } from '../Layout/Container.js';

export interface NavLinkItem {
  label: string;
  href: string;
  active?: boolean | undefined;
}

export interface NavbarShellProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode | undefined;
  navLinks?: NavLinkItem[] | React.ReactNode | undefined;
  actions?: React.ReactNode | undefined;
  variant?: 'glass' | 'solid' | undefined;
  isSticky?: boolean | undefined;
}

export const NavbarShell = forwardRef<HTMLElement, NavbarShellProps>(
  (
    { brand, navLinks, actions, variant = 'glass', isSticky = true, className, children, ...rest },
    ref,
  ) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const isGlass = variant === 'glass';

    return (
      <header
        ref={ref}
        className={cn(
          'w-full transition-all duration-200 z-50',
          isSticky && 'sticky top-0',
          isGlass &&
            'backdrop-blur-md bg-white/85 border-b border-white/60 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/80',
          !isGlass && 'bg-white border-b border-[#E2E8F0] shadow-sm',
          className,
        )}
        {...rest}
      >
        <Container size="2xl">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Brand Logo slot */}
            <div className="flex items-center shrink-0">
              {brand || (
                <a
                  href="/"
                  className="flex items-center gap-2 font-display text-xl font-bold text-[#0D3B2E]"
                >
                  <span>VisaHobe</span>
                  <span className="h-2 w-2 rounded-full bg-[#16654F]" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-1 lg:gap-2"
            >
              {Array.isArray(navLinks)
                ? navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      aria-current={link.active ? 'page' : undefined}
                      className={cn(
                        'px-3.5 py-2 text-sm font-medium rounded-xl transition-colors duration-150',
                        link.active
                          ? 'text-[#0D3B2E] bg-[#E3EFEA] font-semibold'
                          : 'text-[#475569] hover:text-[#0D3B2E] hover:bg-[#F0F7F4]',
                      )}
                    >
                      {link.label}
                    </a>
                  ))
                : navLinks}
            </nav>

            {/* Action Buttons slot (CTA, Language, Login) */}
            <div className="hidden md:flex items-center gap-3">{actions}</div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-xl text-[#475569] hover:text-[#0D3B2E] hover:bg-[#F0F7F4] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileOpen && (
            <div className="md:hidden py-4 border-t border-[#E2E8F0] flex flex-col gap-3">
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
                {Array.isArray(navLinks) &&
                  navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      aria-current={link.active ? 'page' : undefined}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg',
                        link.active
                          ? 'text-[#0D3B2E] bg-[#E3EFEA] font-semibold'
                          : 'text-[#475569] hover:text-[#0D3B2E] hover:bg-[#F0F7F4]',
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
              </nav>
              {actions && (
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">{actions}</div>
              )}
            </div>
          )}

          {children}
        </Container>
      </header>
    );
  },
);

NavbarShell.displayName = 'NavbarShell';
