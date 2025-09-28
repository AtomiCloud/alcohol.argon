'use client';

import { load, trackPageview } from 'fathom-client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useClientConfig } from '@/adapters/external/Provider';

export default function Tracker() {
  const client = useClientConfig();
  const router = useRouter();

  // Fathom
  useEffect(() => {
    // initial load
    if (!client.tracker.fathom.enabled) return;
    load(client.tracker.fathom.id);

    trackPageview({
      url: window.location.pathname,
      referrer: document.referrer,
    });
  }, [client.tracker.fathom.id, client.tracker.fathom.enabled]);

  useEffect(() => {
    // subsequent loads
    if (!client.tracker.fathom.enabled) return;
    const track = (url: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) trackPageview({ url });
    };
    router.events.on('routeChangeComplete', track);
    return () => router.events.off('routeChangeComplete', track);
  }, [router.events, client.tracker.fathom.enabled]);

  return null;
}
