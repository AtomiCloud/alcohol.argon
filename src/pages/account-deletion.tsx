import { useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem } from '@/lib/problem/core';
import { AlertTriangle, ShieldX, CheckCircle2 } from 'lucide-react';

// Public account-deletion page (Google Play requirement): a logged-out visitor who has
// uninstalled the app can still delete their account from the web. The visitor must prove
// ownership by signing in, then confirm an irreversible deletion. On success we sign them out.
const RETURN_PATH = '/account-deletion';
// Return the visitor to this page after the Logto round-trip (handled by /api/logto/sign-in).
const SIGN_IN_HREF = `/api/logto/sign-in?redirectBackUrl=${encodeURIComponent(RETURN_PATH)}`;
const SIGN_OUT_HREF = '/api/logto/sign-out';
const CONFIRM_PHRASE = 'DELETE';

type AccountDeletionProps = { authed: boolean };

type DeleteState =
  | { kind: 'idle' }
  | { kind: 'deleting' }
  | { kind: 'deleted' }
  | { kind: 'debt'; detail: string; amount?: string }
  | { kind: 'error'; detail: string };

function formatDebt(problem: Problem): { detail: string; amount?: string } {
  // The zinc `account_deletion_blocked` problem carries totalDebt + currency as extension members.
  const totalDebt = problem.totalDebt;
  const currency = typeof problem.currency === 'string' ? problem.currency : '';
  const amount =
    typeof totalDebt === 'number' || typeof totalDebt === 'string'
      ? `${totalDebt}${currency ? ` ${currency}` : ''}`
      : undefined;
  return { detail: problem.detail || 'You have an outstanding debt that must be settled first.', amount };
}

export default function AccountDeletionPage({ authed }: AccountDeletionProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const [confirmText, setConfirmText] = useState('');
  const [state, setState] = useState<DeleteState>({ kind: 'idle' });

  const canConfirm = confirmText.trim().toUpperCase() === CONFIRM_PHRASE && state.kind !== 'deleting';

  const handleDelete = async () => {
    if (!canConfirm) return;
    setState({ kind: 'deleting' });

    // DELETE /api/v1.0/User/Me — the SDK has no dedicated "Me" delete method, but vUserDelete builds
    // `/User/${id}`, so id='Me' produces exactly that URL, which routes to zinc's self-delete endpoint
    // (the literal `Me` segment wins over `{id}`). The Logto bearer is attached by the client.
    const result = await api.alcohol.zinc.api.vUserDelete({ version: '1.0', id: 'Me' });

    result.match({
      ok: () => {
        // Account + Logto identity are gone server-side. Clear the local Logto session and lock out.
        setState({ kind: 'deleted' });
        window.location.assign(SIGN_OUT_HREF);
      },
      err: (problem: Problem) => {
        if (problem.status === 409) {
          const { detail, amount } = formatDebt(problem);
          setState({ kind: 'debt', detail, amount });
          return;
        }
        problemReporter.pushError(new Error(problem.title || problem.type || 'Account deletion failed'), {
          source: 'account-deletion/delete',
          problem,
        });
        setState({ kind: 'error', detail: problem.detail || 'Something went wrong. Please try again.' });
      },
    });
  };

  return (
    <>
      <Head>
        <title>Delete account - LazyTax</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">Delete your account</CardTitle>
            </div>
            <CardDescription>
              This permanently deletes your LazyTax account and sign-in. There is no grace period and it cannot be
              undone.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {state.kind === 'deleted' ? (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/40 p-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  Your account has been deleted. Signing you out…
                </div>
              </div>
            ) : !authed ? (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To delete your account you first need to sign in, so we can confirm it&apos;s really you. You&apos;ll
                  come right back here afterwards.
                </p>
                <Button variant="destructive" onClick={() => window.location.assign(SIGN_IN_HREF)} className="w-full">
                  Sign in to continue
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">What gets deleted</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>Your profile, habits, history, vacations and freeze balances</li>
                    <li>Your payment details and settings</li>
                    <li>Your sign-in — you will be permanently logged out</li>
                  </ul>
                  <p className="mt-2 text-xs text-red-600/80 dark:text-red-300/70">
                    Past charity-donation records are kept for accounting, with your personal details removed.
                  </p>
                </div>

                {state.kind === 'debt' && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                      <p>
                        You can&apos;t delete your account while you have an outstanding debt
                        {state.amount ? ` of ${state.amount}` : ''}. Please settle it first.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => window.location.assign('/app')}>
                        Go to my account to settle
                      </Button>
                    </div>
                  </div>
                )}

                {state.kind === 'error' && (
                  <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300">
                    {state.detail}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm text-slate-700 dark:text-slate-300">
                    Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> to confirm
                  </label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_PHRASE}
                    autoComplete="off"
                    disabled={state.kind === 'deleting'}
                  />
                </div>

                <Button variant="destructive" className="w-full" disabled={!canConfirm} onClick={handleDelete}>
                  {state.kind === 'deleting' ? 'Deleting…' : 'Permanently delete my account'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'public' },
  async (context, { auth }): Promise<GetServerSidePropsResult<AccountDeletionProps>> => {
    // guard:'public' so a half-onboarded user is NOT bounced to onboarding — anyone authenticated
    // must be able to delete. We only need to know whether they're signed in.
    const authed = await auth.retriever
      .getClaims()
      .map(x => x.value.isAuthed)
      .unwrapOr(false);
    return { props: { authed } };
  },
);
