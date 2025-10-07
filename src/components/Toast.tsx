import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  durationMs?: number;
  onDone?: () => void;
}

export default function Toast({ message, durationMs = 1800, onDone }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(() => onDone?.(), durationMs);
    return () => clearTimeout(id);
  }, [durationMs, onDone]);

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none" aria-hidden>
      <style>{`
        @keyframes toast-pop {
          0% { transform: translateY(-8px) scale(0.98); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
      <div className="flex justify-center mt-6">
        <output
          className="pointer-events-auto bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 rounded-full shadow-lg px-4 py-2 text-sm"
          style={{ animation: 'toast-pop 220ms ease-out both' }}
          aria-live="polite"
        >
          {message}
        </output>
      </div>
    </div>
  );
}
