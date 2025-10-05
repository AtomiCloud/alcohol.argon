import Head from 'next/head';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import FeaturesSummary from '@/components/landing/FeaturesSummary';
import WhyStakesSupport from '@/components/landing/WhyStakesSupport';
import RealResults from '@/components/landing/RealResults';
import Differentiation from '@/components/landing/Differentiation';
import Pricing from '@/components/landing/Pricing';
import HowWeMakeMoney from '@/components/landing/HowWeMakeMoney';
import StakesExplained from '@/components/landing/StakesExplained';
import Transparency from '@/components/landing/Transparency';
import SocialProof from '@/components/landing/SocialProof';
import CommunityGoal from '@/components/landing/CommunityGoal';
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
      <Problem />
      <CommunityGoal />
      <HowItWorksV2 />
      <FeaturesSummary />
      <WhyStakesSupport />
      <RealResults />
      <Differentiation />
      <Pricing />
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
