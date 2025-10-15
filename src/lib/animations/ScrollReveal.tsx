'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ScrollReveal() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle hash fragment scrolling on load and hash changes
    const scrollToHash = (smooth = false) => {
      const hash = window.location.hash;
      if (!hash) return;

      // Wait for DOM to be ready and layout to settle
      const attemptScroll = () => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'start',
          });
          // Immediately reveal the target element to avoid animation conflicts
          if (element instanceof HTMLElement) {
            element.classList.add('reveal-visible');
          }
        }
      };

      // Use multiple animation frames to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(attemptScroll);
      });
    };

    // Scroll to hash on initial page load (no smooth scroll)
    scrollToHash(false);

    // Handle Next.js router navigation with hash
    const handleRouteChange = (url: string) => {
      // Extract hash from the URL
      if (url.includes('#')) {
        // Give the page time to render before scrolling
        setTimeout(() => scrollToHash(true), 100);
      }
    };

    // Scroll to hash when clicking hash links (with smooth scroll)
    const handleHashChange = () => scrollToHash(true);

    window.addEventListener('hashchange', handleHashChange);
    router.events.on('routeChangeComplete', handleRouteChange);

    if (typeof IntersectionObserver === 'undefined') {
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduceMotion || elements.length === 0) {
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }

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

      return () => {
        observer.disconnect();
        window.removeEventListener('hashchange', handleHashChange);
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    } catch (error) {
      console.error('Scroll reveal failed', error);
      revealImmediately();
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.events]);

  return null;
}
