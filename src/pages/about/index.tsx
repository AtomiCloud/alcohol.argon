import Head from 'next/head';
import Link from 'next/link';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import HowWeMakeMoney from '@/components/landing/HowWeMakeMoney';
import StakesExplained from '@/components/landing/StakesExplained';
import Transparency from '@/components/landing/Transparency';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About LazyTax — Accountability Built by Habit Nerds</title>
        <meta
          name="description"
          content="Learn how LazyTax helps people build habits that stick, the principles we follow, and the team behind the product."
        />
      </Head>
      <ScrollReveal />
      <section
        className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-orange-100 via-white to-violet-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        data-reveal
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_55%)]" />
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center space-y-6">
          <span className="inline-flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-300 ring-1 ring-violet-500/30 dark:ring-violet-500/40">
            About
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            We build guardrails that make good habits inevitable
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            LazyTax started as a personal system for staying accountable without shame or overwhelm. Today we help
            thousands of people layer gentle stakes, earned flexibility, and celebration into the habits that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/why-lazytax">See why it works</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pricing">Explore pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" data-reveal>
        <div className="container mx-auto px-6 sm:px-8 max-w-5xl grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Our mission</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Build the most compassionate accountability system on earth. We believe change sticks when you combine
              lightweight habits, transparent stakes, and meaningful celebration. LazyTax provides the rails so you can
              focus on doing the reps.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Every product decision is measured against one question: will this help you stay consistent on your best
              days <em>and</em> protect you on the hectic ones? If the answer is no, it doesn&apos;t ship.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">How we ship</h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
              <li className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-900 dark:text-white">Evidence-first.</span> We lean on
                behavioural science, coaching research, and 1:1 interviews to guide the roadmap.
              </li>
              <li className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-900 dark:text-white">Small loops.</span> Weekly releases keep
                the product evolving while protecting your streaks.
              </li>
              <li className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-900 dark:text-white">Transparent impact.</span> When you miss
                and donate, 100% goes to the charity you choose—receipts are published publicly.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <HowWeMakeMoney />
      <StakesExplained />
      <Transparency />

      <section className="py-16 sm:py-20 bg-slate-50/60 dark:bg-slate-900/50" data-reveal>
        <div className="container mx-auto px-6 sm:px-8 max-w-5xl grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Meet the Team</h2>
            <p className="text-slate-600 dark:text-slate-300">
              We&apos;re a diverse group of product builders and behavioral design enthusiasts based in Singapore, Kuala
              Lumpur, and San Francisco. With over a decade of experience, we specialize in helping founders create
              lasting habits.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Interested in collaboration or insights on behavioral design? We welcome exchanges with others committed
              to long-term success.
            </p>
          </div>
          <div className="rounded-3xl border border-violet-200 dark:border-violet-900/40 bg-white/80 dark:bg-slate-900/60 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Get in Touch 👋</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Email us at{' '}
              <a
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                href="mailto:admin@lazytax.club"
              >
                admin@lazytax.club
              </a>{' '}
              or join the LazyTax Club community to share feedback, success stories, or ideas.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button asChild size="sm">
                <Link href="mailto:admin@lazytax.club">Email the Team</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="https://discord.gg/T7AtTQXr" target="_blank" rel="noopener noreferrer">
                  Join the community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
