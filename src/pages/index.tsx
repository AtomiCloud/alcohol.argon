import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSidePropsResult } from 'next';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import Hero from '@/components/landing/Hero';
import Differentiation from '@/components/landing/Differentiation';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import RealResults from '@/components/landing/RealResults';
import SocialProof from '@/components/landing/SocialProof';
import FinalCTA from '@/components/landing/FinalCTA';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import FAQ from '@/components/landing/FAQ';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';

export default function HomePage() {
  const track = usePlausible();

  const handleReferencesClick = () => {
    track(TrackingEvents.Landing.ReferencesLink.Clicked);
  };

  return (
    <>
      <Head>
        <title>LazyTax — Build habits that stick</title>
        <meta
          name="description"
          content="Build habits with real accountability. Stake money, keep your streak, and if you miss, help a cause you choose."
        />
      </Head>
      <ScrollReveal />
      <Hero />
      <Differentiation />
      <HowItWorksV2 />
      <RealResults />
      <SocialProof />
      <FinalCTA />
      <section className="py-6 sm:py-8 bg-slate-50/50 dark:bg-slate-900/50" data-reveal>
        <div className="container mx-auto px-6 sm:px-8 max-w-5xl text-center md:text-left">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Curious about the science behind LazyTax?{' '}
            <Link
              href="/research"
              onClick={handleReferencesClick}
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              View the full research references →
            </Link>
          </p>
        </div>
      </section>
      <FAQ />
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'public' },
  async (context, { auth }): Promise<GetServerSidePropsResult<Record<string, never>>> => {
    const stayRaw = context.query?.stay;
    const stay = Array.isArray(stayRaw) ? stayRaw.includes('true') : stayRaw === 'true';
    const isAuthed = await auth.retriever
      .getClaims()
      .map(x => x.value.isAuthed)
      .unwrapOr(false);

    if (isAuthed && !stay) {
      return { redirect: { destination: '/app', permanent: false } };
    }
    return { props: {} };
  },
);
