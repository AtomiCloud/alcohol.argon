import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
type SpinnerVariant = 'ring' | 'rays';

const sizeClass: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}

export function Spinner({ size = 'md', variant = 'ring', className, ...props }: SpinnerProps) {
  if (variant === 'rays') {
    // SVG with 12 radial bars using currentColor, spins via CSS
    const bars = Array.from({ length: 12 }, (_, i) => i);
    return (
      <output aria-live="polite" className={cn('inline-block', className)} {...props}>
        <svg viewBox="0 0 24 24" className={cn('animate-spin', sizeClass[size])}>
          {bars.map(i => (
            <g key={i} transform={`rotate(${i * 30} 12 12)`}>
              <rect x="11" y="1.5" width="2" height="5" rx="1" fill="currentColor" />
            </g>
          ))}
        </svg>
      </output>
    );
  }
  return (
    <output
      aria-live="polite"
      className={cn(
        'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
