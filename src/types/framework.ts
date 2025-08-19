/**
 * Framework-specific type definitions
 */

import type { NextComponentType, NextPageContext } from 'next';

/**
 * Extended component type with error handling opt-out
 */
// biome-ignore lint/suspicious/noExplicitAny: Next.js type requires any
export type FrameworkAwareComponent = NextComponentType<NextPageContext, any, any> & {
  /**
   * Set to true to disable global error handling for this component
   */
  disableErrorHandling?: boolean;
};

/**
 * Framework configuration options
 */
export interface FrameworkConfig {
  /** Enable/disable the entire framework */
  enabled: boolean;
  /** Routes to exclude from framework handling */
  excludedRoutes: string[];
  /** Minimum delay before showing loading state (ms) */
  loadingDelayMs: number;
  /** Enable error boundary error handling */
  errorBoundaryEnabled: boolean;
  /** Enable navigation loading states */
  navigationLoadingEnabled: boolean;
}

/**
 * Content display states
 */
export type ContentState = 'loading' | 'content' | 'error';

/**
 * Error source types for debugging
 */
export type ErrorSource = 'error-boundary' | 'page-props' | 'router-navigation' | 'api-call' | 'unknown';
