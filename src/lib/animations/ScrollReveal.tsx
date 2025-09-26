'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduce || els.length === 0) return;

    for (const el of els) {
      el.classList.add('reveal');
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    for (const el of els) {
      io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return null;
}
