import { expect, test } from 'bun:test';
import { loadFaroBuildConfiguration, loadImportedConfigurations } from './configs.node';
import { configSchemas } from './index';
import { projectPublicConfig } from './public';
import { authBuilder } from '../lib/auth/core/server/adapter';
import {
  ConfigurationLoader,
  ConfigurationManager,
  ConfigurationMerger,
  ConfigurationValidator,
} from '../lib/config/core';

test('Public configuration preserves allowed values and excludes unknown nested fields and build credentials', () => {
  const manager = new ConfigurationManager<typeof configSchemas>(
    new ConfigurationLoader('pichu', true),
    new ConfigurationMerger('ATOMI_'),
    new ConfigurationValidator(true),
  );
  const env = {
    ATOMI_COMMON__APP__NAME: 'public-name',
    ATOMI_CLIENT__SUPPORT__EMAIL: 'public@example.invalid',
    ATOMI_CLIENT__FARO__COLLECTORURL: 'https://collector.example.invalid',
    ATOMI_CLIENT__FARO__BUILD__KEY: 'private-upload',
    ATOMI_SERVER__AUTH__LOGTO__APP__SECRET: 'private-app',
    ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET: 'private-cookie',
    ATOMI_COMMON__APP__UNREVIEWED: 'private-new-common',
    ATOMI_CLIENT__UNREVIEWED: 'private-new-client',
  };
  const registry = manager.createRegistry(configSchemas, loadImportedConfigurations(), env);
  // Deliberately bypass schema stripping: adding a future schema field must not
  // accidentally publish it through a spread/reference to its parent object.
  const common = { ...registry.common, app: { ...registry.common.app, unreviewed: 'private-new-common' } };
  const client = { ...registry.client, faro: { ...registry.client.faro, build: { key: 'private-upload' } } };
  const result = projectPublicConfig(common, client);
  expect(result.common.app.name).toBe('public-name');
  expect(result.client.support.email).toBe('public@example.invalid');
  expect(result.client.faro.collectorurl).toBe('https://collector.example.invalid');
  expect(result.common.landscape).toBe('pichu');
  expect(result.common.app.url).toBe(registry.common.app.url);
  expect(JSON.stringify(result)).not.toContain('private-');
  expect(result).not.toHaveProperty('server');
  expect(result.client.faro).not.toHaveProperty('build');
  expect(loadFaroBuildConfiguration('pichu', env).key).toBe('private-upload');
  expect(registry.server.auth.logto.app.secret).toBe('private-app');
});

test('Auth construction rejects either missing runtime secret without revealing configuration', () => {
  const config = {
    endpoint: 'http://127.0.0.1:3301',
    appId: 'synthetic-app',
    appSecret: 'synthetic-app-private',
    baseUrl: 'http://localhost:3300',
    cookieSecret: 'synthetic-cookie-private',
    landscape: 'pichu',
    resourceTree: {},
    scopes: ['openid'],
  };
  expect(authBuilder(config).client).toBeDefined();
  for (const field of ['appSecret', 'cookieSecret']) {
    for (const value of ['', '  ']) {
      expect(() => authBuilder({ ...config, [field]: value })).toThrow('Required server configuration is unavailable');
    }
  }
});
