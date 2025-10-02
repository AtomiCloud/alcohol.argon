import { dinero, toDecimal } from 'dinero.js';
import type { Currency } from '@dinero.js/currencies';
import { USD } from '@dinero.js/currencies';

type CurrencyCode = 'USD'; // Extend if multi-currency support is needed

function getCurrency(_code: CurrencyCode = 'USD'): Currency<number> {
  // Extend with additional currencies as needed
  return USD;
}

// Normalize a user-entered amount string into a standard decimal string with '.' separator and up to 2 decimals.
function normalizeDecimalString(input: string): string {
  let s = (input || '').trim();
  if (!s) return '';
  // Keep digits and separators only
  s = s.replace(/[\s\u00A0]/g, '');
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  let dec = '.';
  if (hasDot && hasComma) {
    // Use the last-seen separator as decimal, strip the other as thousands separators
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    dec = lastDot > lastComma ? '.' : ',';
  } else if (hasComma && !hasDot) {
    dec = ',';
  } else {
    dec = '.';
  }
  if (dec === ',') {
    // Remove dots (thousands), replace comma with dot
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // Remove commas (thousands)
    s = s.replace(/,/g, '');
  }
  // Remove anything that's not digit or dot
  s = s.replace(/[^0-9.]/g, '');
  // Split into integer and fraction
  const [i, f = ''] = s.split('.');
  const intPart = (i || '0').replace(/\D/g, '') || '0';
  const fracPart = f.replace(/\D/g, '').slice(0, 2); // limit to 2 decimals
  return fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
}

// Parse a decimal string (like "5.50" or "5,50") into cents as a string
function parseAmountInputToCents(input: string, _locale = 'en-US'): string {
  const norm = normalizeDecimalString(input);
  if (!norm) return '';
  const [i, f = ''] = norm.split('.');
  const intPart = (i || '0').replace(/\D/g, '') || '0';
  const fracPad = `${f}00`.slice(0, 2);
  const cents = Number.parseInt(intPart, 10) * 100 + Number.parseInt(fracPad || '0', 10);
  return String(Number.isNaN(cents) ? 0 : cents);
}

// Format cents to a localized decimal string (no currency symbol), e.g., "1,234.56" in en-US
function formatCentsAsDecimal(cents: string | number, locale = 'en-US'): string {
  const amount = typeof cents === 'string' ? Number.parseInt(cents || '0', 10) : cents;
  const n = (Number.isFinite(amount) ? amount : 0) / 100;
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

// Format a decimal string (like "5.50") as localized currency string using Intl
function formatCurrencyFromDecimalString(
  decimal: string | undefined | null,
  currency: CurrencyCode = 'USD',
  locale = 'en-US',
): string {
  const cents = parseAmountInputToCents(decimal || '0', locale);
  const n = (Number.parseInt(cents || '0', 10) || 0) / 100;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}

// Create a Dinero instance from cents
function dineroFromCents(cents: string | number, currency: CurrencyCode = 'USD') {
  const amount = typeof cents === 'string' ? Number.parseInt(cents || '0', 10) : cents;
  return dinero({ amount: Number.isFinite(amount) ? amount : 0, currency: getCurrency(currency) });
}

export {
  normalizeDecimalString,
  parseAmountInputToCents,
  formatCentsAsDecimal,
  formatCurrencyFromDecimalString,
  dineroFromCents,
};
