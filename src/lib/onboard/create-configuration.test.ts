import { describe, expect, it } from 'bun:test';
import type { CreateConfigurationReq } from '@/clients/alcohol/zinc/api';
import { Err, Ok, type Result } from '@/lib/monads/result';
import { createConfiguration, type ConfigurationCreateApi } from '@/lib/onboard/create-configuration';
import type { Problem } from '@/lib/problem/core';

const payload: CreateConfigurationReq = { timezone: 'Asia/Singapore', defaultCharityId: 'charity-1' };
const problem = (status: number, title: string) =>
  ({ type: `urn:test:${status}`, title, status }) as unknown as Problem;

// zinc's create, answering with `answer` and recording every call.
function fakeApi(answer: Result<unknown, Problem>) {
  const calls: { version: string; data: CreateConfigurationReq }[] = [];
  const api: ConfigurationCreateApi = {
    vConfigurationCreate2: async ({ version }, data) => {
      calls.push({ version, data });
      return answer;
    },
  };
  return { api, calls };
}

describe('createConfiguration', () => {
  it('creates the configuration once with the picked timezone and charity', async () => {
    const { api, calls } = fakeApi(Ok({ id: 'cfg-1' }));

    expect(await (await createConfiguration(api, payload)).isOk()).toBe(true);
    expect(calls).toEqual([{ version: '1.0', data: payload }]);
  });

  it('counts a 409 (another tab or device finished onboarding first) as done', async () => {
    const { api, calls } = fakeApi(Err(problem(409, 'EntityConflict')));

    expect(await (await createConfiguration(api, payload)).isOk()).toBe(true);
    expect(calls).toHaveLength(1);
  });

  for (const [label, status] of [
    ['a 500 (older zinc, also for a duplicate)', 500],
    ['a 400', 400],
  ] as const) {
    it(`keeps ${label} an error`, async () => {
      // Titled like a conflict: only the status decides.
      const { api } = fakeApi(Err(problem(status, 'EntityConflict')));

      const result = await createConfiguration(api, payload);

      expect(await result.isErr()).toBe(true);
      expect((await result.unwrapErr()).status).toBe(status);
    });
  }
});
