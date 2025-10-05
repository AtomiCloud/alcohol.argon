import type React from 'react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrackingEvents } from '@/lib/events';
import { usePlausible } from 'next-plausible';
import { useSWRConfig } from 'swr';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function Hero() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const disabled = useMemo(() => submitting || !validateEmail(email), [email, submitting]);

  const track = usePlausible();
  const { mutate } = useSWRConfig();

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
        setMessage({ type: 'success', text: 'Successfully added to waitlist! We will contact you soon.' });
        setEmail('');
        track(TrackingEvents.Landing.MainCTA.Success);
        // Refresh community goal counter
        mutate('/api/subscribers');
      } else if (res.status === 409 || data?.error === 'already_subscribed') {
        setMessage({ type: 'error', text: 'This email is already registered on our waitlist.' });
        track(TrackingEvents.Landing.MainCTA.AlreadySubscribed);
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid email address and try again.' });
        track(TrackingEvents.Landing.MainCTA.ServerInvalid);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
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
              Finally, a habit tracker{' '}
              <span className="relative inline-block whitespace-nowrap">
                that works
                <svg
                  className="absolute left-0 -bottom-1 w-full h-3 text-orange-500/60"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C32 5 68 2 102 4C136 6 172 10 198 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg lg:text-lg text-center md:text-left">
              Simple daily check-ins. Optional stakes that donate to charity. Rewards when you succeed.
            </p>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg lg:text-lg text-center md:text-left">
              Join the waitlist for early access.
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
                {submitting ? 'Joining…' : 'Join the Waitlist'}
              </Button>
            </form>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 text-center md:text-left">
              Join the waitlist to secure your exclusive discount code, lock in launch pricing forever, and help unlock
              our USD $100 charity donation.
            </p>
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
            {message && (
              <p
                role={message.type === 'error' ? 'alert' : undefined}
                className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}
              >
                {message.text}
              </p>
            )}
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
      </div>
    </section>
  );
}
