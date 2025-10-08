import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HabitOverviewHabitRes } from '@/clients/alcohol/zinc/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Edit,
  Clock,
  Check,
  Trash2,
  Flame,
  Crown,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Snowflake,
  MinusCircle,
  Palmtree,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toHM } from '@/lib/utility/habit-utils';
import { formatCurrencyFromDecimalString } from '@/lib/utility/money-utils';
import { WEEKDAY_ORDER, WEEKDAYS_ONLY, WEEKENDS_ONLY, WEEKDAY_SHORT_MAP, type WeekdayKey } from '@/models/habit';

interface HabitCardProps {
  habit: HabitOverviewHabitRes;
  userTimezone: string;
  loading?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  completing?: boolean;
  deleting?: boolean;
  showStreaks?: boolean;
  transitioning?: boolean;
}

function scheduleSummary(days?: boolean[] | null): string {
  const d = days ?? [];
  const activeDays = d.filter(Boolean).length;
  if (activeDays === 0) return 'No schedule';
  if (activeDays === 7) return 'Everyday';

  // Map boolean array to weekday names (Sunday is index 0)
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const selectedDays = d
    .map((active, index) => (active ? dayNames[index] : null))
    .filter((d): d is string => d !== null);

  // Check for weekdays (Mon-Fri = indices 1-5)
  const isWeekdays = activeDays === 5 && d[1] && d[2] && d[3] && d[4] && d[5];
  if (isWeekdays) return 'Weekdays';

  // Check for weekends (Sat-Sun = indices 0, 6)
  const isWeekends = activeDays === 2 && d[0] && d[6];
  if (isWeekends) return 'Weekends';

  return selectedDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
}

// Status icon mapping for streak display - using actual API status values
const statusIconMap: Record<string, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  succeeded: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    label: 'Completed',
  },
  failed: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Failed' },
  frozen: { icon: Snowflake, color: 'text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Frozen' },
  skip: {
    icon: MinusCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Skipped',
  },
  vacation: {
    icon: Palmtree,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Vacation',
  },
};

export function HabitCard({
  habit,
  userTimezone,
  loading,
  onEdit,
  onComplete,
  onDelete,
  completing,
  deleting,
  showStreaks = false,
  transitioning = false,
}: HabitCardProps) {
  const time = toHM(habit.notificationTime || '');
  const stake = habit.stake?.amount || 0;
  const stakeCurrency = habit.stake?.currency || 'USD';
  const stakeLabel = stake > 0 ? `${stakeCurrency} ${stake.toFixed(2)}` : 'None';
  const charityName = habit.charity?.name || null;

  const palette = [
    'from-emerald-400 via-teal-400 to-cyan-400',
    'from-orange-400 via-fuchsia-400 to-violet-500',
    'from-blue-500 via-indigo-400 to-purple-500',
    'from-pink-500 via-rose-400 to-orange-400',
  ];
  const idx = Math.abs((habit.id || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length;
  const gradient = palette[idx];

  // Determine card state
  const now = new Date();
  const currentDayIndex = now.getDay();
  const isDayScheduled = habit.days?.[currentDayIndex] ?? false;
  const isRestDay = !isDayScheduled;

  // Check if timezone differs from user's timezone
  const showTimezone = habit.timezone && habit.timezone !== userTimezone;

  // Calculate time till failure (timeLeftToEodMinutes is already provided by API)
  const timeLeftMinutes = habit.timeLeftToEodMinutes || 0;
  const hoursLeft = Math.floor(timeLeftMinutes / 60);
  const minutesLeft = timeLeftMinutes % 60;
  const timeLeftLabel = hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`;

  // Get week status for streak display
  const weekStatus = habit.status?.week;
  const currentStreak = habit.status?.currentStreak || 0;
  const maxStreak = habit.status?.maxStreak || 0;
  const isCompleteToday = habit.status?.isCompleteToday || false;

  // Check if habit can be completed today
  const isEnabled = habit.enabled ?? true;
  const canComplete = !isCompleteToday && isEnabled && isDayScheduled;

  // Urgency indicator (if less than 3 hours remaining)
  const isUrgent = !isCompleteToday && timeLeftMinutes > 0 && timeLeftMinutes < 180;

  const guessEmoji = (text: string | null | undefined): string => {
    const t = (text || '').toLowerCase();
    const map: Array<[RegExp, string]> = [
      [/run|jog|sprint|5k|10k/, '🏃'],
      [/walk|steps/, '🚶'],
      [/bike|cycle|cycling/, '🚴'],
      [/swim|pool/, '🏊'],
      [/read|book|study|learn/, '📚'],
      [/write|journal|essay|blog/, '✍️'],
      [/meditate|mindful|breath|yoga/, '🧘'],
      [/sleep|bed|nap/, '😴'],
      [/water|hydrate|drink/, '💧'],
      [/code|program|dev|commit/, '💻'],
      [/gym|lift|workout|pushup|push-up|pullup|squat/, '💪'],
    ];
    for (const [regex, e] of map) if (regex.test(t)) return e;
    return '💪';
  };

  // Determine card styling based on state
  const baseClassName = isCompleteToday
    ? 'relative overflow-hidden opacity-40 grayscale'
    : isRestDay
      ? 'relative overflow-hidden opacity-40 grayscale'
      : isUrgent
        ? 'relative overflow-hidden hover:shadow-lg shadow-md ring-2 ring-amber-400/50 animate-pulse-subtle'
        : 'relative overflow-hidden hover:shadow-md transition-shadow';

  // Add motion transition classes; when transitioning out (after completion),
  // fade quickly and slide slightly so the list can collapse smoothly.
  const isTransitioningOut = transitioning && !isCompleteToday && !isRestDay;
  const motionClassName = isTransitioningOut
    ? 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none'
    : 'opacity-100 translate-y-0';

  const cardClassName = `${baseClassName} transform-gpu will-change-[opacity,transform] ease-out motion-reduce:transition-none ${motionClassName}`;

  // Wrapper collapses height so siblings shift upward smoothly as this card exits
  const wrapperClassName = `overflow-hidden will-change-[max-height] transition-[max-height] duration-700 ease-out ${
    isTransitioningOut ? 'max-h-0' : 'max-h-[1000px]'
  }`;

  return (
    <div className={wrapperClassName}>
      <Card className={cardClassName} style={{ transition: 'opacity 160ms ease, transform 260ms ease' }}>
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} ${isCompleteToday ? 'opacity-0' : 'opacity-80'}`}
          aria-hidden
        />

        {/* Wrapper for top half (header + info) to center the complete button */}
        <div className="relative">
          {/* Top row: title on left */}
          <CardHeader className="pb-1">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden text-base"
                aria-hidden
              >
                <span aria-hidden>{guessEmoji(habit.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold truncate leading-tight">
                  {habit.name || 'Untitled habit'}
                </h2>
                {isCompleteToday && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">✓ Completed today</p>
                )}
                {isRestDay && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Rest day • Next:{' '}
                    {habit.days?.findIndex((d, i) => d && i > currentDayIndex) !== -1
                      ? (() => {
                          const nextDayIndex = habit.days?.findIndex((d, i) => d && i > currentDayIndex) ?? -1;
                          const dayNames = [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                          ];
                          return nextDayIndex !== -1 ? dayNames[nextDayIndex] : 'Next week';
                        })()
                      : 'Next week'}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Top content area (excludes bottom row) */}
          <CardContent className="pt-2">
            {/* Give right padding so content doesn't sit under the button */}
            <div className="pr-20">
              {/* Info grid */}
              <div className="mt-1 grid gap-4 md:grid-cols-2">
                {/* Schedule block */}
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Schedule</div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3 flex-wrap">
                    <Badge className="px-2 py-0.5 text-[10px]">{scheduleSummary(habit.days)}</Badge>
                    {showTimezone && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <Globe className="h-3 w-3" />
                          {habit.timezone}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stake & Time Left block */}
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Stake{' '}
                    {!isCompleteToday && timeLeftMinutes > 0 && (
                      <span className={isUrgent ? 'text-amber-600 font-semibold animate-pulse' : 'text-amber-600'}>
                        • {timeLeftLabel} left
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                    {stake > 0 ? (
                      <Badge className="px-2 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-900/40">
                        {stakeLabel} {charityName ? `→ ${charityName}` : ''}
                      </Badge>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                    {isUrgent && !isCompleteToday && (
                      <Badge className="px-2 py-0.5 text-[10px] bg-amber-500 text-white border-0 animate-pulse">
                        ⏰ Urgent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {onComplete && !isCompleteToday && !isRestDay ? (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Button
                onClick={onComplete}
                disabled={loading || completing || !canComplete}
                size="icon"
                className={`relative h-12 w-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${isUrgent ? 'animate-pulse' : ''}`}
                aria-label="Mark complete"
                title={!canComplete ? (!isEnabled ? 'Habit is disabled' : 'Not scheduled for today') : 'Mark complete'}
              >
                <Check className={`h-5 w-5 transition-opacity ${completing ? 'opacity-0' : 'opacity-100'}`} />
                <Spinner
                  className={`absolute transition-opacity ${completing ? 'opacity-100' : 'opacity-0'}`}
                  size="md"
                />
              </Button>
            </div>
          ) : null}
        </div>

        {/* Bottom section: streak and actions in separate rows */}
        <CardContent>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Streak row */}
            {showStreaks && weekStatus && (
              <div className="flex flex-col gap-3">
                {/* Week status indicators */}
                <div className="flex items-center gap-1.5">
                  {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => {
                    const status = weekStatus[day as keyof typeof weekStatus] as string | undefined;

                    // Empty circle for not applicable or null
                    if (!status || status === 'not_applicable') {
                      return <span key={day} className="size-5 rounded-full bg-slate-200 dark:bg-slate-700" />;
                    }

                    // Get status info, fallback to a default if status not recognized
                    const statusInfo = statusIconMap[status] || {
                      icon: CheckCircle,
                      color: 'text-slate-500',
                      bgColor: 'bg-slate-200 dark:bg-slate-700',
                      label: status,
                    };
                    const Icon = statusInfo.icon;

                    return (
                      <span
                        key={day}
                        className={`size-5 flex items-center justify-center rounded-full ${statusInfo.bgColor}`}
                        title={`${day.charAt(0).toUpperCase() + day.slice(1)}: ${statusInfo.label}`}
                      >
                        <Icon className={`size-3.5 ${statusInfo.color}`} strokeWidth={2.5} />
                      </span>
                    );
                  })}
                </div>
                {/* Streak stats */}
                <div className="flex items-center gap-4 text-sm md:text-base">
                  <span
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200"
                    title="Current streak"
                  >
                    <Flame className="h-5 w-5 text-amber-500" />
                    <span className="text-base">{currentStreak}</span>
                    <span className="text-xs font-normal text-slate-500">day{currentStreak !== 1 ? 's' : ''}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200"
                    title="Max streak"
                  >
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span className="text-base">{maxStreak}</span>
                    <span className="text-xs font-normal text-slate-500">best</span>
                  </span>
                </div>
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} disabled={loading} aria-label="Edit habit">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}

              {/* Skip button - placeholder for future API integration */}
              {!isCompleteToday && !isRestDay && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    // TODO: Wire up skip API when available
                    alert('Skip feature coming soon!');
                  }}
                  aria-label="Skip today"
                >
                  <MinusCircle className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Delete this habit?')) onDelete();
                  }}
                  disabled={deleting}
                  className="relative text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-70 disabled:pointer-events-none dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                  aria-label="Delete habit"
                >
                  <Spinner
                    className={`absolute left-2 transition-opacity ${deleting ? 'opacity-100' : 'opacity-0'}`}
                    size="sm"
                  />
                  <Trash2 className={`h-4 w-4 mr-1 transition-opacity ${deleting ? 'opacity-0' : 'opacity-100'}`} />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HabitCard;
