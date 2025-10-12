import type * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FieldCardProps {
  label: string;
  subtitle?: string;
  restriction?: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function FieldCard({
  label,
  subtitle,
  restriction,
  value,
  children,
  className,
  contentClassName,
}: FieldCardProps) {
  return (
    <Card className={cn('rounded-md shadow-md', className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-medium">{label}</CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('pb-0', contentClassName)}>
        {children ? children : value != null ? <Input value={value} disabled readOnly className="bg-muted/40" /> : null}
        {restriction ? (
          <div className="mt-5 -mx-6 -mb-6 px-6 py-3 bg-black/5 dark:bg-white/5 text-muted-foreground border-t border-border text-xs">
            {restriction}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
