import Image from 'next/image';

export default function WhyStakesSupport() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          The science of balanced reinforcement
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 bg-gradient-to-tr from-orange-500/10 to-transparent p-6 shadow-md md:min-h-[360px]">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image
                src="/images/balanced-accountability-fs8.png"
                alt="Accountability visual"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
              The Accountability Side
            </h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
              Financial commitment devices work. Studies show{' '}
              <strong>
                30–40% higher success
                <sup>
                  <a
                    href="/references#financial-incentives"
                    className="text-violet-600 dark:text-violet-400 hover:underline ml-0.5"
                  >
                    [1]
                  </a>
                </sup>
              </strong>{' '}
              when money is on the line. But most stake-based apps are buggy, expensive (USD $20–99/month), or punitive.
            </p>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
              We're different: stakes are <strong>optional</strong>, start small, and{' '}
              <span className="underline decoration-orange-400/50 underline-offset-4">100% goes to charity</span> —
              never to us. No perverse incentives. No gotchas.
            </p>
          </div>
          <div className="rounded-xl border border-violet-200 dark:border-violet-900/40 bg-gradient-to-tr from-violet-500/10 to-transparent p-6 shadow-md md:min-h-[360px]">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image
                src="/images/balanced-celebration-fs8.png"
                alt="Celebration visual"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">The Celebration Side</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
              Research shows{' '}
              <strong>
                4:1 positive-to-negative
                <sup>
                  <a href="/references" className="text-violet-600 dark:text-violet-400 hover:underline ml-0.5">
                    [2]
                  </a>
                </sup>
              </strong>{' '}
              feedback creates lasting behavior change. That's why we celebrate every streak, reward milestones with
              free months, and donate USD $5 (Pro) or USD $7 (Ultimate) to charity when you hit 100 days.
            </p>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
              <span className="underline decoration-violet-400/50 underline-offset-4">
                Accountability keeps you honest. Celebration keeps you going.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
