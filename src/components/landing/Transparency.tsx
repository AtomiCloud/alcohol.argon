import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function Transparency() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/5 via-transparent to-violet-500/5 pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Complete transparency on where your money goes
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge
            variant="secondary"
            className="bg-orange-500/15 text-orange-700 border border-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-900/40"
          >
            Payments via Airwallex
          </Badge>
          <Badge
            variant="secondary"
            className="bg-violet-500/15 text-violet-700 border border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-900/40"
          >
            Pledge‑powered giving
          </Badge>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 p-6 bg-gradient-to-br from-orange-500/10 to-transparent shadow-md">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image
                src="/images/transparency-stakes2-fs8.png"
                alt="Stakes transparency"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your missed stakes</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              You → Airwallex (payment) → Us → Pledge.to → Your charity
            </p>
            <h4 className="mt-4 font-medium text-slate-900 dark:text-white">What gets deducted</h4>
            <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-1">
              <li>Airwallex processing fees (~2–3%)</li>
              <li>Pledge.to platform fees (varies by charity)</li>
            </ul>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              Everything else ={' '}
              <span className="underline decoration-orange-400/50 underline-offset-4">100% to charity</span>
            </p>
          </div>
          <div className="rounded-xl border border-violet-200 dark:border-violet-900/40 p-6 bg-gradient-to-br from-violet-500/10 to-transparent shadow-md">
            <div className="relative mb-4 aspect-[16/10] w-full">
              <Image src="/images/100day-fs8.png" alt="Milestone donations" fill className="object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">100‑day donation (paid plans)</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              Comes from our revenue — not your stakes. We donate USD $5 (Pro) or USD $7 (Ultimate) to your chosen
              charity when you hit 100 days.
            </p>
            <h4 className="mt-4 font-medium text-slate-900 dark:text-white">Proof</h4>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="underline decoration-violet-400/50 underline-offset-4">
                Monthly livestream of all donations.
              </span>{' '}
              Full transparency.
            </p>
            <h4 className="mt-4 font-medium text-slate-900 dark:text-white">Tax receipts</h4>
            <p className="text-slate-700 dark:text-slate-300">
              Currently unavailable (donations are made in our name). We're working with Pledge.to to enable direct
              tax‑deductible donations in the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
