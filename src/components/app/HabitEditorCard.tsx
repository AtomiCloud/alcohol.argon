import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, X, ChevronDown, ChevronRight } from 'lucide-react';
import CharitySelector from '@/components/app/CharitySelector';
import { WEEKDAYS } from '@/models/habit';

type HabitDraftLike = {
  task: string;
  daysOfWeek: string[];
  notificationTime: string; // HH:mm
  amount: string;
  charityId: string;
};

type CharityOpt = { id: string; label: string };

interface HabitEditorCardProps {
  draft: HabitDraftLike;
  onChange: (next: HabitDraftLike) => void;
  charities: CharityOpt[];
  errors?: Partial<Record<'task' | 'daysOfWeek' | 'amount' | 'charityId' | 'notificationTime', string>>;
  submitted?: boolean;
  onOpenStake: () => void;
  onClearStake: () => void;
}

// WEEKDAYS imported from models

export default function HabitEditorCard({
  draft,
  onChange,
  charities,
  errors = {},
  submitted = false,
  onOpenStake,
  onClearStake,
}: HabitEditorCardProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const toggleWeekday = (key: string) => {
    const cur = draft.daysOfWeek || [];
    const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
    onChange({ ...draft, daysOfWeek: next });
  };

  const handleCharityChange = useCallback(
    (id: string) => {
      onChange({ ...draft, charityId: id });
    },
    [onChange, draft],
  );

  // Charity combobox is now a reusable component

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Habit */}
        <div>
          <label className="block text-sm mb-1" htmlFor="habit-task">
            Habit
          </label>
          <Input
            id="habit-task"
            placeholder="e.g., Read 15 minutes"
            value={draft.task}
            onChange={e => onChange({ ...draft, task: e.target.value })}
            className="h-14 text-base"
          />
          {errors.task && (submitted || draft.task.trim().length > 0) && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.task}</p>
          )}
        </div>

        {/* Stake */}
        <div className="flex flex-col items-start text-left">
          <div className="text-sm text-slate-700 dark:text-slate-200 mb-1">Stake (optional)</div>
          {!draft.amount || Number(draft.amount) === 0 ? (
            <Button
              size="lg"
              onClick={onOpenStake}
              className="w-full h-14 text-base bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            >
              <Heart className="h-5 w-5 mr-2" /> Set amount
            </Button>
          ) : (
            <div className="flex flex-row items-center justify-start gap-2 w-full">
              <div className="flex-1 h-14 flex items-center rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3">
                <Heart className="h-4 w-4 mr-2" />
                <span className="tabular-nums text-base">{draft.amount}</span>
                <span className="ml-2 text-xs opacity-80">USD</span>
              </div>
              <Button variant="outline" size="sm" onClick={onOpenStake} aria-label="Change stake" className="h-10">
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClearStake} aria-label="Clear stake" className="h-10 w-10">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {errors.amount && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{errors.amount}</p>}
        </div>
      </div>

      {/* Advanced toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setAdvancedOpen(s => !s)}
          className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
        >
          {advancedOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Advanced (optional)
        </button>
      </div>

      {advancedOpen && (
        <div className="space-y-4 rounded-lg border p-3 border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <p className="block text-sm">Days of week</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map(d => {
                const active = (draft.daysOfWeek || []).includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleWeekday(d.key)}
                    className={`text-[11px] rounded-md border px-2.5 py-1 transition-colors cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-pink-500'
                        : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(() => {
                const presets = [
                  { k: 'Everyday', v: WEEKDAYS.map(w => w.key) },
                  { k: 'Weekdays', v: WEEKDAYS.slice(0, 5).map(w => w.key) },
                  { k: 'Weekends', v: WEEKDAYS.slice(5).map(w => w.key) },
                  { k: 'Clear', v: [] as string[] },
                ] as const;
                const setEq = (a: string[], b: string[]) => {
                  if (a.length !== b.length) return false;
                  const sa = new Set(a);
                  for (const x of b) if (!sa.has(x)) return false;
                  return true;
                };
                const activeStyles: Record<string, string> = {
                  Everyday:
                    'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 shadow-sm hover:brightness-105',
                  Weekdays:
                    'bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-indigo-600 shadow-sm hover:brightness-105',
                  Weekends:
                    'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-rose-600 shadow-sm hover:brightness-105',
                  Clear:
                    'bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-700 shadow-sm hover:brightness-105',
                };
                const inactive =
                  'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                return presets.map(preset => {
                  const active = setEq(draft.daysOfWeek, preset.v);
                  const cls = active ? activeStyles[preset.k] : inactive;
                  return (
                    <button
                      key={preset.k}
                      type="button"
                      onClick={() => onChange({ ...draft, daysOfWeek: preset.v })}
                      className={`text-[11px] rounded-full border px-3 py-1 cursor-pointer transition-colors ${cls}`}
                    >
                      {preset.k}
                    </button>
                  );
                });
              })()}
            </div>
            {errors.daysOfWeek && <p className="text-xs text-red-600 dark:text-red-400">{errors.daysOfWeek}</p>}
          </div>

          {draft.amount && Number(draft.amount) > 0 && (
            <CharitySelector
              value={draft.charityId}
              options={charities}
              onChange={handleCharityChange}
              error={errors.charityId}
            />
          )}
        </div>
      )}
    </div>
  );
}
