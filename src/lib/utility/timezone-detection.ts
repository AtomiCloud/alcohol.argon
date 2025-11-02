/**
 * Client-side timezone detection utility
 * Returns the user's detected timezone from browser
 */
export function getClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC'; // Fallback only if detection fails
  }
}

/**
 * Check if client's detected timezone differs from saved timezone
 * Used to show timezone mismatch warnings in settings
 */
export function hasTimezoneMismatch(savedTimezone: string | null | undefined): {
  hasMismatch: boolean;
  detectedTimezone: string;
  savedTimezone: string | null;
} {
  const detectedTimezone = getClientTimezone();
  const hasMismatch = savedTimezone != null && savedTimezone !== detectedTimezone;

  return {
    hasMismatch,
    detectedTimezone,
    savedTimezone: savedTimezone || null,
  };
}
