import { describe, expect, it } from 'bun:test';
import type { ParsedUrlQuery } from 'node:querystring';
import type { ConfigurationRes } from '@/clients/alcohol/zinc/api';
import { Ok } from '@/lib/monads/result';
import { loadSettingsPage, type SettingsPageApi } from '@/lib/settings-page-data';

const charityA = { id: 'charity-a', name: 'Charity A' };

function fakeApi(principal: ConfigurationRes['principal']) {
  const charityCalls: string[] = [];
  const configuration = { principal, charity: {} } as ConfigurationRes;
  const api: SettingsPageApi = {
    vConfigurationMeList: async () => Ok(configuration),
    vCharityDetail: async ({ id }) => {
      charityCalls.push(id);
      return Ok({ principal: { ...charityA, id } });
    },
  };
  return { api, configuration, charityCalls };
}

// Follows redirects the way a browser does, parsing each Location the way Next parses a query.
async function visit(api: SettingsPageApi, start: string) {
  const seen: string[] = [];
  let url = start;
  for (;;) {
    const query: ParsedUrlQuery = Object.fromEntries(new URL(url, 'https://lazytax.club').searchParams);
    const result = await loadSettingsPage(api, query);
    if (!('redirect' in result)) return { result, seen };
    if (seen.includes(result.redirect.destination)) throw new Error(`redirect loop at ${result.redirect.destination}`);
    seen.push(result.redirect.destination);
    url = result.redirect.destination;
  }
}

describe('loadSettingsPage', () => {
  it('loads with no charity when the user has no default charity, instead of redirecting forever', async () => {
    const { api, configuration, charityCalls } = fakeApi({
      id: 'cfg',
      timezone: 'Asia/Singapore',
      defaultCharityId: null,
    });

    const { result, seen } = await visit(api, '/settings');

    expect(seen).toEqual(['/settings?tz=Asia%2FSingapore&charity=']);
    expect(result).toEqual({ props: { initial: ['ok', { configuration, charity: null }] } });
    expect(charityCalls).toEqual([]);
  });

  it('fills in the saved charity and timezone, then loads that charity', async () => {
    const { api, configuration } = fakeApi({ id: 'cfg', timezone: 'Asia/Singapore', defaultCharityId: 'charity-a' });

    const { result, seen } = await visit(api, '/settings');

    expect(seen).toEqual(['/settings?tz=Asia%2FSingapore&charity=charity-a']);
    expect(result).toEqual({ props: { initial: ['ok', { configuration, charity: charityA }] } });
  });

  it('keeps a charity picked in the URL over the saved one', async () => {
    const { api, charityCalls } = fakeApi({ id: 'cfg', timezone: 'Asia/Singapore', defaultCharityId: null });

    const { seen } = await visit(api, '/settings?tz=Asia%2FSingapore&charity=charity-b');

    expect(seen).toEqual([]);
    expect(charityCalls).toEqual(['charity-b']);
  });
});
