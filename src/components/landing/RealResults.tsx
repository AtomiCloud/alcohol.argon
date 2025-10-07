import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

const bullets = [
  {
    text: 'The average habit takes 66 days to become automatic',
    ref: 1,
  },
  {
    text: 'Adding accountability doubles goal achievement rates',
    ref: 2,
  },
  {
    text: 'Starting with ONE habit = 80% higher success than multiple changes',
    ref: 3,
  },
  {
    text: '4:1 positive-to-negative ratio optimizes discipline and achievement',
    ref: 6,
  },
];

export default function RealResults() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-l from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Validated by research
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left max-w-2xl">
          LazyTax isn't just another app—
          <span className="underline decoration-emerald-400/50 underline-offset-4">
            it's built on proven behavioral science
          </span>
          .
        </p>
        <div className="mt-6 grid md:grid-cols-2 gap-8 items-center">
          <ul className="space-y-3">
            {bullets.map(b => (
              <li key={b.text} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
                  {b.text}
                  <sup>
                    <a href={`#ref-${b.ref}`} className="text-violet-600 dark:text-violet-400 hover:underline ml-0.5">
                      [{b.ref}]
                    </a>
                  </sup>
                </span>
              </li>
            ))}
          </ul>
          <div className="relative aspect-[16/10] w-full max-w-[540px] mx-auto">
            <Image
              src="/images/research-fs8.png"
              alt="Analytics dashboard showing research-backed metrics"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
