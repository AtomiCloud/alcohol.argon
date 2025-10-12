import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DifferentiationProps {
  tone?: 'brand' | 'soft';
}

export default function Differentiation({ tone = 'brand' }: DifferentiationProps) {
  const isSoft = tone === 'soft';

  const sectionClasses = cn(
    'relative overflow-hidden py-16 sm:py-20',
    isSoft
      ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950/70 dark:to-slate-950'
      : 'bg-white dark:bg-slate-950',
  );

  const overlayClasses = isSoft
    ? 'absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.15),_transparent_45%)]'
    : 'absolute inset-0 -z-10 bg-gradient-to-r from-red-500/5 via-transparent to-emerald-500/5 pointer-events-none';

  const paragraphClasses = cn(
    'mt-2 text-base sm:text-lg text-center md:text-left max-w-2xl mx-auto md:mx-0',
    'text-slate-600 dark:text-slate-300',
  );

  const negativeCardClasses = cn(
    'rounded-xl p-6 shadow-md md:min-h-[200px] transition-shadow',
    isSoft
      ? 'border border-slate-200 bg-white hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:shadow-slate-900/40'
      : 'border border-red-200 dark:border-red-900/40 bg-gradient-to-br from-red-500/5 to-transparent',
  );
  const negativeIconClasses = cn(
    'h-5 w-5 shrink-0 mt-0.5',
    isSoft ? 'text-orange-500 dark:text-orange-300' : 'text-red-500',
  );
  const negativeBodyClasses = cn(
    'mt-2',
    isSoft ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300',
  );

  const positiveCardClasses = cn(
    'mt-8 rounded-xl p-6 md:p-8 shadow-lg transition-shadow border',
    isSoft
      ? 'border-emerald-200 bg-white hover:shadow-xl dark:border-emerald-800/50 dark:bg-emerald-500/10'
      : 'border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-tr from-emerald-500/10 to-transparent',
  );
  const positiveIconClasses = cn(
    'h-6 w-6 shrink-0 mt-0.5',
    isSoft ? 'text-emerald-500 dark:text-emerald-300' : 'text-emerald-500',
  );
  const positiveBodyClasses = cn(
    'mt-2 text-base sm:text-lg',
    isSoft ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300',
  );

  const chipClasses = cn(
    'px-1 rounded',
    isSoft
      ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
      : 'bg-emerald-400/20 dark:bg-emerald-400/25',
  );

  return (
    <section className={sectionClasses} data-reveal>
      <div className={overlayClasses} aria-hidden />
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Why we're different from other habit apps
        </h2>
        <p className={paragraphClasses}>
          We learned from what <span className="underline decoration-red-400/50 underline-offset-4">doesn't work</span>{' '}
          to build what <span className="underline decoration-emerald-400/50 underline-offset-4">does</span>.
        </p>
        <div className="mt-6 grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          <div className={negativeCardClasses}>
            <div className="flex items-start gap-2">
              <X className={negativeIconClasses} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Free habit trackers</h3>
            </div>
            <p className={negativeBodyClasses}>
              <strong>No accountability.</strong> Reminders are easy to ignore. Basic features hidden behind paywalls.
            </p>
          </div>
          <div className={negativeCardClasses}>
            <div className="flex items-start gap-2">
              <X className={negativeIconClasses} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stake‑based apps</h3>
            </div>
            <p className={negativeBodyClasses}>
              <strong>Buggy, punitive, and pricey</strong> ($20–99/mo). Photo verification adds friction; incentives
              misaligned.
            </p>
          </div>
          <div className={negativeCardClasses}>
            <div className="flex items-start gap-2">
              <X className={negativeIconClasses} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gamified apps</h3>
            </div>
            <p className={negativeBodyClasses}>
              Fun at first, but <strong>points don't translate</strong> to lasting behavior change.
            </p>
          </div>
        </div>
        <div className={positiveCardClasses}>
          <div className="flex items-start gap-2">
            <Check className={positiveIconClasses} />
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Our approach</h3>
              <p className={positiveBodyClasses}>
                <span className={chipClasses}>Low friction</span> +{' '}
                <span className={chipClasses}>optional real stakes</span> +{' '}
                <span className={chipClasses}>earned flexibility</span> +{' '}
                <span className={chipClasses}>milestone rewards</span> +{' '}
                <span className={chipClasses}>monthly rhythm</span> = lasting change.
              </p>
              <ul className="mt-4 space-y-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                  <span>Weekly freezes and monthly skips so accountability never feels punitive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                  <span>Milestone rewards and transparent donations that celebrate the streaks you earn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                  <span>
                    Built-in 30-day reset prompts help you reflect, review progress, and refocus so your habits evolve
                    with your season.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
