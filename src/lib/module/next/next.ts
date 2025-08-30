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
