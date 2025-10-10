import Head from 'next/head';
import type { GetServerSidePropsResult } from 'next';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import Hero from '@/components/landing/Hero';
import Differentiation from '@/components/landing/Differentiation';
import Problem from '@/components/landing/Problem';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import RealResults from '@/components/landing/RealResults';
import SocialProof from '@/components/landing/SocialProof';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import ScrollReveal from '@/lib/animations/ScrollReveal';

export default function HomePage() {
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
      <Problem />
      <HowItWorksV2 />
      <RealResults />
      <SocialProof />
      <FAQ />
      <FinalCTA />
      <section className="py-10 bg-slate-50/50 dark:bg-slate-900/50" data-reveal>
        <div className="container mx-auto px-4 max-w-5xl text-center md:text-left">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Curious about the science behind LazyTax?{' '}
            <a
              href="https://www.notion.so/lazytaxclub/LazyTax-Research-References-52d5ec1b28f8455590982cf49e3613ea"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              View the full research references →
            </a>
          </p>
        </div>
      </section>
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
