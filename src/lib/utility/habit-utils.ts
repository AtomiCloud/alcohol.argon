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

// Backwards-compatible names used by pages/components
export const amountToCents = (amount: string, locale = 'en-US'): string => parseAmountInputToCents(amount, locale);

export const formatCentsToAmount = (cents: string, locale = 'en-US'): string => formatCentsAsDecimal(cents, locale);

export { formatCurrencyFromDecimalString };

// Validation
export interface HabitDraftLike {
  task: string;
  daysOfWeek: string[];
  amount?: string;
  charityId?: string;
}

export const validateHabitDraft = (draft: HabitDraftLike): Record<string, string> => {
  const errs: Record<string, string> = {};
  if (!draft.task || draft.task.trim().length < 3) errs.task = 'Please enter a habit (min 3 chars)';
  if (!draft.daysOfWeek || draft.daysOfWeek.length === 0) errs.daysOfWeek = 'Choose at least one day of the week';
  const amt = draft.amount?.trim();
  if (amt && Number(amt) > 0) {
    const norm = normalizeDecimalString(amt);
    const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(norm);
    if (!isAmountFormat || Number(norm) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
    if (!draft.charityId) errs.charityId = 'Please select a charity';
  }
  return errs;
};
