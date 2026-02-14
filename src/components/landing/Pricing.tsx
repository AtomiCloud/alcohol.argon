import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function Pricing() {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');

  const PRICE = {
    monthly: {
      pro: { original: 9.99, launch: 4.99 },
      ultimate: { original: 14.99, launch: 7.99 },
    },
    annual: {
      pro: { original: 109.99, launch: 54.99 },
      ultimate: { original: 159.99, launch: 74.99 },
    },
  } as const;

  const fmt = (n: number) => n.toFixed(2);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 bg-gradient-to-br from-orange-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      data-reveal
    >
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_rgba(15,118,110,0.18),_transparent_45%)]"
        aria-hidden
      />
      <div className="container mx-auto px-6 sm:px-8 max-w-6xl rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm shadow-2xl py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white text-center md:text-left">
              Pricing plans for every habit builder
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg text-center md:text-left max-w-2xl mx-auto md:mx-0">
              Launch discount: Lock in these prices forever when you subscribe now.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-md p-1 w-fit mx-auto md:mx-0">
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`${period === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'} px-3 py-1.5 rounded-sm text-sm font-medium`}
              aria-pressed={period === 'monthly'}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('annual')}
              className={`${period === 'annual' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'} px-3 py-1.5 rounded-sm text-sm font-medium`}
              aria-pressed={period === 'annual'}
            >
              Annual
            </button>
          </div>
        </div>
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
          <Card className="relative border-violet-300 dark:border-violet-900/40 bg-gradient-to-b from-violet-500/10 to-transparent shadow-lg h-full flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              <span className="rounded-full bg-violet-600 text-white text-xs font-semibold px-3 py-1 whitespace-nowrap">
                Most Popular
              </span>
              <span className="rounded-full bg-violet-600/90 text-white text-xs font-semibold px-3 py-1 whitespace-nowrap">
                Launch Exclusive
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">USD ${fmt(PRICE[period].pro.launch)}</span>
                    <span className="text-xs text-slate-500">/{period === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <span className="text-xs font-normal text-violet-600 dark:text-violet-400">
                    <span className="line-through text-slate-400 mr-1">${fmt(PRICE[period].pro.original)}</span>
                    Launch price — lock in forever
                  </span>
                </div>
              </CardTitle>
              <CardDescription>Pro — Everything in Free, plus:</CardDescription>
              <div className="text-[11px] text-violet-700 dark:text-violet-300 mt-1">
                Launch exclusive: we’ll let you lock in this price when plans open.
              </div>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 mt-auto opacity-60">
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
            {/* Coming Soon overlay for Pro */}
            <div
              className="pointer-events-auto absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center cursor-not-allowed"
              aria-label="Pro plan coming soon"
              role="presentation"
            >
              <span className="text-white/90 font-semibold text-sm tracking-wide uppercase">Coming soon</span>
            </div>
          </Card>
          {/* Ultimate card in same grid */}
          <Card className="relative border-amber-300 dark:border-amber-900/40 bg-gradient-to-b from-amber-500/10 to-transparent shadow-lg h-full flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              <span className="rounded-full bg-amber-600 text-white text-xs font-semibold px-3 py-1 whitespace-nowrap">
                Best Value
              </span>
              <span className="rounded-full bg-amber-600/90 text-white text-xs font-semibold px-3 py-1 whitespace-nowrap">
                Launch Exclusive
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">USD ${fmt(PRICE[period].ultimate.launch)}</span>
                    <span className="text-xs text-slate-500">/{period === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <span className="text-xs font-normal text-amber-700 dark:text-amber-400">
                    <span className="line-through text-slate-400 mr-1">${fmt(PRICE[period].ultimate.original)}</span>
                    Launch price — lock in forever
                  </span>
                </div>
              </CardTitle>
              <CardDescription>Ultimate — Everything in Pro, plus:</CardDescription>
              <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                Launch exclusive: we’ll let you lock in this price when plans open.
              </div>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 mt-auto opacity-60">
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Unlimited habits</li>
                <li>
                  <span className="inline-flex items-center gap-1">
                    <span>Earn more freezes</span>
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
                <li>We donate USD $15 at 100 days</li>
                <li>Priority support</li>
              </ul>
            </CardContent>
            {/* Coming Soon overlay for Ultimate */}
            <div
              className="pointer-events-auto absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center cursor-not-allowed"
              aria-label="Ultimate plan coming soon"
              role="presentation"
            >
              <span className="text-white/90 font-semibold text-sm tracking-wide uppercase">Coming soon</span>
            </div>
          </Card>
        </div>

        <div className="mt-6 rounded-xl border border-orange-200 dark:border-orange-900/40 p-6 bg-gradient-to-tr from-orange-500/10 to-violet-500/10 shadow-lg grid md:grid-cols-2 gap-4 items-center">
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-xl flex items-center gap-2">
              🚀{' '}
              <span className="bg-gradient-to-r from-orange-600 to-violet-600 bg-clip-text text-transparent">
                Launch Discount — Lock It In
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Join now to lock in the launch price forever and unlock limited, high-touch perks:
            </p>
            <div className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-500/15 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0">
                  All
                </span>
                <span>
                  <strong>Founders Badge:</strong> A profile tag that celebrates founding members
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0">
                  All
                </span>
                <span>
                  <strong>Priority support:</strong> Direct line to the team with fast-track responses
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-semibold shrink-0">
                  All
                </span>
                <span>
                  <strong>Feature influence:</strong> Vote on upcoming features and join private betas
                </span>
              </div>
            </div>
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
