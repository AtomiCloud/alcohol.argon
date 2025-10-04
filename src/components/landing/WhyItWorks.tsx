import Image from 'next/image';

export default function WhyItWorks() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      {/* Neutral skew separators, dark-mode friendly */}
      <div
        className="absolute inset-x-0 -top-3 h-6 md:h-8 bg-gradient-to-r from-slate-200/70 to-transparent dark:from-slate-800/60 -skew-y-2 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 -bottom-3 h-6 md:h-8 bg-gradient-to-l from-slate-200/70 to-transparent dark:from-slate-800/60 skew-y-2 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-slate-900/0 via-violet-500/5 to-transparent dark:from-slate-900/0 dark:via-violet-500/10 dark:to-transparent pointer-events-none -z-10"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
              Why it works
            </h2>
            <div className="mt-4 space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-white/95 dark:bg-slate-800/80 shadow-md dark:shadow-lg dark:shadow-black/50 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white text-center md:text-left">
                  A commitment device for busy professionals
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-justify md:text-left">
                  Putting real stakes behind your goals increases follow‑through. Combined with streaks and weekly
                  targets, it nudges you to show up even on hectic days.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-white/95 dark:bg-slate-800/80 shadow-md dark:shadow-lg dark:shadow-black/50 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white text-center md:text-left">
                  Motivation with upside
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-justify md:text-left">
                  If you slip, your set amount helps a cause you choose — a gentle nudge with positive impact.
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="relative min-h-48 sm:min-h-64">
              <div
                className="absolute -top-8 right-6 h-40 w-40 rounded-full bg-violet-500/20 dark:bg-violet-500/15 blur-3xl pointer-events-none -z-10 animate-blob-slow"
                aria-hidden
              />
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
                <Image
                  src="/images/why-it-works-fs8.png"
                  alt="Sloth atop progress blocks, glowing with motivation"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
