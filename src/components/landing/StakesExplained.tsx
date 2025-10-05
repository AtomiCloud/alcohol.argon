import Image from 'next/image';

export default function StakesExplained() {
  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Optional stakes — how they work (and why they're different)
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-tr from-orange-500/10 to-transparent md:min-h-[360px]">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image src="/images/stakes-control-fs8.png" alt="Stakes control visual" fill className="object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">You're in control</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Choose which habits have stakes (or none at all)</li>
              <li>Set the amount ($1, $2, $5—start small)</li>
              <li>Pick your charity from our curated list</li>
            </ul>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Transparent and fair</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Missed days accumulate — shown at top of app</li>
              <li>Charged at end of month (no surprise bills)</li>
              <li>
                <span className="underline decoration-orange-400/50 underline-offset-4">
                  100% goes to your chosen charity
                </span>{' '}
                after payment fees
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-tr from-emerald-500/10 to-transparent md:min-h-[360px]">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image
                src="/images/stakes-flexibility-fs8.png"
                alt="Flexibility visual"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Built‑in flexibility</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Flexible habits (3× per week instead of daily)</li>
              <li>Earn freezes that auto‑protect you</li>
              <li>Monthly skips you can use strategically</li>
              <li>Vacation mode pauses everything</li>
            </ul>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Honor system</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              No photo proof or verification required. Built for individuals committed to genuine self-improvement
              through honest self-accountability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
