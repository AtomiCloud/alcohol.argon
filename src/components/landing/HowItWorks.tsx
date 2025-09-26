export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-20" data-reveal>
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
        className="absolute inset-y-0 -left-20 h-[140%] w-64 rotate-12 bg-gradient-to-b from-orange-500/10 to-transparent blur-3xl pointer-events-none -z-10 animate-blob-slow"
        aria-hidden
      />
      <div
        className="absolute -right-32 -bottom-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none -z-10 animate-blob-slow"
        aria-hidden
      />

      <div className="container mx-auto px-4">
        <h2 className="font-heading text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          How it works
        </h2>

        {/* Step 1: Text left, art right */}
        <div className="mt-8 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div>
            <div className="grid justify-items-center md:flex md:items-center md:justify-start gap-3">
              <span className="inline-flex w-8 aspect-square items-center justify-center rounded-full bg-orange-500 text-white text-[13px] sm:text-sm font-semibold leading-none shrink-0">
                1
              </span>
              <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white text-center md:text-left">
                Pick your habit and schedule
              </h3>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left">
              Choose a habit (e.g., read 15 minutes, run 3 km) and set when it repeats — daily or on specific weekdays
              like Tue/Thu.
            </p>
          </div>
          <div className="relative min-h-40 sm:min-h-56 md:min-h-64">
            <div
              className="absolute -top-6 -right-4 h-40 w-40 rounded-full bg-orange-500/20 dark:bg-orange-500/15 blur-3xl pointer-events-none -z-10 animate-blob-slow"
              aria-hidden
            />
            <div className="relative mx-auto aspect-[16/10] w-full max-w-[520px]">
              <img
                src="/images/how-1-calendar-fs8.png"
                alt="Sloth placing tiles onto a weekly calendar"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Art left, text right */}
        <div className="mt-12 md:mt-8 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="order-2 md:order-1">
            <div className="relative min-h-40 sm:min-h-56 md:min-h-64">
              <div
                className="absolute -top-10 left-2 h-52 w-52 rounded-full bg-violet-500/20 dark:bg-violet-500/15 blur-3xl pointer-events-none -z-10 animate-blob-slow"
                aria-hidden
              />
              <div className="relative mx-auto aspect-[16/10] w-full max-w-[520px]">
                <img
                  src="/images/how-2-stake-cause-fs8.png"
                  alt="Sloth holding coins and choosing a cause"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="grid justify-items-center md:flex md:items-center md:justify-start gap-3">
              <span className="inline-flex w-8 aspect-square items-center justify-center rounded-full bg-violet-500 text-white text-[13px] sm:text-sm font-semibold leading-none shrink-0">
                2
              </span>
              <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white text-center md:text-left">
                Stake money and choose your cause
              </h3>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left">
              Pick an amount that keeps you accountable, then choose a cause you care about. If you miss a check‑in, the
              money you staked goes to that cause.
            </p>
          </div>
        </div>

        {/* Step 3: Text left, art right */}
        <div className="mt-12 md:mt-8 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div>
            <div className="grid justify-items-center md:flex md:items-center md:justify-start gap-3">
              <span className="inline-flex w-8 aspect-square items-center justify-center rounded-full bg-orange-500 text-white text-[13px] sm:text-sm font-semibold leading-none shrink-0">
                3
              </span>
              <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white text-center md:text-left">
                Check in — if you miss, help a cause
              </h3>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left">
              On each scheduled day, mark your habit as done within your check‑in window. If you miss, we donate the
              money you staked to your selected cause. You get one streak freeze per month to protect momentum.
            </p>
          </div>
          <div>
            <div className="relative min-h-40 sm:min-h-56 md:min-h-64">
              <div
                className="absolute -top-6 right-10 h-32 w-32 rounded-full bg-orange-500/20 dark:bg-orange-500/15 blur-3xl pointer-events-none -z-10 animate-blob-slow"
                aria-hidden
              />
              <div className="relative mx-auto aspect-[16/10] w-full max-w-[520px]">
                <img
                  src="/images/how-3-checkin-donate-fs8.png"
                  alt="Sloth checking in; donation heart when missed"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
