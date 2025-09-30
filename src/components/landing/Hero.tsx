import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClaims } from '@/lib/auth/providers';
import { Rocket, ArrowRight } from 'lucide-react';

export default function Hero() {
  const [signing, setSigning] = useState(false);
  const [t, v] = useClaims();
  const isAuthed = t === 'ok' && v[0] && v[1]?.value.isAuthed;

  function onPrimary() {
    setSigning(true);
    if (isAuthed) window.location.assign('/app');
    else window.location.assign('/api/logto/sign-in');
  }

  return (
    <section className="relative overflow-hidden" data-reveal>
      <div
        className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-violet-500/10"
        aria-hidden="true"
      />
      <div className="container relative z-10 mx-auto px-4 max-w-5xl pt-14 pb-10 sm:pt-20 sm:pb-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <Image
              src="/mascot.svg"
              alt="LazyTax sloth mascot"
              width={360}
              height={320}
              priority
              className="h-52 sm:h-64 w-auto mx-auto mb-4 md:hidden"
            />
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white text-center md:text-left">
              Build habits that stick — if you miss, help a cause.
            </h1>
            <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg lg:text-lg text-justify md:text-left">
              Set daily or weekly habits and stake money. Check in to keep your streak. Miss a check‑in, and the amount
              you set helps a cause you choose. <sup aria-label="footnote">[1]</sup>
            </p>

            <div className="mt-6 flex">
              <Button
                onClick={onPrimary}
                disabled={signing}
                className="h-12 min-w-[220px] px-7 text-base font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 shadow-lg hover:shadow-xl ring-1 ring-white/20 dark:ring-white/10 rounded-xl transition-all"
              >
                <Rocket className="mr-2 h-5 w-5" />
                {signing ? 'Redirecting…' : isAuthed ? 'Open your app' : 'Start your first habit'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="mt-3 flex justify-center md:justify-start">
              <a
                href="#how-it-works"
                className="inline-flex items-center text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                See how it works →
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Badge
                variant="secondary"
                className="bg-orange-500/15 text-orange-700 border border-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-900/40"
              >
                Payments via Airwallex
              </Badge>
              <Badge
                variant="secondary"
                className="bg-violet-500/15 text-violet-700 border border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-900/40"
              >
                Pledge‑powered giving
              </Badge>
            </div>
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
                src="/mascot.svg"
                alt="LazyTax sloth mascot"
                width={520}
                height={400}
                priority
                className="h-auto w-[85%] max-w-[560px] object-contain drop-shadow-md animate-float-slow"
              />
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          [1] LazyTax is the donor; you won’t receive a tax receipt. 100% of the amount you set goes to your selected
          cause after payment (Airwallex) and donation (Pledge) fees. LazyTax receives 0% and is not affiliated with
          Airwallex or Pledge.
        </p>
      </div>
    </section>
  );
}
