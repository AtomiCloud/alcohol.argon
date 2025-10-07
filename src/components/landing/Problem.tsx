import Image from 'next/image';

export default function Problem() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500/10 to-orange-500/10 pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              You know what to do — doing it{' '}
              <span className="underline decoration-violet-400/50 underline-offset-4">consistently</span> is the hard
              part.
            </h2>
            <div className="mt-4 space-y-4 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
              <p>
                You've downloaded habit apps before. They worked for a week, maybe two. Then life got busy, you missed a
                day, felt guilty about the broken streak, and quietly deleted the app.
              </p>
              <p>
                The problem? Free apps have <strong>no real stakes</strong>. Reminders are easy to ignore. Streaks are
                just numbers that don't actually cost you anything.
              </p>
              <p className="font-semibold text-slate-900 dark:text-white underline underline-offset-4 decoration-violet-400/50">
                Real change needs real accountability—and real support.
              </p>
            </div>
          </div>
          <div>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
              <Image
                src="/images/why-it-works-fs8.png"
                alt="Streaks and support visual"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
