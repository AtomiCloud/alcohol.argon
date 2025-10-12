import type { DefaultSeoProps } from 'next-seo';
import type { CommonConfig } from '@/config';

/**
 * SEO configuration built from common config injected at build time
 * This transforms BUILD_TIME_COMMON_CONFIG into SEO format
 */
function buildSeoConfig(common: CommonConfig): DefaultSeoProps {
  const baseUrl = common.app.url;

  return {
    title: common.app.name,
    titleTemplate: `%s | ${common.app.name}`,
    description: common.app.description,
    defaultTitle: common.app.name,

    openGraph: {
      type: 'website',
      locale: common.seo.og.locale,
      siteName: common.app.name,
      title: common.app.name,
      description: common.app.description,
      url: baseUrl,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: common.app.name,
        },
      ],
    },

    twitter: {
      cardType: 'summary_large_image',
      site: common.seo.twitter.site,
      handle: common.seo.twitter.creator,
    },

    additionalMetaTags: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'theme-color',
        content: common.pwa.themeColor,
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: common.app.name,
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
    ],

    additionalLinkTags: [
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: '48x48',
      },
      {
        rel: 'icon',
        href: '/logo-source.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon-180x180.png',
        sizes: '180x180',
      },
      {
        rel: 'manifest',
        href: '/api/manifest',
      },
    ],
  };
}

// Read and transform the build-time config
const commonConfig: CommonConfig = process.env.BUILD_TIME_COMMON_CONFIG as unknown as CommonConfig;

export const generatedSeoConfig: DefaultSeoProps = buildSeoConfig(commonConfig);
