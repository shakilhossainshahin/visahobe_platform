import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type StepProgressStatus = 'completed' | 'current' | 'upcoming';

export interface StepProgressItem {
  id: string;
  label: string;
  description?: string | undefined;
  status: StepProgressStatus;
  timestamp?: string | undefined;
  meta?: string | undefined;
}

export interface StepProgressRailProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepProgressItem[];
  activeStepId?: string | undefined;
  onStepSelect?: ((stepId: string, index: number) => void) | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
}

export const StepProgressRail = forwardRef<HTMLDivElement, StepProgressRailProps>(
  ({ steps, activeStepId, onStepSelect, orientation = 'horizontal', className, ...rest }, ref) => {
    const isVertical = orientation === 'vertical';

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Application Progress Tracker"
        className={cn('w-full', className)}
        {...rest}
      >
        <ol
          className={cn(
            'grid gap-3',
            isVertical ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
          )}
        >
          {steps.map((step, index) => {
            const isSelected = activeStepId ? activeStepId === step.id : step.status === 'current';
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            const commonClasses = cn(
              'relative flex flex-col justify-between rounded-xl p-3.5 text-left border transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3B2E] focus-visible:ring-offset-2',
              isCompleted && 'bg-[#F0F7F4] border-[#0D3B2E]/25 text-[#111827]',
              isCurrent &&
                'bg-[#0D3B2E] border-[#C8A951] text-white shadow-sm ring-1 ring-[#C8A951]/50',
              step.status === 'upcoming' && 'bg-white border-[#E2E8F0] text-[#64748B]',
              isSelected && !isCurrent && 'ring-2 ring-[#C8A951] border-[#C8A951]',
              onStepSelect && 'cursor-pointer hover:border-[#C8A951]',
            );

            const content = (
              <>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      isCompleted && 'bg-[#0D3B2E] text-white',
                      isCurrent && 'bg-[#C8A951] text-[#111827]',
                      step.status === 'upcoming' && 'bg-[#F1F5F9] text-[#64748B]',
                    )}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  {step.timestamp && (
                    <span
                      className={cn(
                        'font-mono text-[10px]',
                        isCurrent ? 'text-[#C8A951]' : 'text-[#64748B]',
                      )}
                    >
                      {step.timestamp}
                    </span>
                  )}
                </div>

                <div>
                  <p
                    className={cn(
                      'text-xs font-bold tracking-tight',
                      isCurrent ? 'text-white' : 'text-[#111827]',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p
                      className={cn(
                        'mt-1 text-[11px] leading-snug',
                        isCurrent ? 'text-[#E3EFEA]/90' : 'text-[#475569]',
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                  {step.meta && (
                    <p
                      className={cn(
                        'mt-1.5 font-mono text-[10px] font-semibold',
                        isCurrent ? 'text-[#C8A951]' : 'text-[#0D3B2E]',
                      )}
                    >
                      {step.meta}
                    </p>
                  )}
                </div>
              </>
            );

            return (
              <li key={step.id} className="list-none">
                {onStepSelect ? (
                  <button
                    type="button"
                    onClick={() => onStepSelect(step.id, index)}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={cn(commonClasses, 'w-full h-full')}
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    aria-current={isCurrent ? 'step' : undefined}
                    className={cn(commonClasses, 'w-full h-full')}
                  >
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
);

StepProgressRail.displayName = 'StepProgressRail';
