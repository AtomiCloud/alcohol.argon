import { Badge } from '@/components/ui/badge';

const cats = ['Climate', 'Education', 'Health', 'Poverty', 'Animals', 'Human Rights'];

export default function Charities() {
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
        className="absolute inset-x-0 -bottom-24 h-40 bg-gradient-to-t from-violet-500/10 to-transparent blur-3xl pointer-events-none -z-10 animate-blob-slow"
        aria-hidden
      />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
              Causes you can support
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-justify md:text-left">
              Pick from categories supported by Pledge. <sup aria-label="footnote">[1]</sup>
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {cats.map(c => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="bg-slate-200/70 text-slate-800 border border-slate-300 dark:bg-slate-700/70 dark:text-slate-100 dark:border-slate-600"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="relative min-h-48 sm:min-h-64">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
                <img
                  src="/images/charities-grid-fs8.png"
                  alt="Sloth surrounded by category icons for causes"
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
