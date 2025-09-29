import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HabitVersionRes } from '@/clients/alcohol/zinc/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Edit } from 'lucide-react';

interface HabitCardProps {
  habit: HabitVersionRes;
  charityName?: string | null;
  loading?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
}

function toHM(t?: string | null): string {
  if (!t) return '';
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  return '';
}

function ScheduleBadges({ days }: { days?: string[] | null }) {
  const d = days ?? [];
  const isEveryday = d.length === 7;
  const isWeekdays =
    d.length === 5 && ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].every(x => d.includes(x));
  if (isEveryday) return <Badge className="text-xs">Everyday</Badge>;
  if (isWeekdays) return <Badge className="text-xs">Weekdays</Badge>;
  const DISP = [
    { key: 'SUNDAY', label: 'S' },
    { key: 'MONDAY', label: 'M' },
    { key: 'TUESDAY', label: 'T' },
    { key: 'WEDNESDAY', label: 'W' },
    { key: 'THURSDAY', label: 'T' },
    { key: 'FRIDAY', label: 'F' },
    { key: 'SATURDAY', label: 'S' },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {DISP.filter(x => d.includes(x.key)).map(x => (
        <span
          key={x.key}
          className="text-[10px] rounded-full border px-2 py-0.5 bg-background text-foreground border-input"
        >
          {x.label}
        </span>
      ))}
    </div>
  );
}

export function HabitCard({ habit, charityName, loading, onEdit, onComplete }: HabitCardProps) {
  const time = toHM(habit.notificationTime || '');
  const stake = Number.parseFloat(habit.stake || '0');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{habit.task || 'Untitled habit'}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <ScheduleBadges days={habit.daysOfWeek as string[]} />
              <Badge variant="secondary" className="text-xs">
                {time || '--:--'}
              </Badge>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} disabled={loading}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            {onComplete && (
              <Button onClick={onComplete} disabled={loading} size="sm">
                <Check className="h-4 w-4 mr-1" /> Complete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {stake > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className="text-xs">${habit.stake} USD</Badge>
            <span className="text-slate-500 dark:text-slate-400">•</span>
            <span className="text-slate-700 dark:text-slate-300">{charityName || 'Charity'}</span>
          </div>
        )}

        <div className="mt-3 md:hidden grid grid-cols-2 gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} disabled={loading}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
          {onComplete && (
            <Button onClick={onComplete} disabled={loading} size="sm">
              <Check className="h-4 w-4 mr-1" /> Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default HabitCard;
