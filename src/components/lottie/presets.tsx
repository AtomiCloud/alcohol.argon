import InlineLottie from './InlineLottie';

// Import animation data - uncomment when you have the JSON files
import loadingData from '/public/animations/loading.json';
import successData from '/public/animations/success.json';
import errorData from '/public/animations/errors/dogSwimming.json';
import emptyStateData from '/public/animations/empty-state.json';

interface PresetProps {
  className?: string;
  size?: number;
}

/**
 * Loading spinner animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function LoadingLottie({ className, size = 48 }: PresetProps) {
  return (
    <InlineLottie
      animationData={loadingData}
      className={className}
      width={size}
      height={size}
      loop={true}
      autoplay={true}
    />
  );
}

/**
 * Success checkmark animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function SuccessLottie({ className, size = 64 }: PresetProps) {
  return (
    <InlineLottie
      animationData={successData}
      className={className}
      width={size}
      height={size}
      loop={false}
      autoplay={true}
    />
  );
}

/**
 * Error animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function ErrorLottie({ className, size = 64 }: PresetProps) {
  return (
    <InlineLottie
      animationData={errorData}
      className={className}
      width={size}
      height={size}
      loop={false}
      autoplay={true}
    />
  );
}

/**
 * Empty state animation preset (inline)
 * To use: uncomment the import above and enable the InlineLottie component below
 */
export function EmptyStateLottie({ className, size = 120 }: PresetProps) {
  return (
    <InlineLottie
      animationData={emptyStateData}
      className={className}
      width={size}
      height={size}
      loop={true}
      autoplay={true}
    />
  );
}
