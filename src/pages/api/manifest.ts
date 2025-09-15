import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

export default withApiAtomi(buildTime, async (req: NextApiRequest, res: NextApiResponse, { config }) => {
  try {
    const manifest = {
      name: config.common.app.name,
      short_name: config.common.app.name,
      description: config.common.app.description,
      start_url: config.common.pwa.startUrl,
      display: config.common.pwa.display,
      orientation: config.common.pwa.orientation,
      background_color: config.common.pwa.backgroundColor,
      theme_color: config.common.pwa.themeColor,
      lang: config.common.seo.og.locale.replace('_', '-'),
      scope: config.common.pwa.scope,
      icons: [
        {
          src: '/pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/apple-touch-icon-180x180.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'any',
        },
      ],
      categories: config.common.pwa.categories,
      screenshots: [
        {
          src: '/og-image.png',
          sizes: '1200x630',
          type: 'image/png',
          form_factor: 'wide',
        },
      ],
      // Dynamic based on environment
      ...(config.common.landscape === 'raichu' && {
        prefer_related_applications: false,
        related_applications: [],
      }),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=86400'); // Cache for 1 day
    res.status(200).json(manifest);
  } catch (error) {
    console.error('Failed to generate manifest:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});
