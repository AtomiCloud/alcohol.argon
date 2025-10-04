export default function FAQ() {
  const items = [
    {
      q: 'When do you launch?',
      a: "We're aiming for late October 2025. Waitlist members will be notified first with priority access to the 100 promotional spots.",
    },
    {
      q: 'How do the promotional spots work?',
      a: "First 10 users get Ultimate free forever. Next 10 get Pro free forever. Next 80 get Ultimate free for 1 year. After 100 users, standard pricing applies. Note: Lifetime free members don't receive the charity donation at 100 days (Pro paying subscribers get USD $5, Ultimate get USD $7).",
    },
    {
      q: 'Do I have to use stakes?',
      a: 'No. Stakes are completely optional. Start without them, add them later if you need extra accountability.',
    },
    {
      q: 'How exactly does the donation process work?',
      a: 'When you miss a day with stakes, you pay us at the end of the month. We then donate 100% of what you paid, minus payment gateway fees (Airwallex) and donation platform fees (Pledge.to), to your chosen charity. This means you will not receive a tax receipt for your missed stakes, since the donation is made in our name. We are working with Pledge.to to enable direct tax receipts in the future.',
    },
    {
      q: 'How do I know the money actually goes to charity?',
      a: 'Transparency is critical to us. At the end of every month, we will livestream the donation process so you can see exactly where the money goes. No hidden fees. No money kept by us beyond covering transaction costs.',
    },
    {
      q: 'What about the donation at 100 days?',
      a: 'That comes directly from our company revenue as a celebration of your success. We donate USD $5 (Pro) or USD $7 (Ultimate) in your honor to your chosen charity (paying subscribers only). Same transparency: included in our monthly donation livestream.',
    },
    {
      q: 'What if I miss because of travel, sickness, or emergencies?',
      a: "You earn freezes every 7 days that auto-protect your streak. Plus monthly skips and vacation mode. We're not trying to catch you—we're trying to help you succeed.",
    },
    {
      q: 'How is this different from StickK or Forfeit?',
      a: 'Lower price (USD $5 vs USD $20-99), no verification friction, earned flexibility, milestone rewards, balanced positive reinforcement—and complete transparency on where every dollar goes.',
    },
    {
      q: "Can I change my charity after I've started?",
      a: 'Yes. You can update your default charity anytime. Any accumulated debt for the current month will go to your newly selected charity.',
    },
    {
      q: 'What happens if my payment fails at the end of the month?',
      a: "We'll only donate what we successfully collect. We won't pursue collections or charge late fees—this is about accountability, not debt collection. If your payment method fails, your debt simply doesn't get donated that month.",
    },
    {
      q: 'Where does the money go?',
      a: 'You pay us for missed stakes. We donate 100% of what we collect, minus payment gateway (Airwallex) and donation platform (Pledge.to) fees, to your chosen charity. We livestream donations monthly for full transparency. Tax receipts are not available yet (donation is in our name), but we are working with Pledge.to to enable them in the future.',
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
