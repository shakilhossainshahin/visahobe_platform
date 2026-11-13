import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | undefined;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id: customId,
      label,
      helperText,
      errorMessage,
      required,
      disabled,
      rows = 4,
      className,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = errorMessage ? `${textareaId}-error` : undefined;

    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={errorMessage ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required ? 'true' : undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8]',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 resize-y min-h-[80px]',
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
        />

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

Textarea.displayName = 'Textarea';
