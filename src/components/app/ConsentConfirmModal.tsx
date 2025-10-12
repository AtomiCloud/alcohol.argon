import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight } from 'lucide-react';

interface ConsentConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Minimal modal used to confirm redirecting into the payment consent flow.
 * Uses lightweight CSS spinner for zero-dependency feedback.
 */
export default function ConsentConfirmModal({
  open,
  title = 'Set up payment consent?',
  description = 'You’ll be redirected to our payment partner to securely add a payment method. This lets you stake and be charged only when you miss a day.',
  confirmLabel = 'Continue',
  cancelLabel = 'Not now',
  loading = false,
  onCancel,
  onConfirm,
}: ConsentConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={open => (!open ? onCancel() : undefined)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="relative text-sm px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 pl-8"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {/* Left icon: shows a static logo when idle; swaps to fast spinning rays when loading */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center">
              {loading ? (
                <Spinner size="xs" variant="rays" className="[animation-duration:500ms]" />
              ) : (
                // Visible continue icon to signify the action
                <ArrowRight className="h-4 w-4" />
              )}
            </span>
            <span>{confirmLabel}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
