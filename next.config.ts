import type { NextConfig } from 'next';
import { BuildTimeProcessor } from '@/lib/config/core/build-time';

// Process build-time environment variables
const buildTimeProcessor = new BuildTimeProcessor();
const buildTimeEnv = buildTimeProcessor.scanEnvironmentVariables(process.env);

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: config => {
    // Allow importing JSON files as modules
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // Allow importing YAML files as modules
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    });

    // Inject build-time environment variables into webpack DefinePlugin
    config.plugins = config.plugins || [];
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_TIME_VARIABLES': JSON.stringify(buildTimeEnv),
      }),
    );

    return config;
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
