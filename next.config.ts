import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: config => {
    // Allow importing JSON files as modules
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    return config;
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
