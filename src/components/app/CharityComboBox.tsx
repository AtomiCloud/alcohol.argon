'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CharityOption } from '@/models/habit';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, Filter, ExternalLink, Globe } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useSwaggerClients } from '@/adapters/external/Provider';
import type { CausePrincipalRes, CharityPrincipalRes } from '@/clients/alcohol/zinc/api';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type Props = {
  value: string;
  // Optional: legacy options used as fallback suggestions when no query entered
  options?: CharityOption[];
  onChange: (id: string) => void;
  error?: string;
};

type CharitySearchItem = CharityPrincipalRes;

export default function CharityComboBox({ value, options = [], onChange, error }: Props) {
  const api = useSwaggerClients();

  // Open state for chooser (modal)
  const [open, setOpen] = useState(false);

  // Filters
  const [countries, setCountries] = useState<string[]>([]);
  const [causes, setCauses] = useState<CausePrincipalRes[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [causeOpen, setCauseOpen] = useState(false);
  const [charityOpen, setCharityOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCauseKey, setSelectedCauseKey] = useState<string>('');

  // Search
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CharitySearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedInitialLabel, setLoadedInitialLabel] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchSeqRef = useRef(0);
  const inFlightRef = useRef(false);

  const currentLabel = useMemo(() => {
    // Prefer live-loaded label
    if (value) {
      const inItems = items.find(i => i.id === value);
      const inOptions = options.find(o => o.id === value);
      return inItems?.name || inOptions?.label || loadedInitialLabel;
    }
    return '';
  }, [value, items, options, loadedInitialLabel]);

  // Load filter metadata on mount
  useEffect(() => {
    let disposed = false;
    (async () => {
      const [countriesRes, causesRes] = await Promise.all([
        api.alcohol.zinc.api.vCharitySupportedCountriesList({ version: '1.0' }),
        api.alcohol.zinc.api.vCausesList({ version: '1.0' }),
      ]);
      countriesRes.match({
        ok: cs => {
          if (!disposed) setCountries(cs);
        },
        err: () => {},
      });
      causesRes.match({
        ok: cc => {
          if (!disposed)
            setCauses([...cc].sort((a, b) => (a.name || a.key || '').localeCompare(b.name || b.key || '')));
        },
        err: () => {},
      });
    })();
    return () => {
      disposed = true;
    };
  }, [api]);

  // If a value is provided but we don't have its label, fetch it
  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!value) return;
      const hasLabel = options.find(o => o.id === value)?.label || items.find(i => i.id === value)?.name;
      if (hasLabel) return;
      const result = await api.alcohol.zinc.api.vCharityDetail({ version: '1.0', id: value });
      result.match({
        ok: d => {
          if (!disposed) setLoadedInitialLabel(d.principal.name || 'Selected charity');
        },
        err: () => {},
      });
    })();
    return () => {
      disposed = true;
    };
  }, [value, api, options, items]);

  // Debounced server-side search
  const runSearch = useCallback(
    async (q: string, country: string, causeKey: string) => {
      const seq = ++searchSeqRef.current;
      inFlightRef.current = true;
      setLoading(true);
      const res = await api.alcohol.zinc.api.vCharityList({
        version: '1.0',
        Name: q || undefined,
        Country: country || undefined,
        CauseKey: causeKey || undefined,
        Limit: 20,
        Skip: 0,
      });
      // Only apply if this is the latest search
      if (seq === searchSeqRef.current) {
        res.match({
          ok: list => {
            setItems(list.filter(c => !!c.id));
          },
          err: () => {
            setItems([]);
          },
        });
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [api],
  );

  useEffect(() => {
    if (!open) return;
    // Always perform a server search, even with empty query/filters,
    // so users see the detailed list immediately on open. Use a small debounce
    // only when the user is actively typing or changing filters.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const hasUserInput = query.trim().length > 0 || !!selectedCountry || !!selectedCauseKey;
    const delay = hasUserInput ? 200 : 0;
    debounceRef.current = setTimeout(() => {
      runSearch(query.trim(), selectedCountry, selectedCauseKey);
    }, delay);
  }, [query, selectedCountry, selectedCauseKey, open, runSearch]);

  // Simple inline dropdowns rendered inside the modal (no popovers)
  function FilterSelect<T extends string | { key?: string | null; name?: string | null }>(props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: T[];
    getKey: (t: T) => string;
    getLabel: (t: T) => string;
    open: boolean;
    setOpen: (v: boolean) => void;
    placeholder?: string;
  }) {
    const { label, value, onChange, options, getKey, getLabel, open, setOpen, placeholder } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const focusSoon = useCallback(() => {
      const el = inputRef.current;
      if (!el) return;
      try {
        el.focus();
      } catch {}
      setTimeout(() => el?.focus(), 0);
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => el?.focus());
    }, []);
    useEffect(() => {
      if (!open) return;
      // Focus the search input when the dropdown opens
      const t = setTimeout(() => focusSoon(), 0);
      return () => clearTimeout(t);
    }, [open, focusSoon]);
    const selected = options.find(o => getKey(o) === value);
    const display = selected ? getLabel(selected) : placeholder || label;

    return (
      <div className="w-full">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${label.toLowerCase()}-dropdown`}
          className="h-9 px-2 rounded-md border border-input bg-background text-xs inline-flex items-center gap-1 cursor-pointer"
          onMouseDown={e => {
            // Prevent default to avoid button taking focus and racing the input focus
            e.preventDefault();
            const next = !open;
            setOpen(next);
            if (next) focusSoon();
          }}
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) focusSoon();
          }}
        >
          <Filter className="h-3.5 w-3.5 opacity-70" /> {display}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
        {open && (
          <div id={`${label.toLowerCase()}-dropdown`} className="mt-2 w-full rounded-md border bg-background shadow-sm">
            <Command shouldFilter>
              <CommandInput ref={inputRef} placeholder={`Search ${label.toLowerCase()}...`} autoFocus />
              <CommandList className="max-h-[300px] overflow-y-auto overscroll-contain">
                <CommandEmpty>No results</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="__any__"
                    value="Any"
                    onSelect={() => {
                      onChange('');
                      setOpen(false);
                    }}
                  >
                    Any
                  </CommandItem>
                  {options.map(it => {
                    const key = getKey(it);
                    const lbl = getLabel(it);
                    return (
                      <CommandItem
                        key={key}
                        value={lbl}
                        onSelect={() => {
                          onChange(key);
                          setOpen(false);
                        }}
                      >
                        {lbl}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    );
  }

  function CauseSelect(props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: CausePrincipalRes[];
    open: boolean;
    setOpen: (v: boolean) => void;
    placeholder?: string;
  }) {
    const { label, value, onChange, options, open, setOpen, placeholder } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const focusSoon = useCallback(() => {
      const el = inputRef.current;
      if (!el) return;
      try {
        el.focus();
      } catch {}
      setTimeout(() => el?.focus(), 0);
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => el?.focus());
    }, []);
    useEffect(() => {
      if (!open) return;
      const t = setTimeout(() => focusSoon(), 0);
      return () => clearTimeout(t);
    }, [open, focusSoon]);
    const selected = options.find(o => (o.key || '') === value);
    const display = selected?.name || selected?.key || placeholder || label;

    const toSegments = (s: string) =>
      s
        .split('>')
        .map(p => p.trim())
        .filter(Boolean);

    return (
      <div className="w-full">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${label.toLowerCase()}-dropdown`}
          className="h-9 px-2 rounded-md border border-input bg-background text-xs inline-flex items-center gap-1 cursor-pointer"
          onMouseDown={e => {
            e.preventDefault();
            const next = !open;
            setOpen(next);
            if (next) focusSoon();
          }}
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) focusSoon();
          }}
        >
          <Filter className="h-3.5 w-3.5 opacity-70" /> {display || 'Any'}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
        {open && (
          <div id={`${label.toLowerCase()}-dropdown`} className="mt-2 w-full rounded-md border bg-background shadow-sm">
            <Command shouldFilter>
              <CommandInput ref={inputRef} placeholder={`Search ${label.toLowerCase()}...`} autoFocus />
              <CommandList className="max-h-[300px] overflow-y-auto overscroll-contain">
                <CommandEmpty>No results</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="__any__"
                    value="Any"
                    onSelect={() => {
                      onChange('');
                      setOpen(false);
                    }}
                  >
                    Any
                  </CommandItem>
                  {options.map(it => {
                    const name = it.name || it.key || '';
                    const segs = toSegments(name);
                    const depth = Math.max(0, segs.length - 1);
                    const leaf = segs[segs.length - 1] || name;
                    return (
                      <CommandItem
                        key={it.key || name}
                        value={name}
                        onSelect={() => {
                          onChange(it.key || '');
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <span style={{ marginLeft: depth * 12 }} className="text-xs">
                            {leaf}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    );
  }

  // Modal panel with three dropdowns: Country, Cause, Charity (server search)
  function SearchPanel() {
    const charityInputRef = useRef<HTMLInputElement | null>(null);
    return (
      <div className="flex flex-col p-3 gap-3">
        <div className="flex gap-2 flex-wrap">
          <FilterSelect
            label="Country"
            value={selectedCountry}
            onChange={v => setSelectedCountry(v)}
            options={countries}
            getKey={c => c as string}
            getLabel={c => c as string}
            open={countryOpen}
            setOpen={setCountryOpen}
            placeholder="Country: Any"
          />
          <CauseSelect
            label="Cause"
            value={selectedCauseKey}
            onChange={v => setSelectedCauseKey(v)}
            options={causes}
            open={causeOpen}
            setOpen={setCauseOpen}
            placeholder="Cause: Any"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="charity-dropdown" className="text-xs text-muted-foreground">
            Charity
          </label>
          <div className="w-full">
            <button
              type="button"
              aria-expanded={charityOpen}
              aria-controls="charity-dropdown"
              className="h-9 px-2 rounded-md border border-input bg-background text-xs inline-flex items-center gap-1 cursor-pointer w-full justify-between"
              onMouseDown={e => {
                e.preventDefault();
                const next = !charityOpen;
                setCharityOpen(next);
                if (next) {
                  const el = charityInputRef.current;
                  if (el) {
                    try {
                      el.focus();
                    } catch {}
                    setTimeout(() => el?.focus(), 0);
                    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => el?.focus());
                  }
                }
              }}
              onClick={() => {
                const next = !charityOpen;
                setCharityOpen(next);
                if (next) {
                  const el = charityInputRef.current;
                  if (el) {
                    try {
                      el.focus();
                    } catch {}
                    setTimeout(() => el?.focus(), 0);
                    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => el?.focus());
                  }
                }
              }}
            >
              <span className="truncate text-left">{currentLabel || 'Search charities (filter by country/cause)'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {charityOpen && (
              <div id="charity-dropdown" className="mt-2 w-full rounded-md border bg-background shadow-sm">
                <Command shouldFilter={false} className="w-full">
                  <CommandInput
                    ref={charityInputRef}
                    placeholder="Type to search charities..."
                    value={query}
                    onValueChange={setQuery}
                    autoFocus
                  />
                  <CommandList className="max-h-[300px] overflow-y-auto overscroll-contain">
                    {loading ? (
                      <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">Searching…</div>
                    ) : (
                      <>
                        <CommandEmpty>
                          {query || selectedCountry || selectedCauseKey ? 'No results' : 'Start typing to search'}
                        </CommandEmpty>
                        <CommandGroup>
                          {(items as CharitySearchItem[]).map(it => (
                            <CommandItem
                              key={it.id!}
                              value={it.name || it.slug || it.id!}
                              onSelect={() => {
                                if (it.id) onChange(it.id);
                                setOpen(false);
                              }}
                            >
                              <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-sm font-medium">{it.name || 'Unknown'}</div>
                                  {it.websiteUrl && (
                                    <a
                                      href={it.websiteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:underline"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Globe className="h-3.5 w-3.5" /> Visit <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {Array.isArray(it.countries) && it.countries.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      {it.countries.slice(0, 2).join(', ')}
                                      {it.countries.length > 2 ? ` +${it.countries.length - 2}` : ''}
                                    </Badge>
                                  )}
                                </div>
                                {it.mission && (
                                  <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                    {it.mission}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm" htmlFor="charity-combobox">
        Charity
      </label>
      <div className="flex gap-2 items-center">
        <button
          id="charity-combobox"
          type="button"
          aria-expanded={open}
          aria-controls="charity-combobox-modal"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-left text-sm cursor-pointer md:w-96"
        >
          {currentLabel || 'Search charities (filter by country/cause)'}
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            id="charity-combobox-modal"
            className="p-0 w-[calc(100vw-2rem)] max-w-[28rem] max-h-[80vh] overflow-hidden"
          >
            <SearchPanel />
          </DialogContent>
        </Dialog>
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
