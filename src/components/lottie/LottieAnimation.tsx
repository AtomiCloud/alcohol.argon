'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Lottie, { type LottieComponentProps } from 'lottie-react';
import { cn } from '@/lib/utils';
import type { LottieAnimationData } from '@/lib/lottie-utils';

interface LottieAnimationProps extends Omit<LottieComponentProps, 'animationData'> {
  /**
   * Animation data object (preferred - no loading required)
   * Import your JSON: import loadingAnimation from '/public/animations/loading.json'
   */
  animationData?: LottieAnimationData;
  /**
   * Name of the animation file (fallback - requires loading)
   * File should be placed in /public/animations/
   */
  animationName?: string;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Width of the animation container
   */
  width?: number | string;
  /**
   * Height of the animation container
   */
  height?: number | string;
  /**
   * Whether to show loading state while animation loads (only for animationName)
   */
  showLoader?: boolean;
  /**
   * Custom loading component
   */
  loader?: React.ReactNode;
  /**
   * Callback when animation data fails to load
   */
  onLoadError?: (error: Error) => void;
  /**
   * Callback when animation data loads successfully
   */
  onLoadSuccess?: () => void;
}

export default function LottieAnimation({
  animationData: inlineAnimationData,
  animationName,
  className,
  width = '100%',
  height = '100%',
  showLoader = true,
  loader,
  onLoadError,
  onLoadSuccess,
  loop = true,
  autoplay = true,
  ...lottieProps
}: LottieAnimationProps) {
  const [dynamicAnimationData, setDynamicAnimationData] = useState<LottieAnimationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we have inline animation data, use it directly
  const finalAnimationData = inlineAnimationData || dynamicAnimationData;

  useEffect(() => {
    // Only load dynamically if no inline data and animationName is provided
    if (!inlineAnimationData && animationName) {
      const loadAnimation = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const response = await fetch(`/animations/${animationName}.json`);

          if (!response.ok) throw new Error(`Failed to load animation: ${response.statusText}`);
          const data = (await response.json()) as LottieAnimationData;
          setDynamicAnimationData(data);
          onLoadSuccess?.();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error loading animation';
          setError(errorMessage);
          onLoadError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
          setIsLoading(false);
        }
      };

      loadAnimation().then(_ => console.log());
    } else if (inlineAnimationData) {
      // Inline data is available immediately
      onLoadSuccess?.();
    }
  }, [animationName, inlineAnimationData, onLoadError, onLoadSuccess]);

  const containerStyle = {
    width,
    height,
  };

  // Show loading only for dynamic loading (not inline)
  if (!inlineAnimationData && isLoading && showLoader) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={containerStyle}>
        {loader || (
          // Use a simple spinner that matches the LoadingLottie style
          <div
            className="animate-spin rounded-full border-2 border-primary border-t-transparent"
            style={{ width: '48px', height: '48px' }}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/50 rounded-lg', className)} style={containerStyle}>
        <span className="text-destructive text-sm">Failed to load animation</span>
      </div>
    );
  }

  if (!finalAnimationData) {
    return null;
  }

  return (
    <div className={cn('', className)} style={containerStyle}>
      <Lottie
        animationData={finalAnimationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        {...lottieProps}
      />
    </div>
  );
}
