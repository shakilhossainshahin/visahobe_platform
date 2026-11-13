import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | undefined;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
  options?: SelectOption[] | undefined;
  placeholder?: string | undefined;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id: customId,
      label,
      helperText,
      errorMessage,
      options = [],
      placeholder,
      required,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const errorId = errorMessage ? `${selectId}-error` : undefined;

    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={errorMessage ? 'true' : undefined}
            aria-describedby={describedBy}
            aria-required={required ? 'true' : undefined}
            className={cn(
              'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A]',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              // Normal state
              !errorMessage &&
                'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#0D3B2E] focus:ring-[#0D3B2E]',
              // Error state
              errorMessage && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
              // Disabled state
              disabled && 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed',
              className,
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          {/* Chevron Icon */}
          <div className="pointer-events-none absolute right-3.5 flex items-center text-[#64748B]">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select';
