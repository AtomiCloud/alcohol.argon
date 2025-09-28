'use client';

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { load, trackPageview } from 'fathom-client';

interface FathomProps {
  id: string;
}

export type { FathomProps };

export default function FathomTracker({ id }: FathomProps) {
  const router = useRouter();

  // Fathom
  useEffect(() => {
    load(id);

    trackPageview({
      url: window.location.pathname,
      referrer: document.referrer,
    });
  }, [id]);

  useEffect(() => {
    // subsequent loads
    const track = (url: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) trackPageview({ url });
    };
    router.events.on('routeChangeComplete', track);
    return () => router.events.off('routeChangeComplete', track);
  }, [router.events]);

  return null;
}
