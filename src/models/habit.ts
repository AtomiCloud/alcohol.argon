// Domain models and constants for Habit-related UI and API shapes

export const WEEKDAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
  { key: 'SUNDAY', label: 'Sun' },
] as const;

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
