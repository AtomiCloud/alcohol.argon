import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tiles = [
  {
    title: 'Streaks + Freeze',
    desc: 'Stay motivated with visible streaks and a monthly freeze to protect momentum.',
    alt: 'Streak ring UI with a small freeze token',
    src: '/images/feature-streaks-freeze-fs8.png',
  },
  {
    title: 'X habits/week',
    desc: 'Target consistency, not perfection — set weekly counts that fit your life.',
    alt: 'Weekly target UI showing 3 of 5 completed',
    src: '/images/feature-x-per-week-fs8.png',
  },
  {
    title: 'Stake money',
    desc: 'Pick a meaningful amount to keep yourself accountable.',
    alt: 'Stake settings UI with amount input',
    src: '/images/feature-usd-stake-fs8.png',
  },
  {
    title: 'Choose your cause',
    desc: 'Support charities via Pledge when you miss — you select the category.',
    alt: 'Charity selection UI with categories',
    src: '/images/feature-choose-cause-fs8.png',
  },
  {
    title: 'Smart reminders',
    desc: 'Timely nudges that align with your schedule and streak status.',
    alt: 'Reminder settings UI with schedule',
    src: '/images/feature-reminders-fs8.png',
  },
  {
    title: 'Clear analytics',
    desc: 'Understand your streaks and habit performance at a glance — see progress, misses, and trends clearly.',
    alt: 'Analytics panel showing streak metrics and habit performance trends',
    src: '/images/feature-clear-analytics-fs8.png',
  },
];

export default function Features() {
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
        className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-orange-500/10 to-transparent blur-3xl pointer-events-none -z-10 animate-blob-slow"
        aria-hidden
      />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
            Designed to keep you consistent
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl text-base sm:text-lg text-justify md:text-left mx-auto md:mx-0">
            A focused set of features that make showing up the easy choice — and turn misses into momentum for good.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
          {tiles.map(t => (
            <Card
              key={t.title}
              className="border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/80 shadow-md hover:shadow-lg dark:shadow-lg dark:shadow-black/60 backdrop-blur-sm transition-shadow"
            >
              <CardHeader className="p-0">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <Image
                    src={t.src}
                    alt={t.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-slate-900 dark:text-white text-xl sm:text-2xl text-center md:text-left">
                  {t.title}
                </CardTitle>
                <p className="mt-1 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed text-justify md:text-left">
                  {t.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
