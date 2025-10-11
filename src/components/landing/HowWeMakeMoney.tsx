export default function HowWeMakeMoney() {
  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Our Revenue Model
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-6 bg-gradient-to-tr from-emerald-500/10 to-transparent shadow">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Sources of Revenue:</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Pro and Ultimate Subscriptions: Offered at USD $9.99/month and $13.99/month, respectively.</li>
              <li>Transparent Pricing: No hidden fees.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 p-6 bg-gradient-to-tr from-orange-500/10 to-transparent shadow">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">We Do Not Derive Revenue From:</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Missed Stakes: Entire amount (less fees) donated to charity.</li>
              <li>Free Users: Always free for basic access.</li>
              <li>Data Sales: We ensure your information is never sold.</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-violet-200 dark:border-violet-900/40 p-6 bg-gradient-to-tr from-violet-500/10 to-transparent shadow">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Why It Matters:</h3>
          <ul className="mt-2 space-y-2 text-slate-700 dark:text-slate-300">
            <li>Our approach aligns success with your achievements. Unlike others, we do not profit from losses.</li>
            <li>We only earn when you succeed. Your success = our success.</li>
            <li>
              We occasionally incur costs for our top users, driven by our commitment to fostering lasting habits.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
