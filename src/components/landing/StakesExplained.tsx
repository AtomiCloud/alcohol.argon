import Image from 'next/image';

export default function StakesExplained() {
  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Flexible Stakes — Unique and User-Centric
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-tr from-orange-500/10 to-transparent md:min-h-[360px]">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image src="/images/stakes-control-fs8.png" alt="Stakes control visual" fill className="object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Controlled Options</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Customizable Stakes: Choose stakes for habits or opt out.</li>
              <li>Adjustable Amounts: Start small with $1, $2, or $5.</li>
              <li>Charity Selection: Choose from a curated list.</li>
            </ul>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Transparent Management</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Track Missed Days: Visible at the top of the app.</li>
              <li>Monthly Billing: No surprise charges.</li>
              <li>Charitable Contributions: 100% of funds go to charity post-fees.</li>
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
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Enhanced Flexibility</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Habit Scheduling: Accommodate 3x per week routines.</li>
              <li>Earning Freezes: Automatic protection mechanisms.</li>
              <li>Strategic Breaks: Monthly skips and vacation mode available.</li>
            </ul>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Integrity Focused</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Honor-Based System: No photo verification required, fostering genuine self-improvement.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
