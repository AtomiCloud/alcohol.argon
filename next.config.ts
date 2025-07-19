import type { NextConfig } from 'next';
import { BuildTimeProcessor } from '@/lib/config/core/build-time';
import FaroSourceMapUploaderPlugin from '@grafana/faro-webpack-plugin';
import { type ClientConfig, type CommonConfig, configSchemas, importedConfigurations } from '@/config';
import { ConfigurationFactory } from '@/lib/config';

// Process build-time environment variables
const buildTimeProcessor = new BuildTimeProcessor();
const buildTimeEnv = buildTimeProcessor.scanEnvironmentVariables(process.env);

const cfgFactory = ConfigurationFactory.createManager();
const registry = cfgFactory.createRegistry(configSchemas, importedConfigurations);

const common = registry.common as CommonConfig;
const client = registry.client as ClientConfig;

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
        'process.env.LANDSCAPE': JSON.stringify(process.env.LANDSCAPE),
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

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
