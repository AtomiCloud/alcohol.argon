'use client';

import { load, trackPageview } from 'fathom-client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useClientConfig } from '@/adapters/external/Provider';

export default function Tracker() {
  const client = useClientConfig();

  const router = useRouter();
  useEffect(() => {
    if (!client.tracker.fathom.enabled) return;
    load(client.tracker.fathom.id);

    const track = (url: string) =>
      trackPageview({
        url,
        referrer: document.referrer,
      });

    router.events.on('routeChangeComplete', track);
    return () => router.events.off('routeChangeComplete', track);
  }, [router, client.tracker.fathom.id, client.tracker.fathom.enabled]);
  return null;
}
