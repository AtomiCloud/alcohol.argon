import type { NextSeoProps } from 'next-seo';
import { useConfig } from '@/adapters/external/Provider';

interface PageSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
}

export const usePageSEO = (props: PageSEOProps = {}): NextSeoProps => {
  const { common } = useConfig();
  const baseUrl = common.app.url || (typeof window !== 'undefined' ? window.location.origin : '');

  return {
    title: props.title,
    description: props.description || common.app.description,
    canonical: props.canonical ? `${baseUrl}${props.canonical}` : undefined,
    noindex: props.noIndex || false,

    openGraph: {
      title: props.title || common.app.name,
      description: props.description || common.app.description,
      url: props.canonical ? `${baseUrl}${props.canonical}` : undefined,
      siteName: common.app.name,
      images: [
        {
          url: props.image ? `${baseUrl}${props.image}` : `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: props.title || common.app.name,
        },
      ],
    },

    twitter: {
      cardType: 'summary_large_image',
      site: common.seo.twitter.site,
    },
  };
};
