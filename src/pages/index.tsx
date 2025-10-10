import Head from 'next/head';
import type { GetServerSidePropsResult } from 'next';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import Hero from '@/components/landing/Hero';
import Differentiation from '@/components/landing/Differentiation';
import Problem from '@/components/landing/Problem';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import RealResults from '@/components/landing/RealResults';
import HowWeMakeMoney from '@/components/landing/HowWeMakeMoney';
import StakesExplained from '@/components/landing/StakesExplained';
import Transparency from '@/components/landing/Transparency';
import SocialProof from '@/components/landing/SocialProof';
import FAQ from '@/components/landing/FAQ';
import References from '@/components/landing/References';
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
      <HowWeMakeMoney />
      <StakesExplained />
      <Transparency />
      <SocialProof />
      <FAQ />
      <FinalCTA />
      <References />
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
