import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type DisabledDateType = 'past' | 'overlap' | 'limit' | 'custom';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  disabled?: (date: Date) => boolean | DisabledDateType;
  placeholder?: string;
  className?: string;
  maxDays?: number;
}

export function DateRangePicker({
  value,
  onChange,
  disabled,
  placeholder = 'Pick a date range',
  className,
  maxDays = 60,
}: DateRangePickerProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get disabled type for styling
  const getDisabledType = React.useCallback(
    (date: Date): DisabledDateType | false => {
      // Check custom disabled logic first
      const customResult = disabled?.(date);
      if (customResult === true) return 'custom';
      if (typeof customResult === 'string') return customResult;

      // If we have a start date (from), disable dates that would exceed maxDays
      if (value?.from && !value?.to) {
        // Normalize dates to midnight for accurate comparison
        const fromDate = new Date(value.from);
        fromDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        // Calculate days inclusive (both start and end count as days)
        const daysDiff = Math.floor((checkDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
        // Disable if this would make the total duration > maxDays
        // For maxDays=60: allow daysDiff from 0 to 59 (60 days inclusive)
        if (daysDiff >= maxDays) return 'limit';
      }

      return false;
    },
    [disabled, value, maxDays],
  );

  // Enhanced disabled function that returns boolean for react-day-picker
  const enhancedDisabled = React.useCallback(
    (date: Date): boolean => {
      return getDisabledType(date) !== false;
    },
    [getDisabledType],
  );

  // Custom modifiers for different disabled types
  const modifiers = React.useMemo(
    () => ({
      disabled_past: (date: Date) => getDisabledType(date) === 'past',
      disabled_overlap: (date: Date) => getDisabledType(date) === 'overlap',
      disabled_limit: (date: Date) => getDisabledType(date) === 'limit',
      disabled_custom: (date: Date) => getDisabledType(date) === 'custom',
    }),
    [getDisabledType],
  );

  const modifiersClassNames = {
    disabled_past: 'text-slate-400 dark:text-slate-600 opacity-30 bg-slate-50 dark:bg-slate-900/20 cursor-not-allowed',
    disabled_overlap:
      'text-orange-400 dark:text-orange-500 opacity-50 bg-orange-50 dark:bg-orange-950/20 cursor-not-allowed relative before:content-[""] before:absolute before:left-1/2 before:top-1/2 before:h-[1px] before:w-5 before:bg-orange-400 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45',
    disabled_limit:
      'text-blue-400 dark:text-blue-500 opacity-40 bg-blue-50 dark:bg-blue-950/20 cursor-not-allowed relative before:content-[""] before:absolute before:left-1/2 before:top-1/2 before:h-[1px] before:w-5 before:bg-blue-400 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45',
    disabled_custom:
      'text-red-400 dark:text-red-500 opacity-40 bg-red-50 dark:bg-red-950/20 cursor-not-allowed relative before:content-[""] before:absolute before:left-1/2 before:top-1/2 before:h-[1px] before:w-5 before:bg-red-400 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45',
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                </>
              ) : (
                format(value.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={isMobile ? 1 : 2}
            disabled={enhancedDisabled}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
