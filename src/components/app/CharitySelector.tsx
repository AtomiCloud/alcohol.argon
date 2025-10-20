'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CharityPrincipalRes } from '@/clients/alcohol/zinc/api';

type Props = {
  // The charity principal (source of truth from SSR)
  charity: CharityPrincipalRes | undefined;
  error?: string;
  // Optional: custom param name for the charity ID in the return URL
  returnCharityParam?: string;
};

export default function CharitySelector({ charity, error, returnCharityParam = 'charityId' }: Props) {
  const router = useRouter();

  // Display charity name from principal
  const charityLabel = charity?.name || 'No charity selected';

  const handleNavigateToCharities = useCallback(() => {
    // Build the charities page URL with return parameters
    const currentPath = router.asPath;
    const charitiesUrl = new URL('/charities', window.location.origin);
    charitiesUrl.searchParams.set('returnTo', currentPath);
    charitiesUrl.searchParams.set('returnCharityParam', returnCharityParam);

    void router.push(charitiesUrl.pathname + charitiesUrl.search);
  }, [router, returnCharityParam]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            value={charityLabel}
            disabled
            placeholder="No charity selected"
            className="bg-slate-50 dark:bg-slate-900 disabled:opacity-100 text-slate-900 dark:text-slate-100 font-medium border-slate-200 dark:border-slate-700"
          />
        </div>
        <Button type="button" onClick={handleNavigateToCharities} variant="outline" className="shrink-0">
          {charity ? 'Change' : 'Choose'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
