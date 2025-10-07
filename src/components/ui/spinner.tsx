import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

const sizeClass: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={cn(
        'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
