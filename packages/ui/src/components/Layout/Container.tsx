import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize | undefined;
}

const containerSizes: Record<ContainerSize, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = '2xl', className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8', containerSizes[size], className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
