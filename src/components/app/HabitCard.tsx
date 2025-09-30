import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HabitVersionRes } from '@/clients/alcohol/zinc/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Clock, DollarSign, Check, Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: HabitVersionRes;
  charityName?: string | null;
  loading?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

function toHM(t?: string | null): string {
  if (!t) return '';
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  return '';
}

function scheduleSummary(days?: string[] | null): string {
  const d = days ?? [];
  if (d.length === 7) return 'Everyday';
  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  if (d.length === 5 && weekdays.every(x => d.includes(x))) return 'Weekdays';
  if (d.length === 0) return 'No schedule';
  return `${d.length} days/week`;
}

export function HabitCard({ habit, charityName, loading, onEdit, onComplete, onDelete }: HabitCardProps) {
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

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-80`} aria-hidden />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="mt-0.5 h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden"
              aria-hidden
            >
              <Image src="/logo-source.svg" alt="LazyTax logo" width={24} height={24} className="h-4 w-auto" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{habit.task || 'Untitled habit'}</CardTitle>
              {/* Group 1: Schedule */}
              <div className="mt-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Schedule</div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {time || '--:--'}
                  </span>
                  <span className="text-slate-400">•</span>
                  {(() => {
                    const s = scheduleSummary(habit.daysOfWeek as string[]);
                    return s === 'Everyday' ? (
                      <Badge className="px-2 py-0.5 text-[10px]">Everyday</Badge>
                    ) : (
                      <span>{s}</span>
                    );
                  })()}
                </div>
              </div>

              {/* Group 2: Stake & Charity */}
              {stake > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Stake</div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    ${habit.stake} USD {charityName ? <span className="text-slate-500">to</span> : null}{' '}
                    <span className="font-medium">{charityName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main CTA: green tick */}
          {onComplete && (
            <Button
              onClick={onComplete}
              disabled={loading}
              size="icon"
              className="mt-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
              aria-label="Mark complete"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        {/* Secondary actions: edit/delete */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2">
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
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                aria-label="Delete habit"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HabitCard;
