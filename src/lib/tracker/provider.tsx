'use client';

import React, { createContext } from 'react';
import PlausibleProvider, { usePlausible } from 'next-plausible';
import FathomTracker, { type FathomProps } from '@/lib/tracker/FathomTracker';
import type { PlausibleProps } from '@/lib/tracker/PlausibleTracker';
import { trackEvent } from 'fathom-client';

interface TrackerProps {
  children: React.ReactNode;
  fathomProps: FathomProps | false;
  plausibleProps: PlausibleProps | false;
  // umamiProps: UmamiProps;
}

interface TrackerContextType {
  fathomProps: FathomProps | false;
  plausibleProps: PlausibleProps | false;
  // umamiProps: UmamiProps;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

function TrackerProvider({ children, plausibleProps, fathomProps }: TrackerProps) {
  return (
    <TrackerContext.Provider value={{ plausibleProps, fathomProps }}>
      {fathomProps === false ? <></> : <FathomTracker id={fathomProps.id} />}
      {plausibleProps === false ? (
        <>{children}</>
      ) : (
        <PlausibleProvider
          enabled={true}
          domain={plausibleProps.domain}
          taggedEvents={plausibleProps.taggedEvents}
          customDomain={plausibleProps.customDomain}
          trackFileDownloads={plausibleProps.trackFileDownloads}
          trackOutboundLinks={plausibleProps.trackOutboundLinks}
          manualPageviews={plausibleProps.manualPageviews}
          selfHosted={plausibleProps.selfHosted}
          trackLocalhost={plausibleProps.trackLocalhost}
        >
          {children}
        </PlausibleProvider>
      )}
    </TrackerContext.Provider>
  );
}

function useTracker() {
  const context = React.useContext(TrackerContext);
  const plausible = usePlausible();

  if (context === undefined) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  const { plausibleProps, fathomProps } = context;

  function track(event: string, value?: number) {
    if (plausibleProps) {
      plausible(event, { props: { value } });
    }
    if (fathomProps) {
      trackEvent(event, { _value: value });
    }
  }

  return track;
}

export { useTracker, TrackerProvider, TrackerContext };
