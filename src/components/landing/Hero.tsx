import type React from 'react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrackingEvents } from '@/lib/events';
import { usePlausible } from 'next-plausible';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function Hero() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const disabled = useMemo(() => submitting || !validateEmail(email), [email, submitting]);

  const track = usePlausible();

  async function onSubmit(e: React.FormEvent) {
    track(TrackingEvents.Landing.MainCTA.SubmitClicked);
    e.preventDefault();
    setMessage(null);
    if (!validateEmail(email)) {
      track(TrackingEvents.Landing.MainCTA.ClientInvalid);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source: 'hero' }),
      });
      const data: { ok?: boolean; error?: string } = await res.json();
      if (data?.ok) {
        setMessage({ type: 'success', text: 'You are on the list! We will be in touch soon.' });
        setEmail('');
        track(TrackingEvents.Landing.MainCTA.Success);
      } else if (res.status === 409 || data?.error === 'already_subscribed') {
        setMessage({ type: 'error', text: 'You have already subscribed' });
        track(TrackingEvents.Landing.MainCTA.AlreadySubscribed);
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid email and try again.' });
        track(TrackingEvents.Landing.MainCTA.ServerInvalid);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
      track(TrackingEvents.Landing.MainCTA.Error);
    } finally {
      setSubmitting(false);
    }
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

            <form
              onSubmit={onSubmit}
              className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center max-w-md mx-auto md:mx-0"
              aria-label="Join the waitlist"
            >
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@work.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 w-full sm:w-80 bg-white/90 dark:bg-slate-900/80"
                required
                aria-invalid={message?.type === 'error'}
              />
              <Button
                type="submit"
                disabled={disabled}
                className="h-11 px-6 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
              >
                {submitting ? 'Joining…' : 'Join the waitlist'}
              </Button>
            </form>
            <div className="mt-3 flex justify-center md:justify-start">
              <a
                href="#how-it-works"
                className="inline-flex items-center text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                See how it works →
              </a>
            </div>
            {message && (
              <p
                role={message.type === 'error' ? 'alert' : undefined}
                className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}
              >
                {message.text}
              </p>
            )}

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
              <span className="text-xs">Early access: priority invite + 50% off for life if we launch Pro.</span>
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
