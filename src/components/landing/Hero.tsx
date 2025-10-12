import type React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Removed email collection — switched to a simple CTA based on auth state
import { useClaims } from '@/lib/auth/providers';
import { ArrowRight, Rocket } from 'lucide-react';

export default function Hero() {
  const [t, v] = useClaims();
  const isAuthed = t === 'ok' && v[0] && v[1]?.value.isAuthed;
  const ctaLabel = isAuthed ? 'Open your app' : 'Get started';
  const ctaHref = isAuthed ? '/app' : '/api/logto/sign-in';

  return (
    <section className="relative overflow-hidden" data-reveal>
      <div
        className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-violet-500/10"
        aria-hidden="true"
      />
      <div className="container relative z-10 mx-auto px-6 sm:px-8 max-w-5xl pt-14 pb-10 sm:pt-20 sm:pb-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <Image
              src="/images/finally-a-habit-tracker-fs8.png"
              alt="LazyTax habit tracker preview"
              width={640}
              height={520}
              priority
              className="w-full max-w-[420px] h-auto mx-auto mb-4 rounded-xl shadow-lg md:hidden"
            />
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white text-center md:text-left">
              Finally, a habit tracker{' '}
              <span className="relative inline-block whitespace-nowrap">
                that works
                <svg
                  className="absolute left-0 -bottom-1 w-full h-3 text-orange-500/60 animate-underline"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 4 L200 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                  />
                  <path
                    d="M25 9 L165 9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="140"
                    strokeDashoffset="140"
                    className="opacity-0 animate-underline-fade"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg lg:text-lg text-center md:text-left">
              Simple daily check-ins. Optional stakes that donate to charity. Rewards when you succeed.
            </p>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg lg:text-lg text-center md:text-left">
              Get started in under a minute.
            </p>

            <div className="mt-6 flex justify-center md:justify-start">
              <Button
                asChild
                className="h-12 min-w-[220px] px-7 text-base font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 shadow-lg hover:shadow-xl ring-1 ring-white/20 dark:ring-white/10 rounded-xl transition-all"
              >
                <a href={ctaHref} className="inline-flex items-center">
                  <Rocket className="mr-2 h-5 w-5" />
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
              <a
                href="#how-it-works"
                className="inline-flex items-center text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                See how it works →
              </a>
              <a
                href="#references"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Backed by Research
              </a>
            </div>
            {/* No email capture — simplified CTA only */}
          </div>

          <div className="relative min-h-48 sm:min-h-64 md:min-h-72 hidden md:block">
            <div
              className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-500/20 dark:bg-orange-500/15 blur-3xl pointer-events-none -z-10 animate-blob-slow"
              aria-hidden
            />
            <div
              className="absolute -left-8 -bottom-10 h-56 w-56 rounded-full bg-violet-500/20 dark:bg-violet-500/15 blur-3xl pointer-events-none -z-10 animate-blob-slow"
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/finally-a-habit-tracker-fs8.png"
                alt="LazyTax habit tracker preview"
                width={960}
                height={640}
                priority
                className="h-auto w-full max-w-[520px] object-contain drop-shadow-xl rounded-2xl animate-float-slow"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
