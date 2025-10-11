import { Button } from '@/components/ui/button';
import { useClaims } from '@/lib/auth/providers';
import { ArrowRight, Rocket } from 'lucide-react';

export default function FinalCTA() {
  const [t, v] = useClaims();
  const isAuthed = t === 'ok' && v[0] && v[1]?.value.isAuthed;

  function onPrimary() {
    if (isAuthed) window.location.assign('/app');
    else window.location.assign('/api/logto/sign-in');
  }

  return (
    <section className="py-16 sm:py-20" data-reveal>
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-orange-500/10 to-violet-500/10 p-8 sm:p-10 text-center md:text-left">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Ready to build habits that stick?
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {isAuthed ? 'Jump back in and continue your streak.' : 'Start now — it takes under a minute.'}
          </p>
          <div className="mt-6">
            <Button
              onClick={onPrimary}
              className="h-12 min-w-[220px] px-7 text-base font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 shadow-lg hover:shadow-xl ring-1 ring-white/20 dark:ring-white/10 rounded-xl transition-all"
            >
              <Rocket className="mr-2 h-5 w-5" />
              {isAuthed ? 'Open your app' : 'Start your first habit'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
