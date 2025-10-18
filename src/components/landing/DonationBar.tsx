import type React from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DonationBarProps {
  totalDonated: number;
  goal?: number;
}

export default function DonationBar({ totalDonated, goal = 100000 }: DonationBarProps) {
  const percentage = Math.min((totalDonated / goal) * 100, 100);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalDonated);

  const formattedGoal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(goal);

  return (
    <section
      className="py-8 sm:py-12 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-orange-950/30 border-y border-rose-200/50 dark:border-rose-900/50"
      data-reveal
    >
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500 animate-pulse" />
            <Badge
              variant="secondary"
              className="uppercase tracking-wide text-xs px-3 py-1 bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800"
            >
              Community Impact
            </Badge>
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Total Donated to Charity
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            When LazyTax users miss a check-in, their stakes go to charities they choose. Together, we're making an
            impact.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Amount Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                {formattedAmount}
              </span>
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500 mb-2" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">raised for charitable causes</p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span>$0</span>
              <span className="font-semibold">Goal: {formattedGoal}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-lg p-4 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {Math.round(percentage)}%
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">of goal</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-lg p-4 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {Math.floor(totalDonated / 50)}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">contributions</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-lg p-4 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">15+</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">charities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
