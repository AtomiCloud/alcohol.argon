import type { WithApiHandler, WithServerSideHandler, WithStaticHandler } from './types';
import type { Module } from '@/lib/module/core';

interface NextAdapterConfig<TInput, TOutput> extends Module<TInput, TOutput> {
  errorHandler?: (error: unknown) => string;
  defaultErrorMessage?: string;
}

interface NextAdapter<TInput, TOutput> {
  withApi: WithApiHandler<TInput, TOutput>;
  withServerSide: WithServerSideHandler<TInput, TOutput>;
  withStatic: WithStaticHandler<TInput, TOutput>;
}

function createNextAdapter<TInput, TOutput>(config: NextAdapterConfig<TInput, TOutput>): NextAdapter<TInput, TOutput> {
  const { name, builder, errorHandler, defaultErrorMessage = `${name} initialization failed` } = config;

  const withApi: WithApiHandler<TInput, TOutput> = (moduleConfig, handler) => {
    return async (req, res) => {
      try {
        const resource = await builder(moduleConfig);
        await handler(req, res, resource);
      } catch (error) {
        console.error(`Module ${name} error in API route:`, error);

        // Special handling for invalid_grant errors (expired/invalid refresh tokens)
        const errorStr = String(error);
        const errMessage = error instanceof Error ? error.message : '';
        const errorObj = error as { code?: string; error?: string; data?: { code?: string; error?: string } };

        const isInvalidGrant =
          errorStr.includes('invalid_grant') ||
          errorStr.includes('oidc.invalid_grant') ||
          errMessage.includes('invalid_grant') ||
          errorObj?.code === 'oidc.invalid_grant' ||
          errorObj?.error === 'invalid_grant' ||
          errorObj?.data?.code === 'oidc.invalid_grant' ||
          errorObj?.data?.error === 'invalid_grant';

        if (isInvalidGrant) {
          console.warn(`Module ${name}: Detected invalid_grant error, clearing session and returning 401`);
          // Clear Logto cookies to prevent infinite loop
          // Logto cookies follow the pattern: logto_{appId}
          for (const cookieName of Object.keys(req.cookies || {})) {
            if (cookieName.startsWith('logto_')) {
              res.setHeader(
                'Set-Cookie',
                `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
              );
            }
          }

          res.status(401).json({
            error: 'unauthorized',
            message: 'Session expired, please sign in again',
            signOutUrl: '/api/logto/sign-out',
          });
          return;
        }

        let errorMessage = defaultErrorMessage;
        if (errorHandler) {
          errorMessage = errorHandler(error);
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        res.status(500).json({
          error: 'Internal Server Error',
          message:
            process.env.NODE_ENV === 'development' ? errorMessage : `Module ${name} initialization error occurred`,
        });
      }
    };
  };

  const withServerSide: WithServerSideHandler<TInput, TOutput> = (moduleConfig, handler) => {
    return async context => {
      try {
        const resource = await builder(moduleConfig);
        return await handler(context, resource);
      } catch (error) {
        console.error('Module error in server-side:', error);
        throw error;
      }
    };
  };

  const withStatic: WithStaticHandler<TInput, TOutput> = (moduleConfig, handler) => {
    return async context => {
      try {
        const resource = await builder(moduleConfig);
        return await handler(context, resource);
      } catch (error) {
        console.error('Module error in static:', error);
        throw error;
      }
    };
  };

  return {
    withApi,
    withServerSide,
    withStatic,
  };
}

export { createNextAdapter };
export type { NextAdapterConfig, NextAdapter };
