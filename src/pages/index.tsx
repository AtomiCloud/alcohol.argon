import Head from 'next/head';
import type { GetServerSidePropsResult } from 'next';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyItWorks from '@/components/landing/WhyItWorks';
import Features from '@/components/landing/Features';
import Charities from '@/components/landing/Charities';
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
      <HowItWorks />
      <WhyItWorks />
      <Features />
      <Charities />
      <FAQ />
      <FinalCTA />
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
