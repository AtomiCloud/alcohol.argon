import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatCentsToAmount } from '@/lib/utility/habit-utils';

interface StakeSheetProps {
  open: boolean;
  amountCents: string;
  onAppend: (k: string) => void;
  onQuick: (dollars: number) => void;
  onClear: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function StakeSheet({ open, amountCents, onAppend, onQuick, onClear, onClose, onConfirm }: StakeSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <style>{`
        @keyframes sheet-up { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onClose();
        }}
        role="button"
        tabIndex={0}
        aria-hidden
        style={{ animation: 'fade-in 160ms ease-out both' }}
      />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md mx-auto overflow-hidden"
          style={{ animation: 'sheet-up 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both' }}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 relative text-center">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Enter Stake (USD $)</div>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-center">
              <div className="inline-flex items-baseline gap-1 text-3xl font-semibold">
                <span className="text-emerald-600">$</span>
                <span className="tabular-nums">{formatCentsToAmount(amountCents)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">USD</span>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {[1, 5, 10, 20].map(v => (
                <button
                  key={v}
                  className="text-xs rounded-full border px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  onClick={() => onQuick(v)}
                  type="button"
                >
                  {`$${v}`}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫', 'C'].map(k => (
                <button
                  key={k}
                  className="h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => onAppend(k)}
                  type="button"
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                className="text-xs text-slate-600 dark:text-slate-300 hover:underline"
                onClick={onClear}
                type="button"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} size="sm" type="button">
                  Cancel
                </Button>
                <Button onClick={onConfirm} size="sm" type="button">
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StakeSheet;
