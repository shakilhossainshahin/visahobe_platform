import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type SectionVariant = 'default' | 'muted' | 'brand' | 'glass';
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article' | 'header' | 'footer' | undefined;
  variant?: SectionVariant | undefined;
  padding?: SectionPadding | undefined;
}

const sectionVariants: Record<SectionVariant, string> = {
  default: 'bg-white text-[#0F172A]',
  muted: 'bg-[#F8FAFC] text-[#0F172A]',
  brand: 'bg-[#0D3B2E] text-white',
  glass: 'backdrop-blur-md bg-white/80 border-y border-white/60 text-[#0F172A]',
};

const sectionPaddings: Record<SectionPadding, string> = {
  none: 'py-0',
  sm: 'py-6 sm:py-8',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
  xl: 'py-20 sm:py-32',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      as: Component = 'section',
      variant = 'default',
      padding = 'md',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          'w-full relative',
          sectionVariants[variant],
          sectionPaddings[padding],
          className,
        ),
        ...rest,
      },
      children,
    );
  },
);

Section.displayName = 'Section';
