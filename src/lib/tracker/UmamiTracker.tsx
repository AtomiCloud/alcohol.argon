import Script from 'next/script';

interface UmamiProps {
  host: string;
  id: string;
  proxy: boolean;
}

export default function UmamiTracker({ host, id, proxy }: UmamiProps) {
  return proxy ? (
    <Script src="/stats/script.js" data-website-id={id} />
  ) : (
    <Script src={`${host}/script.js`} data-website-id={id} />
  );
}

export type { UmamiProps };
