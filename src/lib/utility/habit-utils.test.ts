import { describe, expect, it } from 'bun:test';
import { compareHabitsBySortTime, toHMOrNull } from '@/lib/utility/habit-utils';

type H = { id: string; habitTime?: string | null; notificationTime?: string | null; sortOrder: number };
const order = (hs: H[]) => [...hs].sort(compareHabitsBySortTime).map(h => h.id);

describe('compareHabitsBySortTime', () => {
  it('uses habit time, else reminder time, and puts habits with neither last', () => {
    const hs: H[] = [
      { id: 'none', habitTime: null, notificationTime: null, sortOrder: 0 },
      { id: 'reminder-0800', habitTime: null, notificationTime: '08:00', sortOrder: 1 },
      { id: 'habit-0700-reminder-2200', habitTime: '07:00', notificationTime: '22:00', sortOrder: 2 },
      { id: 'habit-0900', habitTime: '09:00', sortOrder: 3 },
    ];
    expect(order(hs)).toEqual(['habit-0700-reminder-2200', 'reminder-0800', 'habit-0900', 'none']);
  });

  it('breaks ties by the user habit order, then id', () => {
    const hs: H[] = [
      { id: 'b', habitTime: '07:00', sortOrder: 1 },
      { id: 'c', notificationTime: '07:00:00', sortOrder: 0 },
      { id: 'a', habitTime: '07:00', sortOrder: 1 },
      { id: 'y', sortOrder: 5 },
      { id: 'x', sortOrder: 5 },
    ];
    expect(order(hs)).toEqual(['c', 'a', 'b', 'x', 'y']);
  });
});

describe('toHMOrNull', () => {
  it('sends HH:mm, or null for an empty field', () => {
    expect(toHMOrNull('07:30')).toBe('07:30');
    expect(toHMOrNull('07:30:00')).toBe('07:30');
    expect(toHMOrNull('')).toBeNull();
    expect(toHMOrNull(null)).toBeNull();
  });
});
