import Head from 'next/head';
import Hero from '@/components/landing/Hero';
import SubscriberCounter from '@/components/landing/SubscriberCounter';
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
      <SubscriberCounter />
      <HowItWorks />
      <WhyItWorks />
      <Features />
      <Charities />
      <FAQ />
      <FinalCTA />
    </>
  );
}
