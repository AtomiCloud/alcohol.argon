// Domain models and constants for Habit-related UI and API shapes

export const WEEKDAYS = [
  { key: 'Monday', label: 'Mon' },
  { key: 'Tuesday', label: 'Tue' },
  { key: 'Wednesday', label: 'Wed' },
  { key: 'Thursday', label: 'Thu' },
  { key: 'Friday', label: 'Fri' },
  { key: 'Saturday', label: 'Sat' },
  { key: 'Sunday', label: 'Sun' },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]['key'];

// Weekday helper constants
export const WEEKDAY_ORDER: WeekdayKey[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
export const WEEKDAYS_ONLY: WeekdayKey[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const WEEKENDS_ONLY: WeekdayKey[] = ['Saturday', 'Sunday'];

export const WEEKDAY_SHORT_MAP: Record<WeekdayKey, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export type CharityOption = { id: string; label: string };

export type HabitDraft = {
  task: string;
  daysOfWeek: string[];
  notificationTime: string; // UI HH:mm
  amount: string; // number as string for UI
  currency: string; // e.g., 'USD'
  charityId: string;
  enabled: boolean;
};

export const defaultHabitDraft = (charityId?: string): HabitDraft => ({
  task: '',
  daysOfWeek: WEEKDAYS.map(w => w.key),
  notificationTime: '22:00',
  amount: '',
  currency: 'USD',
  charityId: charityId ?? '',
  enabled: true,
});
