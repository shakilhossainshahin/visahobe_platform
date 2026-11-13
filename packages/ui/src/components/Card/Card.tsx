import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type CardVariant = 'default' | 'muted' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant | undefined;
}

const cardVariantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-[#E2E8F0] shadow-sm',
  muted: 'bg-[#F8FAFC] border border-[#E2E8F0]',
  elevated:
    'bg-white border border-[#E2E8F0] shadow-md hover:shadow-lg transition-shadow duration-200',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-2xl text-[#0F172A]', cardVariantStyles[variant], className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export type GlassIntensity = 'subtle' | 'standard' | 'elevated';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: GlassIntensity | undefined;
}

const glassIntensityStyles: Record<GlassIntensity, string> = {
  subtle: 'backdrop-blur-sm bg-white/70 border border-white/40 shadow-sm',
  standard: 'backdrop-blur-md bg-white/85 border border-white/60 shadow-glass',
  elevated: 'backdrop-blur-lg bg-white/90 border border-white/80 shadow-glassElevated',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ intensity = 'standard', className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl text-[#0F172A] overflow-hidden transition-all duration-200',
          // Specular highlight top border
          'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/80 before:z-10',
          glassIntensityStyles[intensity],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={cn('p-6 pb-3 flex flex-col gap-1.5', className)} {...rest}>
      {children}
    </div>
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...rest }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold tracking-tight text-[#0F172A]', className)}
      {...rest}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...rest }, ref) => (
  <p ref={ref} className={cn('text-sm text-[#475569] leading-relaxed', className)} {...rest}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={cn('p-6 pt-3', className)} {...rest}>
      {children}
    </div>
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0 flex items-center justify-between gap-4', className)}
      {...rest}
    >
      {children}
    </div>
  ),
);
CardFooter.displayName = 'CardFooter';
