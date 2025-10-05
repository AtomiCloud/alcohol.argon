import Image from 'next/image';
import { X, Check } from 'lucide-react';

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
    img: '/images/how-2-checkin-fs8.png',
    color: 'from-violet-500/10 to-transparent',
  },
  {
    title: 'Optional stakes for accountability',
    body: "Here's what makes us different: put small money on the line (you choose the amount—start with USD $1-2). Miss a day without freezes or skips? That money goes 100% to YOUR chosen charity. This isn't punishment. It's making your commitment real.",
    img: '/images/how-3-accountability-fs8.png',
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
    body: 'Your first 50-day streak: Free month on us. Your first 100-day streak: We donate $5 to charity in your honor (Pro) or $7 (Ultimate). Your first 200 & 500-day streaks: More free months. When you succeed, we invest in the causes you care about.',
    img: '/images/how-5-celebrate-fs8.png',
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
                        <div className="my-2.5 flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">Go to the gym</span>
                        </div>
                        <div className="my-2.5 flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-sm font-semibold">Put on gym clothes</span>
                        </div>
                        <div className="my-2.5 flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">Write 1000 words</span>
                        </div>
                        <div className="my-2.5 flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-sm font-semibold">Open the document for 5 minutes</span>
                        </div>
                        <p className="mt-4">
                          <span className="underline decoration-orange-400/50 underline-offset-4">
                            Research shows: tiny habits stick
                            <sup>
                              <a href="#ref-4" className="text-violet-600 dark:text-violet-400 hover:underline ml-0.5">
                                [4]
                              </a>
                            </sup>
                          </span>{' '}
                          Overpromising kills momentum before you start
                        </p>
                      </>
                    )}
                    {idx === 1 && (
                      <>
                        <p className="my-2">
                          Simply tap the check-in button. <strong>No photos, no verification, no friction.</strong>
                        </p>
                        <p className="my-2">
                          Built on{' '}
                          <span className="underline decoration-violet-400/50 underline-offset-4">
                            trust and self-accountability
                          </span>
                          .
                        </p>
                      </>
                    )}
                    {idx === 2 && (
                      <>
                        <p className="my-2">
                          Stake <strong>small amounts</strong> you choose (start with USD 1–2).
                        </p>
                        <p className="my-2">
                          Miss a day without freezes or skips? That money goes{' '}
                          <span className="underline decoration-emerald-400/50 underline-offset-4">
                            100% to your chosen charity
                          </span>
                          .{' '}
                        </p>
                        <p className="my-2">This creates real commitment without punishment.</p>
                      </>
                    )}
                    {idx === 3 && (
                      <>
                        <p className="my-2">
                          Earns freezes that <strong>auto‑protects</strong> your streaks when life happens.
                        </p>
                        <p className="my-2">Get monthly skips. Pause habits during vacation.</p>
                        <p className="my-2">
                          We{' '}
                          <span className="underline decoration-sky-400/50 underline-offset-4">
                            reward consistency with flexibility
                          </span>
                          .
                        </p>
                      </>
                    )}
                    {idx === 4 && (
                      <>
                        <div className="my-3">
                          <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                            Your first 50-day streak
                          </span>
                          <p className="mt-1 text-sm">Free month on us.</p>
                        </div>
                        <div className="my-3">
                          <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                            Your first 100-day streak
                          </span>
                          <p className="mt-1 text-sm">
                            We donate USD $5 to charity in your honor (Pro) or USD $7 (Ultimate).
                          </p>
                        </div>
                        <div className="my-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                            Your first 200 & 500-day streaks
                          </span>
                          <p className="mt-1 text-sm">More free months.</p>
                        </div>
                        <p className="my-2">
                          When you succeed, we{' '}
                          <span className="underline decoration-pink-400/50 underline-offset-4">
                            invest in the causes you care about
                          </span>
                          .
                        </p>
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
