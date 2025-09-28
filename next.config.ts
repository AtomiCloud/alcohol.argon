import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
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

function proxyModifiers(c: NextConfig): NextConfig {
  let config = c;

  // biome-ignore lint/complexity/useOptionalChain : this is not optional
  if (client.tracker.umami && client.tracker.umami.proxy) {
    const host = client.tracker.umami.host;
    config.rewrites = async () => [
      {
        source: '/stats/:match*',
        destination: `${host}/:match*`,
      },
    ];
  }

  // biome-ignore lint/complexity/useOptionalChain : this is not optional
  if (client.tracker.plausible && client.tracker.plausible.proxy) {
    config = withPlausibleProxy()(config);
  }
  return config;
}

const nextConfig: NextConfig = {
  /* config options here */
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
});

// @ts-expect-error - Type incompatibility between Next.js 15 and next-pwa types
export default pwaConfig(proxyModifiers(nextConfig));

initOpenNextCloudflareForDev().then(() => console.log('initOpenNextCloudflareForDev Completed'));
