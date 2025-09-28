interface PlausibleProps {
  domain: string;

  taggedEvents?: boolean;
  trackFileDownloads?: boolean;
  trackOutboundLinks?: boolean;
  manualPageviews?: boolean;
  selfHosted?: boolean;
  trackLocalhost?: boolean;

  customDomain?: string;
}

export type { PlausibleProps };
