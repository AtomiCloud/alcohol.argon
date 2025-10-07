'use client';
import { useMemo, useState } from 'react';
import type { CharityOption } from '@/models/habit';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

type Props = {
  value: string;
  options: CharityOption[];
  onChange: (id: string) => void;
  error?: string;
};

export default function CharityComboBox({ value, options, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  // Filtering handled by Command; keep items as-is
  const items = options;
  const current = options.find(c => c.id === value);
  const currentLabel = current?.label || '';

  return (
    <div className="space-y-1">
      <label className="block text-sm" htmlFor="charity-combobox">
        Charity
      </label>
      <div className="flex gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id="charity-combobox"
              type="button"
              aria-expanded={open}
              aria-controls="charity-combobox-menu"
              aria-haspopup="listbox"
              className="w-full md:w-72 h-10 rounded-md border border-input bg-background px-3 text-left text-sm cursor-pointer"
            >
              {currentLabel || 'Search or select a charity'}
            </button>
          </PopoverTrigger>
          <PopoverContent id="charity-combobox-menu" className="p-0">
            <Command shouldFilter>
              <CommandInput placeholder="Search charity..." autoFocus />
              <CommandList>
                <CommandEmpty>No results</CommandEmpty>
                <CommandGroup>
                  {items.map(it => (
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
        {value && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Clear charity"
            onClick={() => onChange('')}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
