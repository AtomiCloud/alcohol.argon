import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Amanda, Product Lead',
    quote:
      'LazyTax finally gave me a system that rewards streaks without punishing the occasional miss. The optional stakes keep me honest, and the freezes make it humane.',
  },
  {
    name: 'Jordan, Founder & Solo Operator',
    quote:
      'I tried every habit app out there. LazyTax is the first one where the incentives actually line up with how I think. The monthly recap email is an instant calibration pulse.',
  },
  {
    name: 'Priya, Health Coach',
    quote:
      'Clients love that they can set small stakes and see where every dollar goes. I recommend LazyTax in every onboarding session because the accountability is compassionate.',
  },
];

export default function Testimonials() {
  const items = useMemo(() => testimonials, []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const goTo = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
  };

  return (
    <section
      className="py-16 sm:py-20 bg-gradient-to-br from-violet-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      data-reveal
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-300 ring-1 ring-violet-500/30 dark:ring-violet-500/40">
              <Star className="h-3.5 w-3.5" />
              Trusted by habit builders
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
              What people say about LazyTax
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md">
            Self-reported stories from customers using LazyTax in their founder journeys, health routines, and coaching
            practices.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {items.map(testimonial => (
              <figure
                key={testimonial.name}
                className="w-full shrink-0 px-8 py-10 sm:px-12 sm:py-12 flex flex-col gap-6"
              >
                <Quote className="h-7 w-7 text-orange-500 dark:text-orange-300" aria-hidden />
                <blockquote className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  {testimonial.name}
                </figcaption>
              </figure>
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-2 text-slate-600 dark:text-slate-300 backdrop-blur-sm transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 md:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-2 text-slate-600 dark:text-slate-300 backdrop-blur-sm transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 md:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {items.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                aria-label={`View testimonial ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  activeIndex === index
                    ? 'bg-orange-500 dark:bg-orange-300 scale-110'
                    : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
