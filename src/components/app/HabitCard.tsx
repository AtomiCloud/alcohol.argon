import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HabitOverviewHabitRes } from '@/clients/alcohol/zinc/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Check,
  Trash2,
  Flame,
  Crown,
  Globe,
  CheckCircle,
  XCircle,
  Snowflake,
  MinusCircle,
  MoreHorizontal,
  Palmtree,
  ChevronDown,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface HabitCardProps {
  habit: HabitOverviewHabitRes;
  userTimezone: string;
  loading?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  onSkip?: () => void;
  completing?: boolean;
  deleting?: boolean;
  skipping?: boolean;
  showStreaks?: boolean;
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
  onSkip,
  completing,
  deleting,
  skipping,
  showStreaks = false,
}: HabitCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  // Check if today is skipped
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const todayName = dayNames[currentDayIndex];
  const todayStatus = weekStatus?.[todayName];
  const isSkipToday = todayStatus === 'skip';

  // Check if habit can be completed today
  const isEnabled = habit.enabled ?? true;
  const canComplete = !isCompleteToday && !isSkipToday && isEnabled && isDayScheduled;

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
  const baseClassName = `${
    isCompleteToday ? 'opacity-60' : isRestDay ? 'opacity-40 grayscale' : 'hover:shadow-md'
  } relative overflow-hidden transition-shadow py-3 gap-3`;

  return (
    <div>
      <Card className={baseClassName}>
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} ${isCompleteToday ? 'opacity-0' : 'opacity-80'}`}
          aria-hidden
        />

        {/* Top row: title on left, menu on right */}
        <CardHeader className="pb-1 px-4">
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
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return nextDayIndex !== -1 ? dayNames[nextDayIndex] : 'Next week';
                      })()
                    : 'Next week'}
                </p>
              )}
            </div>

            {/* Action menu - top right */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More options" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} disabled={loading}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {!isCompleteToday && !isRestDay && onSkip && (
                  <DropdownMenuItem
                    disabled={loading || skipping}
                    onClick={() => {
                      onSkip();
                    }}
                  >
                    <MinusCircle className="h-4 w-4 mr-2" />
                    Skip Today
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setConfirmOpen(true)}
                      disabled={deleting}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Top content area */}
        <CardContent className="pt-1 px-4">
          <div className="flex items-center gap-4">
            {/* Left side: Streaks info (moved from bottom) */}
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Streaks</div>
                <div className="mt-1 flex items-center gap-3 text-sm md:text-base">
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
                {showStreaks && weekStatus && (
                  <div className="mt-1 flex items-center gap-1.5">
                    {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => {
                      const status = weekStatus[day as keyof typeof weekStatus] as string | undefined;

                      if (!status || status === 'not_applicable') {
                        return <span key={day} className="size-5 rounded-full bg-slate-200 dark:bg-slate-700" />;
                      }

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
                )}
              </div>
            </div>

            {/* Right side: Complete checkbox (fixed width to prevent reflow) */}
            <div className="flex items-center justify-center w-11 flex-shrink-0">
              {onComplete && !isCompleteToday && !isRestDay ? (
                <Button
                  onClick={onComplete}
                  disabled={loading || completing || !canComplete}
                  size="icon"
                  className="relative h-10 w-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Mark complete"
                  title={
                    !canComplete ? (!isEnabled ? 'Habit is disabled' : 'Not scheduled for today') : 'Mark complete'
                  }
                >
                  <Check className={`size-5 transition-opacity ${completing ? 'opacity-0' : 'opacity-100'}`} />
                  <Spinner
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ${completing ? 'opacity-100' : 'opacity-0'}`}
                    size="md"
                    variant="rays"
                  />
                </Button>
              ) : isCompleteToday ? (
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="h-10 w-10" />
              )}
            </div>
          </div>
        </CardContent>

        {/* Confirm deletion dialog */}
        {onDelete ? (
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              onDelete();
            }}
            title="Delete this habit?"
            description="This action cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            confirmVariant="destructive"
            loading={!!deleting}
          />
        ) : null}

        {/* Bottom section: Details accordion (Schedule + Stake) */}
        <CardContent className="px-4">
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <details className="group">
              <summary className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center justify-start gap-2 py-1">
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                <span className="text-xs text-slate-500 group-open:hidden">Show details</span>
                <span className="text-xs text-slate-500 hidden group-open:inline">Hide details</span>
              </summary>
              <div className="mt-2 space-y-3">
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
                      <span className="text-amber-600">• {timeLeftLabel} left</span>
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
                  </div>
                </div>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HabitCard;
