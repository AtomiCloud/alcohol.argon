import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HabitVersionRes } from '@/clients/alcohol/zinc/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Clock, DollarSign, Check, Trash2, Flame, Crown } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface HabitCardProps {
  habit: HabitVersionRes;
  charityName?: string | null;
  loading?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  completing?: boolean;
  deleting?: boolean;
  showStreaks?: boolean;
}

function toHM(t?: string | null): string {
  if (!t) return '';
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  return '';
}

function scheduleSummary(days?: string[] | null): string {
  const d = days ?? [];
  if (d.length === 0) return 'No schedule';
  const order = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const weekends = ['SATURDAY', 'SUNDAY'];
  if (d.length === 7) return 'Everyday';
  if (d.length === 5 && weekdays.every(x => d.includes(x))) return 'Weekdays';
  if (d.length === 2 && weekends.every(x => d.includes(x))) return 'Weekends';
  const short: Record<(typeof order)[number], string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };
  const selected = order.filter(k => d.includes(k)).map(k => short[k]);
  return selected.join(', ');
}

export function HabitCard({
  habit,
  charityName,
  loading,
  onEdit,
  onComplete,
  onDelete,
  completing,
  deleting,
  showStreaks = false,
}: HabitCardProps) {
  const time = toHM(habit.notificationTime || '');
  const stake = Number.parseFloat(habit.stake || '0');
  const palette = [
    'from-emerald-400 via-teal-400 to-cyan-400',
    'from-orange-400 via-fuchsia-400 to-violet-500',
    'from-blue-500 via-indigo-400 to-purple-500',
    'from-pink-500 via-rose-400 to-orange-400',
  ];
  const idx =
    Math.abs((habit.habitId || habit.id || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length;
  const gradient = palette[idx];
  // use brand logo instead of arbitrary emojis

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

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-80`} aria-hidden />

      {/* Wrapper for top half (header + info) to center the complete button */}
      <div className="relative">
        {/* Top row: title on left */}
        <CardHeader className="pb-1">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden text-base"
              aria-hidden
            >
              <span aria-hidden>{guessEmoji(habit.task)}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold truncate leading-tight">
              {habit.task || 'Untitled habit'}
            </h2>
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
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {time || '--:--'}
                  </span>
                  <span className="text-slate-400">•</span>
                  {(() => {
                    const s = scheduleSummary(habit.daysOfWeek as string[]);
                    return <Badge className="px-2 py-0.5 text-[10px]">{s}</Badge>;
                  })()}
                </div>
              </div>

              {/* Stake block */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Stake</div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {stake > 0 ? (
                    <Badge className="px-2 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-900/40">
                      ${habit.stake} USD {charityName ? `→ ${charityName}` : ''}
                    </Badge>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {onComplete ? (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <Button
              onClick={onComplete}
              disabled={loading || completing}
              size="icon"
              className="relative h-12 w-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
              aria-label="Mark complete"
              title="Mark complete"
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

      {/* Bottom row: streak/week + actions */}
      <CardContent>
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {showStreaks ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(k => (
                  <span key={k} className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-4 w-4 text-amber-500" /> 0
                </span>
                <span className="inline-flex items-center gap-1">
                  <Crown className="h-4 w-4 text-amber-500" /> 0
                </span>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Secondary actions */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} disabled={loading} aria-label="Edit habit">
                <Edit className="h-4 w-4 mr-1" /> Edit
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
  );
}

export default HabitCard;
