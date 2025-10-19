import Head from 'next/head';
import Link from 'next/link';
import FeaturesSummary from '@/components/landing/FeaturesSummary';
import WhyStakesSupport from '@/components/landing/WhyStakesSupport';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { SignInCTA } from '@/components/ui/sign-in-cta';

export default function WhyLazyTaxPage() {
  return (
    <>
      <Head>
        <title>Why LazyTax Works — Balanced Accountability & Support</title>
        <meta
          name="description"
          content="Discover how LazyTax combines accountability, celebration, and flexible tooling to help your habits stick."
        />
      </Head>
      <ScrollReveal />
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-violet-500/10" />
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            <strong>Everything you need to build lasting habits.</strong>
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300">
            <strong>The science of balanced reinforcement.</strong>
          </p>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Learn how LazyTax blends commitment devices, flexible guardrails, and celebration mechanics so you never
            have to rebuild momentum from scratch.
          </p>
          <div className="flex justify-center gap-3">
            <SignInCTA
              size="lg"
              className="h-12 min-w-[220px] px-7 text-base font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 shadow-lg hover:shadow-xl ring-1 ring-white/20 dark:ring-white/10 rounded-xl transition-all"
            >
              Start your first habit
            </SignInCTA>
            <Button asChild size="lg" variant="secondary">
              <Link href="/research">View the research</Link>
            </Button>
          </div>
        </div>
      </section>
      <FeaturesSummary />
      <WhyStakesSupport />
    </>
  );
}
