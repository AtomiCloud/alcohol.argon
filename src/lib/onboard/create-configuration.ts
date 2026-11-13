import type { CreateConfigurationReq } from '@/clients/alcohol/zinc/api';
import { Err, Ok, type Result } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';

// The zinc call onboarding makes to finish.
export interface ConfigurationCreateApi {
  vConfigurationCreate2: (
    params: { version: string },
    data: CreateConfigurationReq,
  ) => Promise<Result<unknown, Problem>>;
}

// Creates the user's configuration. A 409 means another tab or device finished onboarding first:
// that configuration wins, so onboarding is done. Only a 409 counts; the 500 that zinc before
// alcohol.zinc#98 returns for a duplicate stays an error.
export async function createConfiguration(
  api: ConfigurationCreateApi,
  payload: CreateConfigurationReq,
): Promise<Result<void, Problem>> {
  const result = await api.vConfigurationCreate2({ version: '1.0' }, payload);
  return result.match<Result<void, Problem>>({
    ok: () => Ok(undefined),
    err: problem => (problem.status === 409 ? Ok(undefined) : Err(problem)),
  });
}
