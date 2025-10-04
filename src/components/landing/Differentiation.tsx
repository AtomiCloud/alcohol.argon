import { X, Check } from 'lucide-react';

export default function Differentiation() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-red-500/5 via-transparent to-emerald-500/5 pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Why we're different from other habit apps
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left max-w-2xl">
          We learned from what <span className="underline decoration-red-400/50 underline-offset-4">doesn't work</span>{' '}
          to build what <span className="underline decoration-emerald-400/50 underline-offset-4">does</span>.
        </p>
        <div className="mt-6 grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 p-6 bg-gradient-to-br from-red-500/5 to-transparent shadow-md md:min-h-[200px]">
            <div className="flex items-start gap-2">
              <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Free habit trackers</h3>
            </div>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              <strong>No accountability.</strong> Reminders are easy to ignore. Basic features hidden behind paywalls.
            </p>
          </div>
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 p-6 bg-gradient-to-br from-red-500/5 to-transparent shadow-md md:min-h-[200px]">
            <div className="flex items-start gap-2">
              <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stake‑based apps</h3>
            </div>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              <strong>Buggy, punitive, and pricey</strong> ($20–99/mo). Photo verification adds friction; incentives
              misaligned.
            </p>
          </div>
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 p-6 bg-gradient-to-br from-red-500/5 to-transparent shadow-md md:min-h-[200px]">
            <div className="flex items-start gap-2">
              <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gamified apps</h3>
            </div>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              Fun at first, but <strong>points don't translate</strong> to lasting behavior change.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-6 bg-gradient-to-tr from-emerald-500/10 to-transparent shadow-lg">
          <div className="flex items-start gap-2">
            <Check className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Our approach</h3>
              <p className="mt-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg">
                <span className="bg-emerald-400/20 dark:bg-emerald-300/10 px-1 rounded">Low friction</span> +{' '}
                <span className="bg-orange-400/20 dark:bg-orange-300/10 px-1 rounded">optional real stakes</span> +{' '}
                <span className="bg-violet-400/20 dark:bg-violet-300/10 px-1 rounded">earned flexibility</span> +{' '}
                <span className="bg-sky-400/20 dark:bg-sky-300/10 px-1 rounded">milestone rewards</span> = lasting
                change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
