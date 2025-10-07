export default function SocialProof() {
  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Join hundreds of people building better habits
        </h2>
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 bg-white/95 dark:bg-slate-800/80 text-center">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              200+
            </span>
            <p className="mt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300">on research list</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 bg-white/95 dark:bg-slate-800/80 text-center">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              50+ hrs
            </span>
            <p className="mt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300">user interviews</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 bg-white/95 dark:bg-slate-800/80 text-center">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Research‑backed
            </span>
            <p className="mt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300">behavioral science</p>
          </div>
        </div>
      </div>
    </section>
  );
}
