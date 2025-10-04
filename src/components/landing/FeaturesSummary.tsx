import { CheckCircle2, Zap, Shield, Heart, TrendingUp, Gift, Pause, Calendar, Bell, DollarSign } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Simple Check-Ins',
    description: 'One tap daily. No photos, no verification, no friction.',
  },
  {
    icon: DollarSign,
    title: 'Optional Stakes',
    description: 'Choose your amount (USD $1-2+). 100% goes to your chosen charity if you miss.',
  },
  {
    icon: Shield,
    title: 'Earned Freezes',
    description: 'Every 7-day streak earns auto-protection when life happens.',
  },
  {
    icon: Calendar,
    title: 'Flexible Habits',
    description: 'Set "X times per week" instead of daily (Pro/Ultimate).',
  },
  {
    icon: Pause,
    title: 'Monthly Skips',
    description: "Voluntary pauses that won't damage your streak or charge you.",
  },
  {
    icon: Pause,
    title: 'Vacation Mode',
    description: 'Pause everything during holidays or business trips (Pro/Ultimate).',
  },
  {
    icon: Gift,
    title: 'Milestone Rewards',
    description: 'Free months at 50, 200, 500 days. Charity donation at 100 days.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Tuned reminders that adapt to your routine (Pro/Ultimate).',
  },
  {
    icon: TrendingUp,
    title: 'Clear Analytics',
    description: 'Track streaks, view donation history, and celebrate progress.',
  },
  {
    icon: Heart,
    title: 'Transparent Giving',
    description: 'Monthly livestream of all donations. See where every dollar goes.',
  },
];

export default function FeaturesSummary() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" data-reveal>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/5 via-orange-500/5 to-emerald-500/5 pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center md:text-left">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            Everything you need to build lasting habits
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto md:mx-0">
            A complete system designed to help you succeed, from day one to day 500 and beyond.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-orange-500/10 p-2 shrink-0">
                    <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">{feature.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
