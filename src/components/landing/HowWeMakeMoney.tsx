export default function HowWeMakeMoney() {
  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          How we make money (and how we don't)
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-6 bg-gradient-to-tr from-emerald-500/10 to-transparent shadow">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">We make money from</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Pro (USD $4.99/month) and Ultimate (USD $6.99/month) subscriptions</li>
              <li>That's it</li>
            </ul>
          </div>
          <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 p-6 bg-gradient-to-tr from-orange-500/10 to-transparent shadow">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">We make $0 from</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Your missed stakes (100% goes to charity minus transaction fees)</li>
              <li>Free tier users (genuinely free forever)</li>
              <li>Data sales (we never sell your information)</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-violet-200 dark:border-violet-900/40 p-6 bg-gradient-to-tr from-violet-500/10 to-transparent shadow">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Why this matters</h3>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Most stake-based apps have a perverse incentive to make you fail—they profit when you lose money. We don't.
            We only make money when you subscribe and succeed.
          </p>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            <span className="underline decoration-violet-400/50 underline-offset-4">
              Our incentives are aligned with yours
            </span>
            : We want you to succeed, build long streaks, and tell your friends. That's how we grow.
          </p>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            In fact, our most successful users (those hitting 100-day milestones) cost us money in the short term—we
            give them free months and donate USD $5 (Pro) or USD $7 (Ultimate) from our revenue. But we do it anyway
            because helping you build lasting habits is the whole point.
          </p>
        </div>
      </div>
    </section>
  );
}
