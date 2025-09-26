import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function FinalCTA() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const disabled = useMemo(() => submitting || !validateEmail(email), [email, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!validateEmail(email)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source: 'final-cta', utm: null }),
      });
      const data: { ok?: boolean } = await res.json();
      if (data?.ok) {
        setMessage({ type: 'success', text: 'You are on the list! We will be in touch soon.' });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid email and try again.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-orange-500/10 to-violet-500/10 p-8 sm:p-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Get early access
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Join the waitlist for priority invites and 50% off for life if we launch Pro.
          </p>
          <form
            onSubmit={onSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center"
            aria-label="Join the waitlist"
          >
            <label htmlFor="email-final" className="sr-only">
              Email address
            </label>
            <Input
              id="email-final"
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
          {message && (
            <p
              role={message.type === 'error' ? 'alert' : undefined}
              className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
