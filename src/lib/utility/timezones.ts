// Get all available IANA timezones using Intl API
export type TimezoneOption = { id: string; label: string };

/**
 * Get all available IANA timezones from the browser's Intl API
 * Falls back to a minimal list if supportedValuesOf is not available
 */
export const getTimezoneOptions = (): TimezoneOption[] => {
  let timezones: string[];

  try {
    // Modern browsers support Intl.supportedValuesOf
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl && typeof Intl.supportedValuesOf === 'function') {
      timezones = Intl.supportedValuesOf('timeZone');
    } else {
      // Fallback: Use common timezones
      timezones = [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Toronto',
        'America/Vancouver',
        'America/Mexico_City',
        'America/Sao_Paulo',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Europe/Amsterdam',
        'Europe/Stockholm',
        'Europe/Moscow',
        'Africa/Cairo',
        'Africa/Johannesburg',
        'Asia/Dubai',
        'Asia/Kolkata',
        'Asia/Bangkok',
        'Asia/Singapore',
        'Asia/Hong_Kong',
        'Asia/Shanghai',
        'Asia/Tokyo',
        'Asia/Seoul',
        'Australia/Sydney',
        'Pacific/Auckland',
      ];
    }
  } catch {
    // Ultimate fallback
    timezones = ['UTC'];
  }

  return timezones
    .sort((a, b) => a.localeCompare(b))
    .map(tz => ({
      id: tz,
      label: tz.replace(/_/g, ' '),
    }));
};
