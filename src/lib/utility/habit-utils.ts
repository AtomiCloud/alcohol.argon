// Shared utility helpers for Habit flows (time + stake formatting)

import {
  formatCentsAsDecimal,
  formatCurrencyFromDecimalString,
  normalizeDecimalString,
  parseAmountInputToCents,
} from '@/lib/utility/money-utils';

export const toHHMMSS = (t: string | undefined | null): string | null => {
  if (!t) return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return null;
};

export const toHM = (t: string | undefined | null): string => {
  if (!t) return '';
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  return '';
};

export const parseStake = (s: string | undefined | null): { amount: string; currency: string } => {
  if (!s) return { amount: '', currency: 'USD' };
  const normalized = normalizeDecimalString(String(s));
  const n = Number(normalized);
  // Treat 0 or invalid as no stake
  const amount = !normalized || !Number.isFinite(n) || n <= 0 ? '' : normalized;
  return { amount, currency: 'USD' };
};

// Backwards-compatible names used by pages/components
export const amountToCents = (amount: string, locale = 'en-US'): string => parseAmountInputToCents(amount, locale);

export const formatCentsToAmount = (cents: string, locale = 'en-US'): string => formatCentsAsDecimal(cents, locale);

export { formatCurrencyFromDecimalString };
