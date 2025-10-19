import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight } from 'lucide-react';

type AsyncButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
  idleIcon?: React.ReactNode;
};

/**
 * AsyncButton standardizes a left-aligned icon area that shows a visible icon when idle
 * and a fast "rays" spinner when loading. It reserves space to avoid layout shift.
 */
export function AsyncButton({ loading = false, idleIcon, className, children, disabled, ...props }: AsyncButtonProps) {
  const Icon = idleIcon ?? <ArrowRight className="w-4 h-4" />;
  return (
    <Button className={`relative pl-11 pr-6 ${className ?? ''}`} disabled={loading || disabled} {...props}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-5 h-5">
        {loading ? <Spinner size="sm" variant="rays" className="[animation-duration:500ms]" /> : Icon}
      </span>
      <span className={loading ? 'opacity-80' : ''}>{children}</span>
    </Button>
  );
}

export default AsyncButton;
