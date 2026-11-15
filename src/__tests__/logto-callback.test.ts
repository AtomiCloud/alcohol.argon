import { expect, spyOn, test } from 'bun:test';
import LogtoClient, { LogtoClientError, LogtoError } from '@logto/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/logto/[action]';

test.each([
  [
    'CallbackSessionRejection_ReturnsSafe400WithoutAuthentication/missing',
    new LogtoClientError('sign_in_session.not_found'),
    400,
  ],
  [
    'CallbackSessionRejection_ReturnsSafe400WithoutAuthentication/invalid',
    new LogtoClientError('sign_in_session.invalid'),
    400,
  ],
  ['StateMismatch_ReturnsGeneric400', new LogtoError('callback_uri_verification.state_mismatched'), 400],
  ['UnexpectedSdkError_RemainsServerError', new LogtoError('callback_uri_verification.missing_code'), 500],
  ['UnexpectedClientError_RemainsServerError', new LogtoClientError('not_authenticated'), 500],
  ['MessageLookalike_RemainsServerError', new Error('Sign-in session not found.'), 500],
  [
    'StateCodeLookalike_RemainsServerError',
    Object.assign(new Error('State mismatched in the callback URI'), {
      code: 'callback_uri_verification.state_mismatched',
    }),
    500,
  ],
] as const)('%s', async (_name, error, expectedStatus) => {
  const saved = {
    landscape: process.env.LANDSCAPE,
    app: process.env.ATOMI_SERVER__AUTH__LOGTO__APP__SECRET,
    cookie: process.env.ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET,
  };
  process.env.LANDSCAPE = 'lapras';
  process.env.ATOMI_SERVER__AUTH__LOGTO__APP__SECRET = 'synthetic-handler-app';
  process.env.ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET = 'synthetic-handler-cookie';
  const sdk = spyOn(LogtoClient.prototype, 'createNodeClientFromNextApi');
  try {
    sdk.mockImplementation(async () => {
      throw error;
    });
    let status = 0;
    let body: unknown;
    const headers = new Map<string, unknown>();
    const response = {
      setHeader(name: string, value: unknown) {
        headers.set(name.toLowerCase(), value);
        return response;
      },
      status(value: number) {
        status = value;
        return response;
      },
      json(value: unknown) {
        body = value;
      },
      send(value: string) {
        body = JSON.parse(value);
      },
    };
    await handler(
      {
        query: { action: 'sign-in-callback', code: 'synthetic-invalid-code', state: 'synthetic-invalid-state' },
        cookies: {},
        url: '/api/logto/sign-in-callback/?code=synthetic-invalid-code&state=synthetic-invalid-state',
      } as unknown as NextApiRequest,
      response as unknown as NextApiResponse,
    );
    expect(status).toBe(expectedStatus);
    expect(headers.has('set-cookie')).toBe(false);
    expect(headers.has('location')).toBe(false);
    if (expectedStatus === 400) {
      expect(headers.get('content-type')).toBe('application/problem+json');
      expect(body).toEqual({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'Sign-in could not be completed. Please start sign-in again.',
      });
    } else {
      expect(body).toHaveProperty('error', 'Internal Server Error');
    }
  } finally {
    sdk.mockRestore();
    if (saved.landscape === undefined) Reflect.deleteProperty(process.env, 'LANDSCAPE');
    else process.env.LANDSCAPE = saved.landscape;
    if (saved.app === undefined) Reflect.deleteProperty(process.env, 'ATOMI_SERVER__AUTH__LOGTO__APP__SECRET');
    else process.env.ATOMI_SERVER__AUTH__LOGTO__APP__SECRET = saved.app;
    if (saved.cookie === undefined) Reflect.deleteProperty(process.env, 'ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET');
    else process.env.ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET = saved.cookie;
  }
});
