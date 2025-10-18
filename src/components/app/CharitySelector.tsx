'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { CharityOption } from '@/models/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';

type Props = {
  value: string;
  // Optional: legacy options used as fallback for label display
  options?: CharityOption[];
  onChange: (id: string) => void;
  error?: string;
  // Optional: custom param name for the charity ID in the return URL
  returnCharityParam?: string;
};

export default function CharitySelector({
  value,
  options = [],
  onChange,
  error,
  returnCharityParam = 'charityId',
}: Props) {
  const api = useSwaggerClients();
  const reporter = useProblemReporter();
  const router = useRouter();

  const [charityLabel, setCharityLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load charity label if we have an ID but no label
  useEffect(() => {
    let disposed = false;

    const loadLabel = async () => {
      if (!value) {
        setCharityLabel('');
        return;
      }

      // Check if we already have the label in options
      const existingOption = options.find(o => o.id === value);
      if (existingOption?.label) {
        setCharityLabel(existingOption.label);
        return;
      }

      // Otherwise, fetch from API
      setLoading(true);
      const result = await api.alcohol.zinc.api.vCharityDetail({ version: '1.0', id: value });
      result.match({
        ok: d => {
          if (!disposed) {
            setCharityLabel(d.principal.name || 'Selected charity');
          }
        },
        err: problem => {
          if (!disposed) {
            setCharityLabel('Unknown charity');
            reporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
              source: 'CharitySelector',
              context: { action: 'loadLabel', charityId: value },
              problem,
            });
          }
        },
      });
      setLoading(false);
    };

    loadLabel();

    return () => {
      disposed = true;
    };
  }, [value, options, api, reporter]);

  // Listen for charity selection from the charities page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const charityIdFromUrl = urlParams.get(returnCharityParam);

    if (charityIdFromUrl && charityIdFromUrl !== value) {
      onChange(charityIdFromUrl);

      // Clean up the URL param after handling it
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete(returnCharityParam);
      router.replace(newUrl.pathname + newUrl.search, undefined, { shallow: true });
    }
  }, [router, returnCharityParam, value, onChange]);

  const handleNavigateToCharities = useCallback(() => {
    // Build the charities page URL with return parameters
    const currentPath = router.asPath;
    const charitiesUrl = new URL('/charities', window.location.origin);
    charitiesUrl.searchParams.set('returnTo', currentPath);
    charitiesUrl.searchParams.set('returnCharityParam', returnCharityParam);

    router.push(charitiesUrl.pathname + charitiesUrl.search);
  }, [router, returnCharityParam]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            value={loading ? 'Loading...' : charityLabel || 'No charity selected'}
            disabled
            placeholder="No charity selected"
            className="bg-slate-50 dark:bg-slate-900 disabled:opacity-100 text-slate-900 dark:text-slate-100 font-medium border-slate-200 dark:border-slate-700"
          />
        </div>
        <Button type="button" onClick={handleNavigateToCharities} variant="outline" className="shrink-0">
          {value ? 'Change' : 'Choose'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
