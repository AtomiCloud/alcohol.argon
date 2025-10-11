'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduceMotion || elements.length === 0) return;

    const revealImmediately = () => {
      for (const el of elements) {
        el.classList.add('reveal-visible');
      }
    };

    try {
      for (const el of elements) {
        el.classList.add('reveal');
      }

      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
              observer.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
      );

      for (const el of elements) {
        observer.observe(el);
      }

      // Ensure elements already in view become visible even if intersection doesn't fire immediately
      requestAnimationFrame(() => {
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('reveal-visible');
            observer.unobserve(el);
          }
        }
      });

      return () => observer.disconnect();
    } catch (error) {
      console.error('Scroll reveal failed', error);
      revealImmediately();
    }
  }, []);

  return null;
}
