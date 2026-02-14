import { SignInCTA } from '@/components/ui/sign-in-cta';
import { useClaims } from '@/lib/auth/providers';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';

export default function FinalCTA() {
  const [t, v] = useClaims();
  const track = usePlausible();
  const isAuthed = t === 'ok' && v[0] && v[1]?.value.isAuthed;

  function onPrimary() {
    track(TrackingEvents.Landing.FinalCTA.Clicked);
    if (isAuthed) window.location.assign('/app');
    else window.location.assign('/api/logto/sign-in');
  }

  return (
    <section className="py-10 sm:py-14" data-reveal>
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-orange-500/10 to-violet-500/10 p-8 sm:p-10 text-center md:text-left">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Ready to build habits that stick?
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {isAuthed ? 'Jump back in and continue your streak.' : 'Start now — it takes under a minute.'}
          </p>
          <div className="mt-6">
            <SignInCTA
              onClick={onPrimary}
              className="h-12 min-w-[220px] px-7 text-base font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 shadow-lg hover:shadow-xl ring-1 ring-white/20 dark:ring-white/10 rounded-xl transition-all"
            >
              {isAuthed ? 'Open your app' : 'Start your first habit'}
            </SignInCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
