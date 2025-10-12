import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
// Intentionally do not import next-pwa/cache; we want zero runtime caches
import { BuildTimeProcessor } from '@/lib/config/core/build-time';
import FaroSourceMapUploaderPlugin from '@grafana/faro-webpack-plugin';
import { type ClientConfig, type CommonConfig, configSchemas } from '@/config';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { loadImportedConfigurations } from '@/config/configs.node';
import {
  ConfigurationLoader,
  ConfigurationManager,
  ConfigurationMerger,
  ConfigurationValidator,
} from '@/lib/config/core';
import { withPlausibleProxy } from 'next-plausible';
// Process build-time environment variables
const buildTimeProcessor = new BuildTimeProcessor();
const buildTimeEnv = buildTimeProcessor.scanEnvironmentVariables(process.env);

const importedConfigurations = loadImportedConfigurations();

const landscape = process.env.LANDSCAPE || process.env.ATOMI_LANDSCAPE || 'base';

const cfgLoader = new ConfigurationLoader(landscape, true);
const cfgMerger = new ConfigurationMerger('ATOMI_');
const cfgValidator = new ConfigurationValidator(false);
const cfgManager = new ConfigurationManager(cfgLoader, cfgMerger, cfgValidator);
const registry = cfgManager.createRegistry(configSchemas, importedConfigurations);

const common = registry.common as CommonConfig;
const client = registry.client as ClientConfig;

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure extensionless URLs like /blog/slug resolve to static HTML
  trailingSlash: true,
  // Cloudflare/OpenNext does not support Next's default image optimization
  // route (`/_next/image`). Use unoptimized images so `next/image` serves
  // files directly from `public/`.
  images: { unoptimized: true },
  serverExternalPackages: ['jose'],
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
        'process.env.LANDSCAPE': JSON.stringify(landscape),
        'process.env.BUILD_TIME_COMMON_CONFIG': JSON.stringify(common),
        'process.env.BUILD_TIME_CLIENT_CONFIG': JSON.stringify(client),
      }),
    );

    if (client.faro.build.enabled && client.faro.enabled) {
      config.plugins.push(
        new FaroSourceMapUploaderPlugin({
          appName: `${common.app.servicetree.module}.${common.app.servicetree.service}.${common.app.servicetree.landscape}`,
          endpoint: client.faro.build.endpoint,
          appId: client.faro.build.app,
          stackId: client.faro.build.stack,
          apiKey: client.faro.build.key,
          gzipContents: client.faro.build.gzipContents,
        }),
      );
    }
    return config;
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev mode
  // Disable all runtime caching so no pages or APIs are cached by the SW.
  // Keep SW only for manifest + installability + theme-color control.
  runtimeCaching: [],
  // Prevent next-pwa from precaching any assets/pages at build time.
  // This ensures the SW does not serve stale HTML or assets.
  buildExcludes: [/^.*$/],
});

// @ts-expect-error - Type incompatibility between Next.js 15 and next-pwa types
export default pwaConfig(withPlausibleProxy()(nextConfig));

initOpenNextCloudflareForDev().then(() => console.log('initOpenNextCloudflareForDev Completed'));
