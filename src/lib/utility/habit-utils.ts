// Shared utility helpers for Habit flows (time + stake formatting)

import {
  formatCentsAsDecimal,
  formatCurrencyFromDecimalString,
  normalizeDecimalString,
  parseAmountInputToCents,
} from '@/lib/utility/money-utils';

export const toHM = (t: string | undefined | null): string => {
  if (!t) return '';
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  return '';
};

// Request value for an optional time field: "HH:mm", or null when the field is empty.
export const toHMOrNull = (t: string | undefined | null): string | null => toHM(t) || null;

// When a habit sits in a day view: its habit time, else its reminder time, else none ('').
export const habitSortTime = (h: { habitTime?: string | null; notificationTime?: string | null }): string =>
  toHM(h.habitTime) || toHM(h.notificationTime);

// Day-view order: by sort time (habits with none go last), then the user's habit order, then id.
export const compareHabitsBySortTime = (
  a: { id?: string | null; habitTime?: string | null; notificationTime?: string | null; sortOrder?: number },
  b: { id?: string | null; habitTime?: string | null; notificationTime?: string | null; sortOrder?: number },
): number => {
  const ta = habitSortTime(a);
  const tb = habitSortTime(b);
  if (ta !== tb) {
    if (!ta) return 1;
    if (!tb) return -1;
    return ta < tb ? -1 : 1;
  }
  const oa = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const ob = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (oa !== ob) return oa - ob;
  const ia = a.id ?? '';
  const ib = b.id ?? '';
  return ia < ib ? -1 : ia > ib ? 1 : 0;
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
  habitTime?: string;
  notificationTime?: string;
}

export const validateHabitDraft = (draft: HabitDraftLike): Record<string, string> => {
  const errs: Record<string, string> = {};
  if (!draft.task || draft.task.trim().length < 3) errs.task = 'Please enter a habit (min 3 chars)';
  if (!draft.daysOfWeek || draft.daysOfWeek.length === 0) errs.daysOfWeek = 'Choose at least one day of the week';
  if (draft.habitTime && !toHM(draft.habitTime)) errs.habitTime = 'Enter a time like 07:30';
  if (draft.notificationTime && !toHM(draft.notificationTime)) errs.notificationTime = 'Enter a time like 21:00';
  const amt = draft.amount?.trim();
  if (amt && Number(amt) > 0) {
    const norm = normalizeDecimalString(amt);
    const isAmountFormat = /^(?:\d+|\d+\.\d{1,2})$/.test(norm);
    if (!isAmountFormat || Number(norm) <= 0) errs.amount = 'Enter a valid amount (e.g., 5 or 5.50)';
    if (!draft.charityId) errs.charityId = 'Please select a charity';
  }
  return errs;
};
