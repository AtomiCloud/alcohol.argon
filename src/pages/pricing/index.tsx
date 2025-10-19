import Head from 'next/head';
import Link from 'next/link';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import Pricing from '@/components/landing/Pricing';
import { Button } from '@/components/ui/button';
import { SignInCTA } from '@/components/ui/sign-in-cta';

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>LazyTax Pricing — Plans for Every Habit Builder</title>
        <meta
          name="description"
          content="Compare LazyTax plans and choose the accountability and support level that fits your habit goals."
        />
      </Head>
      <ScrollReveal />
      <section
        className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-violet-100 via-white to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        data-reveal
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.15),_transparent_55%)]" />
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center space-y-6">
          <span className="inline-flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-300 ring-1 ring-violet-500/30 dark:ring-violet-500/40">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            Plans that grow with your habits
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Start for free, add optional stakes when you are ready, and scale up to unlock freezes, analytics, and
            deeper guardrails. We keep everything flexible, transparent, and aligned with lasting behavior change.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignInCTA size="lg">Get started</SignInCTA>
            <Button asChild size="lg" variant="outline">
              <Link href="/why-lazytax">See why LazyTax works</Link>
            </Button>
          </div>
        </div>
      </section>
      <Pricing />
      <section className="py-16 sm:py-20" data-reveal>
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Still deciding? Talk to the team.
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            We love helping people build systems that stick. Email{' '}
            <a className="underline decoration-violet-400/50 underline-offset-4" href="mailto:hello@lazytax.club">
              hello@lazytax.club
            </a>{' '}
            and we&apos;ll help you figure out the right plan for your routines.
          </p>
          <Button asChild variant="outline" size="lg">
            <a href="mailto:hello@lazytax.club">Contact support</a>
          </Button>
        </div>
      </section>
    </>
  );
}
