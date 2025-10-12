'use client';
import { useState } from 'react';
import type { TimezoneOption } from '@/lib/utility/timezones';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

type Props = {
  value: string;
  options: TimezoneOption[];
  onChange: (id: string) => void;
  error?: string;
};

export default function TimezoneComboBox({ value, options, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find(tz => tz.id === value);
  const currentLabel = current?.label || value || 'Select timezone...';

  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id="timezone-combobox"
              type="button"
              aria-expanded={open}
              aria-controls="timezone-combobox-menu"
              aria-haspopup="listbox"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-left text-sm cursor-pointer"
            >
              {currentLabel}
            </button>
          </PopoverTrigger>
          <PopoverContent id="timezone-combobox-menu" className="p-0" align="start">
            <Command shouldFilter className="w-full">
              <CommandInput placeholder="Search timezone..." autoFocus />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>No results</CommandEmpty>
                <CommandGroup>
                  {options.map(it => (
                    <CommandItem
                      key={it.id}
                      value={it.label}
                      onSelect={() => {
                        onChange(it.id);
                        setOpen(false);
                      }}
                    >
                      {it.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
