import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
  prefixIcon?: React.ReactNode | undefined;
  suffixIcon?: React.ReactNode | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: customId,
      label,
      helperText,
      errorMessage,
      prefixIcon,
      suffixIcon,
      required,
      disabled,
      className,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = errorMessage ? `${inputId}-error` : undefined;

    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-[#0F172A] select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && (
              <span className="text-[#B91C1C]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              {prefixIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={errorMessage ? 'true' : undefined}
            aria-describedby={describedBy}
            aria-required={required ? 'true' : undefined}
            className={cn(
              'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8]',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              // Normal state
              !errorMessage &&
                'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#0D3B2E] focus:ring-[#0D3B2E]',
              // Error state
              errorMessage &&
                'border-[#B91C1C] text-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
              // Icon paddings
              prefixIcon ? 'pl-10' : 'pl-3.5',
              suffixIcon ? 'pr-10' : 'pr-3.5',
              // Disabled state
              disabled && 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed',
              className,
            )}
            {...rest}
          />

          {suffixIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              {suffixIcon}
            </div>
          )}
        </div>

        {errorMessage && (
          <p id={errorId} role="alert" className="text-xs text-[#B91C1C] font-medium leading-none">
            {errorMessage}
          </p>
        )}

        {!errorMessage && helperText && (
          <p id={helperId} className="text-xs text-[#475569] leading-none">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
