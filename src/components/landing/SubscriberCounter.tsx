import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LottieAnimation from '@/components/lottie/LottieAnimation';
import { PartyPopper, Rocket, Flame, Megaphone, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrackingEvents } from '@/lib/events';
import { usePlausible } from 'next-plausible';

type SubsResponse = { ok: true; count: number; goal: number } | { ok: false; error: string };

const fetcher = async (url: string): Promise<SubsResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as SubsResponse;
};

function emojiFor(percent: number): string {
  if (percent >= 100) return '🎉';
  if (percent >= 90) return '🏁';
  if (percent >= 75) return '🥁';
  if (percent >= 50) return '🔥';
  if (percent >= 25) return '🚀';
  return '🌱';
}

export default function SubscriberCounter() {
  const { data, error, isLoading } = useSWR<SubsResponse>('/api/subscribers', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
  const { mutate } = useSWRConfig();
  const track = usePlausible();

  const goal = data && 'ok' in data && data.ok ? data.goal : 100;
  const targetCount = data && 'ok' in data && data.ok ? data.count : 0;
  const percent = useMemo(
    () => Math.min(100, Math.round((targetCount / Math.max(1, goal)) * 100)),
    [targetCount, goal],
  );

  // Fun animated count-up
  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Keep a ref of the displayed value to avoid depending on it in effects
  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    const from = displayedRef.current;
    const to = targetCount;
    if (from === to) return;
    const diff = Math.abs(to - from);
    const duration = Math.min(1200, 200 + diff * 30); // quick but punchy
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(from + (to - from) * eased);
      setDisplayed(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetCount]);

  const funEmoji = emojiFor(percent);
  const reached = percent >= 100;

  // CTA form state
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function validateEmail(v: string) {
    return /\S+@\S+\.\S+/.test(v);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    track(TrackingEvents.Landing.CommunityCTA.SubmitClicked);
    setMsg(null);
    if (!validateEmail(email)) {
      setMsg({ type: 'error', text: 'Please enter a valid email.' });
      track(TrackingEvents.Landing.CommunityCTA.ClientInvalid);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source: 'community-goal' }),
      });
      const data: { ok?: boolean; error?: string } = await res.json();
      if (data?.ok) {
        setMsg({ type: 'success', text: 'You are on the list! Thanks for the boost.' });
        setEmail('');
        track(TrackingEvents.Landing.CommunityCTA.Success);
        // Refresh the counter immediately
        mutate('/api/subscribers');
      } else if (res.status === 409 || data?.error === 'already_subscribed') {
        setMsg({ type: 'error', text: 'You have already subscribed' });
        track(TrackingEvents.Landing.CommunityCTA.AlreadySubscribed);
        // Optional: still refresh in case of prior race conditions
        mutate('/api/subscribers');
      } else {
        setMsg({ type: 'error', text: 'Something looks off. Try again.' });
        track(TrackingEvents.Landing.CommunityCTA.ServerInvalid);
      }
    } catch {
      setMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
      track(TrackingEvents.Landing.CommunityCTA.Error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-6 sm:py-8" aria-label="Community goal progress" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <Card className="bg-gradient-to-tr from-orange-500/10 via-transparent to-violet-500/10 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              {reached ? (
                <PartyPopper className="h-5 w-5 text-orange-500" aria-hidden />
              ) : percent >= 50 ? (
                <Flame className="h-5 w-5 text-orange-500" aria-hidden />
              ) : (
                <Rocket className="h-5 w-5 text-violet-600" aria-hidden />
              )}
              Community Goal
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              We’ll donate $100 live on stream when we reach 100 waitlisters.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Big fun number */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-baseline gap-2" aria-live="polite">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-violet-700 bg-clip-text text-transparent">
                  {isLoading ? '…' : displayed}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/ {goal}</span>
                <span className="ml-1 text-2xl" aria-hidden>
                  {funEmoji}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {reached ? (
                  <>
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Goal reached — thank you!</span>
                  </>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4 text-violet-600" />
                    <span>Help us get there!</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-3 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 transition-[width] duration-700 ease-out"
                style={{ width: `${percent}%` }}
                aria-hidden
              />
            </div>

            {/* Celebration */}
            {reached ? (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10">
                  <LottieAnimation animationName="success" loop={false} />
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  We did it! Tune in for the $100 donation livestream 🎥💚
                </p>
              </div>
            ) : error ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">Couldn’t load the counter. Try again soon.</p>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                You’re {Math.max(0, goal - targetCount)} away from unlocking a $100 live donation.
              </p>
            )}

            {/* Inline CTA */}
            <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center max-w-md">
              <label htmlFor="goal-email" className="sr-only">
                Email address
              </label>
              <Input
                id="goal-email"
                type="email"
                inputMode="email"
                placeholder="you@work.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 w-full sm:w-80 bg-white/90 dark:bg-slate-900/80"
                required
                aria-invalid={msg?.type === 'error'}
              />
              <Button
                type="submit"
                disabled={submitting || !validateEmail(email)}
                className="h-11 px-6 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white"
              >
                {submitting ? 'Joining…' : 'Join the waitlist'}
              </Button>
            </form>
            {msg && (
              <p
                role={msg.type === 'error' ? 'alert' : undefined}
                className={`mt-2 text-sm ${msg.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}
              >
                {msg.text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
