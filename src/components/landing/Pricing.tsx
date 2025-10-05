import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function Pricing() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-500/5 via-transparent to-orange-500/5"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          Launch pricing for waitlist members
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left max-w-2xl">
          Early adopters get{' '}
          <span className="underline decoration-violet-400/50 underline-offset-4">
            locked-in launch pricing forever
          </span>
          . Join now before spots run out.
        </p>
        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-3 items-stretch">
          <Card className="border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/80 shadow-md h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Free Forever</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 mt-auto">
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>2 habits with streak tracking</li>
                <li>Optional stakes (you control amount)</li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Monthly skips</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Voluntary skipping of a habit. Won't damage your streak or charge you. Manual use only."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-violet-300 dark:border-violet-900/40 bg-gradient-to-b from-violet-500/10 to-transparent shadow-lg h-full flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-violet-600 text-white text-xs font-semibold px-3 py-1">Recommended</span>
            </div>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">USD $4.99</span>
                    <span className="text-sm line-through text-slate-400">$9.99</span>
                    <span className="text-xs text-slate-500">/month</span>
                  </div>
                  <span className="text-xs font-normal text-violet-600 dark:text-violet-400">
                    Launch price locked forever
                  </span>
                </div>
              </CardTitle>
              <CardDescription>Pro — Everything in Free, plus:</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 mt-auto">
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Up to 10 habits</li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Earn freezes</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Auto-triggered protection when you forget to check in. Protects ALL habits for the day. Earn 1 per 7-day streak."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Flexible habits</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Set goals like '3 times per week' instead of daily. Perfect for gym, meditation, or any habit that doesn't need to be daily."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
                <li>Tuned notifications</li>
                <li>Milestone rewards (free months)</li>
                <li>We donate USD $5 at 100 days</li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Vacation mode</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Pause your entire account when you're on holiday or business trips. No check-ins required, no streaks broken, no charges accumulated."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-emerald-300 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-500/10 to-transparent shadow-md h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">USD $6.99</span>
                    <span className="text-sm line-through text-slate-400">$13.99</span>
                    <span className="text-xs text-slate-500">/month</span>
                  </div>
                  <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                    Launch price locked forever
                  </span>
                </div>
              </CardTitle>
              <CardDescription>Ultimate — Everything in Pro, plus:</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 mt-auto">
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Unlimited habits</li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>More freezes</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Auto-triggered protection when you forget to check in. Protects ALL habits for the day. Earn more per streak in Ultimate."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Debt cap</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Set a maximum amount you can donate per month. This prevents overspending and gives you full control over your budget."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Future device sync</span>
                    <HelpCircle
                      className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-help"
                      data-tooltip-id="pricing-tooltip"
                      data-tooltip-content="Sync with Garmin, Apple Watch, todo lists, and other productivity tools. Coming soon."
                      data-tooltip-place="top"
                    />
                  </span>
                </li>
                <li>We donate USD $7 at 100 days</li>
                <li>Priority support</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 rounded-xl border border-orange-200 dark:border-orange-900/40 p-6 bg-gradient-to-tr from-orange-500/10 to-violet-500/10 shadow-lg grid md:grid-cols-2 gap-4 items-center">
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-xl flex items-center gap-2">
              🚀{' '}
              <span className="bg-gradient-to-r from-orange-600 to-violet-600 bg-clip-text text-transparent">
                Waitlist Exclusive Bonuses
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              When you join the waitlist, you'll receive an exclusive discount code for launch day. The first 100
              sign-ups on launch get:
            </p>
            <div className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 text-xs font-semibold shrink-0">
                  1-10
                </span>
                <span>
                  <strong>First 10 signups:</strong> Ultimate FREE Forever
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-semibold shrink-0">
                  11-20
                </span>
                <span>
                  <strong>Next 10 signups:</strong> Pro FREE Forever
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0">
                  21-100
                </span>
                <span>
                  <strong>Next 80 signups:</strong> Pro FREE for 1 Year
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
              <strong>Note:</strong> All waitlist members can lock in launch pricing (USD $4.99 Pro, USD $6.99 Ultimate)
              forever. The charity donation at 100 days is only available for paying subscribers. Lifetime free members
              are not eligible. First-year free members become eligible after converting to a paid plan.
            </p>
          </div>
          <div className="relative aspect-[16/10] w-full">
            <Image src="/images/rocky-fs8.png" alt="Launch bonus analytics showcase" fill className="object-contain" />
          </div>
        </div>
      </div>
      <Tooltip
        id="pricing-tooltip"
        className="max-w-[200px] !bg-slate-900 dark:!bg-slate-100 !text-white dark:!text-slate-900 !opacity-100 z-50"
        clickable
        openOnClick
        closeOnEsc
        closeOnScroll={false}
        events={['click']}
      />
    </section>
  );
}
