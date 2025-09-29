import type React from 'react';
import { useEffect } from 'react';

interface ConfettiProps {
  count?: number;
  durationMs?: number;
  onDone?: () => void;
}

export function Confetti({ count = 120, durationMs = 2200, onDone }: ConfettiProps) {
  useEffect(() => {
    const id = setTimeout(() => onDone?.(), durationMs + 300);
    return () => clearTimeout(id);
  }, [durationMs, onDone]);

  const pieces = Array.from({ length: count });
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#a78bfa'];

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      aria-hidden
      role="presentation"
      data-slot="confetti-overlay"
    >
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(() => {
        const left = Math.random() * 100; // percent
        const size = 6 + Math.random() * 6; // px
        const delay = Math.random() * 400; // ms
        const dur = durationMs - Math.random() * 400; // ms
        const color = colors[Math.floor(Math.random() * colors.length)];
        const skew = Math.random() * 40 - 20;
        const style: React.CSSProperties = {
          position: 'absolute',
          top: '-10vh',
          left: `${left}%`,
          width: size,
          height: size * (0.6 + Math.random() * 0.8),
          backgroundColor: color,
          transform: `skew(${skew}deg)`,
          borderRadius: 2,
          opacity: 0,
          animation: `confetti-fall ${dur}ms ease-in forwards`,
          animationDelay: `${delay}ms`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
        };
        const key = `${Math.floor(left * 10)}-${Math.floor(size * 10)}-${Math.floor(delay)}-${color}`;
        return <span key={key} style={style} />;
      })}
    </div>
  );
}

export default Confetti;
