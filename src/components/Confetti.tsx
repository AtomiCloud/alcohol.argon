import type React from 'react';
import { useEffect } from 'react';

interface ConfettiProps {
  count?: number;
  durationMs?: number;
  onDone?: () => void;
}

// A lightweight celebratory burst animation
// Defaults are quick and punchy for better UX
export function Confetti({ count = 160, durationMs = 900, onDone }: ConfettiProps) {
  useEffect(() => {
    const id = setTimeout(() => onDone?.(), durationMs + 150);
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
        @keyframes confetti-burst {
          0% { transform: translate(-50%, -50%) scale(0.6) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      {pieces.map((_, i) => {
        const angle = Math.random() * Math.PI * 2; // radians
        const distance = 32 + Math.random() * 42; // vw/vh units mixed
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const isCircle = Math.random() < 0.35;
        const size = 6 + Math.random() * 8; // px
        const delay = Math.random() * 120; // ms
        const dur = durationMs - Math.random() * 200; // ms
        const color = colors[(i + Math.floor(Math.random() * colors.length)) % colors.length];
        const rot = `${(Math.random() * 960 - 480).toFixed(0)}deg`;
        type ConfettiStyle = React.CSSProperties & { '--tx'?: string; '--ty'?: string; '--rot'?: string };
        const style: ConfettiStyle = {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size,
          height: isCircle ? size : size * (0.6 + Math.random() * 0.9),
          backgroundColor: color,
          borderRadius: isCircle ? size : 2,
          opacity: 0,
          animation: `confetti-burst ${dur}ms cubic-bezier(0.15, 0.85, 0.25, 1) forwards`,
          animationDelay: `${delay}ms`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
          // Use viewport units to ensure pieces leave the screen quickly
          // ty uses vh; tx uses vw to create a radial scatter
          '--tx': `calc(${tx.toFixed(1)}vw - 50%)`,
          '--ty': `calc(${ty.toFixed(1)}vh - 50%)`,
          '--rot': rot,
        };
        const key = `${i}-${color}-${size}-${delay}`;
        return <span key={key} style={style} />;
      })}
    </div>
  );
}

export default Confetti;
