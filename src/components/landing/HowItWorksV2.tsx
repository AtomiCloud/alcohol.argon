import Image from 'next/image';

const steps = [
  {
    title: 'Start with one small habit',
    body: "Not 'go to the gym.' Start with 'put on gym clothes.' Not 'write 1000 words.' Just 'open the document for 5 minutes.' Research shows: tiny habits stick. Overpromising kills momentum before you start.",
    img: '/images/how-1-calendar-fs8.png',
    color: 'from-orange-500/10 to-transparent',
  },
  {
    title: 'Check in daily',
    body: "Tap the button. That's it. No photos, no verification, no friction. We're not your parent—we trust you.",
    img: '/images/how-3-checkin-donate-fs8.png',
    color: 'from-violet-500/10 to-transparent',
  },
  {
    title: 'Optional stakes for accountability',
    body: "Here's what makes us different: put small money on the line (you choose the amount—start with USD $1-2). Miss a day without freezes or skips? That money goes 100% to YOUR chosen charity. This isn't punishment. It's making your commitment real.",
    img: '/images/feature-usd-stake-fs8.png',
    color: 'from-emerald-500/10 to-transparent',
  },
  {
    title: 'Earn protection',
    body: 'Every 7-day streak earns you a freeze that auto-protects you when life happens. Get monthly skips. Pause habits during vacation. We reward consistency with flexibility.',
    img: '/images/feature-streaks-freeze-fs8.png',
    color: 'from-sky-500/10 to-transparent',
  },
  {
    title: 'Celebrate your success',
    body: '50-day milestone: Free month on us. 100-day milestone: We donate $5 to charity in your honor (Pro/Ultimate paying subscribers). 200 & 500 days: More free months. When you succeed, we invest in the causes you care about.',
    img: '/images/feature-clear-analytics-fs8.png',
    color: 'from-pink-500/10 to-transparent',
  },
];

export default function HowItWorksV2() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-x-0 -top-3 h-6 md:h-8 bg-gradient-to-r from-slate-200/70 to-transparent dark:from-slate-800/60 -skew-y-2 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 -bottom-3 h-6 md:h-8 bg-gradient-to-l from-slate-200/70 to-transparent dark:from-slate-800/60 skew-y-2 pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Two sides of the same commitment
        </h2>
        <div className="mt-6 grid gap-10">
          {steps.map((s, idx) => (
            <div key={s.title} className="grid md:grid-cols-2 items-center gap-6 md:gap-10">
              <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                <div
                  className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-tr ${s.color} p-5 shadow-md dark:shadow-black/40 md:min-h-[260px]`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex w-8 aspect-square items-center justify-center rounded-full bg-orange-500 text-white text-sm font-semibold leading-none shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
                    {idx === 0 && (
                      <>
                        Not "go to the gym." <strong>Start with "put on gym clothes."</strong>
                        <br />
                        Not "write 1000 words." <strong>Just "open the document for 5 minutes."</strong>
                        <br />
                        <span className="underline decoration-orange-400/50 underline-offset-4">
                          Research shows: tiny habits stick.
                          <sup>
                            <a href="#ref-4" className="text-violet-600 dark:text-violet-400 hover:underline ml-0.5">
                              [4]
                            </a>
                          </sup>
                        </span>{' '}
                        Overpromising kills momentum before you start.
                      </>
                    )}
                    {idx === 1 && (
                      <>
                        Simply tap the check-in button. <strong>No photos, no verification, no friction.</strong>
                        <br />
                        Built on{' '}
                        <span className="underline decoration-violet-400/50 underline-offset-4">
                          trust and self-accountability
                        </span>
                        .
                      </>
                    )}
                    {idx === 2 && (
                      <>
                        Stake <strong>small amounts</strong> you choose (start with USD $1–2). Miss a day without
                        freezes or skips? That money goes{' '}
                        <span className="underline decoration-emerald-400/50 underline-offset-4">
                          100% to your chosen charity
                        </span>
                        . This creates real commitment without punishment.
                      </>
                    )}
                    {idx === 3 && (
                      <>
                        <strong>Every 7‑day streak earns you a freeze</strong> that auto‑protects you when life happens.
                        <br />
                        Get monthly skips. Pause habits during vacation.
                        <br />
                        We{' '}
                        <span className="underline decoration-sky-400/50 underline-offset-4">
                          reward consistency with flexibility
                        </span>
                        .
                      </>
                    )}
                    {idx === 4 && (
                      <>
                        <strong>50‑day milestone:</strong> Free month on us.
                        <br />
                        <strong>100‑day milestone:</strong> We donate USD $5 to charity in your honor (Pro subscribers)
                        or USD $7 (Ultimate subscribers).
                        <br />
                        <strong>200 & 500 days:</strong> More free months.
                        <br />
                        When you succeed, we{' '}
                        <span className="underline decoration-pink-400/50 underline-offset-4">
                          invest in the causes you care about
                        </span>
                        .
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className={idx % 2 === 1 ? 'md:order-1' : ''}>
                <div className="relative mx-auto aspect-[16/10] w-full max-w-[520px]">
                  <Image src={s.img} alt={s.title} fill className="object-contain" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
