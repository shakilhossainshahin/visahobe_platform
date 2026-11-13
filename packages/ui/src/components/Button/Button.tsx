import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  isLoading?: boolean | undefined;
  loadingText?: string | undefined;
  leftIcon?: React.ReactNode | undefined;
  rightIcon?: React.ReactNode | undefined;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0D3B2E] text-white hover:bg-[#092A21] active:bg-[#07211A] shadow-sm border border-[#0D3B2E] focus-visible:ring-[#0D3B2E]',
  secondary:
    'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] focus-visible:ring-[#0D3B2E]',
  glass:
    'backdrop-blur-md bg-white/80 text-[#0D3B2E] border border-white/60 shadow-glass hover:bg-white/95 active:bg-white/70 focus-visible:ring-[#0D3B2E]',
  outline:
    'bg-transparent text-[#0D3B2E] border-2 border-[#0D3B2E] hover:bg-[#F0F7F4] active:bg-[#E3EFEA] focus-visible:ring-[#0D3B2E]',
  ghost:
    'bg-transparent text-[#0D3B2E] hover:bg-[#F0F7F4] active:bg-[#E3EFEA] focus-visible:ring-[#0D3B2E]',
  danger:
    'bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D] shadow-sm border border-[#B91C1C] focus-visible:ring-[#B91C1C]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5 min-h-[32px]',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2 min-h-[40px]',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2.5 min-h-[48px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isEffectivelyDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isEffectivelyDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        aria-disabled={isEffectivelyDisabled ? 'true' : undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          isEffectivelyDisabled && 'opacity-60 cursor-not-allowed pointer-events-none shadow-none',
          className,
        )}
        {...rest}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            data-testid="loading-spinner"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{isLoading && loadingText ? loadingText : children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
