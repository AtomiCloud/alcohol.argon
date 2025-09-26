export default function FAQ() {
  const items = [
    {
      q: 'Who is the donor? Will I receive a tax receipt?',
      a: 'LazyTax is the donor. You will not receive a tax receipt. [1]',
    },
    {
      q: 'Why is LazyTax the donor instead of donating on my behalf?',
      a: 'Donating in your name is legally complex and requires additional registration, compliance, and ongoing operational costs. To keep things simple and affordable, LazyTax donates as the donor. This means you will not receive a tax receipt, but it lets us operate transparently and direct funds to your selected cause without passing on compliance overheads.',
    },
    {
      q: 'What does “100% after fees” mean?',
      a: 'We direct the full amount you set to your selected cause after partner fees from the payment gateway (Airwallex) and donation platform (Pledge). LazyTax receives 0% and is not affiliated with Airwallex or Pledge.',
    },
    {
      q: 'When do donations happen? Is there proof?',
      a: 'We donate at the end of every month and show it on a public livestream. We also maintain a permanent history page with proof of donations to keep ourselves accountable. LazyTax donates 100% of our money after fees from Airwallex (payments) and Pledge (donations); we take 0%.',
    },
    {
      q: 'Which currency is supported?',
      a: 'You stake money in supported regions. Currency support varies by payment partner; we’ll expand coverage over time.',
    },
    {
      q: 'How do you track misses?',
      a: 'You set a schedule and check in. If a required check‑in is missed, the amount you set goes to your selected cause.',
    },
    {
      q: 'How does LazyTax make money?',
      a: 'Through an optional Pro subscription that unlocks more habits, enhanced streak freezes, smarter notifications, and integrations (e.g., Garmin auto‑sync).',
    },
  ];

  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          FAQ
        </h2>
        <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/80 shadow-md dark:shadow-lg dark:shadow-black/50 backdrop-blur-sm">
          {items.map(it => (
            <details key={it.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 dark:text-white">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden /> {it.q}
                </span>
                <svg
                  className="h-4 w-4 text-slate-500 transition-transform duration-300 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-300">
                <div className="overflow-hidden">
                  <p className="mt-2 text-slate-600 dark:text-slate-300 text-justify md:text-left">{it.a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
