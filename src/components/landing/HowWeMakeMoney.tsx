export default function HowWeMakeMoney() {
  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          How We Make Money (and How We Don&apos;t)
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-6 bg-gradient-to-tr from-emerald-500/10 to-transparent shadow">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">We make money from:</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Pro (USD $4.99/month) and Ultimate (USD $6.99/month) subscriptions</li>
              <li>That&apos;s it — no hidden fees</li>
            </ul>
          </div>
          <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 p-6 bg-gradient-to-tr from-orange-500/10 to-transparent shadow">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">We don&apos;t make money from:</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Missed stakes (100% goes to charity minus fees)</li>
              <li>Free users (truly free forever)</li>
              <li>Data sales (we never sell your info)</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-violet-200 dark:border-violet-900/40 p-6 bg-gradient-to-tr from-violet-500/10 to-transparent shadow">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Why it matters</h3>
          <ul className="mt-2 space-y-2 text-slate-700 dark:text-slate-300">
            <li>Most stake-based apps profit when you fail. We don&apos;t.</li>
            <li>We only earn when you succeed. Your success = our success.</li>
            <li>
              Our top users even cost us money sometimes — and we do it anyway, because helping you build lasting habits
              is our mission.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
