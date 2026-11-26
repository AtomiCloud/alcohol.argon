import type { GetServerSidePropsResult } from 'next';
import type { ParsedUrlQuery } from 'node:querystring';
import type { CharityPrincipalRes, CharityRes, ConfigurationRes } from '@/clients/alcohol/zinc/api';
import { Ok, type Result, type ResultSerial } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

export type SettingsPageData = {
  configuration: ConfigurationRes;
  // null when the user has no default charity yet
  charity: CharityPrincipalRes | null;
};
export type SettingsPageProps = { initial: ResultSerial<SettingsPageData, Problem> };

// The zinc calls the settings page needs on the server.
export interface SettingsPageApi {
  vConfigurationMeList: (params: { version: string }) => Promise<Result<ConfigurationRes, Problem>>;
  vCharityDetail: (params: { version: string; id: string }) => Promise<Result<CharityRes, Problem>>;
}

// The form state lives in the URL, so a visit without `tz` or `charity` redirects once with both
// filled in from the saved configuration. An empty value is a real value: `charity=` means the
// user has no default charity, so it must not count as missing, or the page redirects to itself.
export async function loadSettingsPage(
  api: SettingsPageApi,
  query: ParsedUrlQuery,
): Promise<GetServerSidePropsResult<SettingsPageProps>> {
  const configResult = await api.vConfigurationMeList({ version: '1.0' });
  const configSerial = await configResult.serial();
  if (configSerial[0] === 'err') return { props: { initial: configSerial } };
  const configuration = configSerial[1];

  if (typeof query.tz !== 'string' || typeof query.charity !== 'string') {
    const tz = (query.tz as string) || configuration.principal.timezone || '';
    const charity = (query.charity as string) || configuration.principal.defaultCharityId || '';
    return {
      redirect: {
        destination: `/settings?tz=${encodeURIComponent(tz)}&charity=${encodeURIComponent(charity)}`,
        permanent: false,
      },
    };
  }

  const charity: Result<CharityPrincipalRes | null, Problem> = query.charity
    ? (await api.vCharityDetail({ version: '1.0', id: query.charity })).map(({ principal }) => principal)
    : Ok(null);
  const initial = await charity.map(c => ({ configuration, charity: c })).serial();
  return { props: { initial } };
}
