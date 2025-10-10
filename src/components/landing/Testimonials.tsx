import { Quote, Star } from 'lucide-react';

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
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map(testimonial => (
            <figure
              key={testimonial.name}
              className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-md p-6 flex flex-col justify-between"
            >
              <Quote className="h-6 w-6 text-orange-500 dark:text-orange-300" aria-hidden />
              <blockquote className="mt-4 text-base text-slate-700 dark:text-slate-200">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm font-medium text-slate-900 dark:text-white">
                {testimonial.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
