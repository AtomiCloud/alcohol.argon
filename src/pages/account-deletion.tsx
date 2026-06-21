import { useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SignInCTA } from '@/components/ui/sign-in-cta';
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
  // zinc nests them under `data`, so check there first, then fall back to top-level.
  const data = (problem.data ?? problem) as Record<string, unknown>;
  const totalDebt = data.totalDebt ?? problem.totalDebt;
  const currency =
    typeof data.currency === 'string' ? data.currency : typeof problem.currency === 'string' ? problem.currency : '';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, setState] = useState<DeleteState>({ kind: 'idle' });

  const phraseOk = confirmText.trim().toUpperCase() === CONFIRM_PHRASE;
  const deleting = state.kind === 'deleting';

  const handleDelete = async () => {
    setState({ kind: 'deleting' });

    // DELETE /api/v1.0/User/Me — the SDK has no dedicated "Me" delete method, but vUserDelete builds
    // `/User/${id}`, so id='Me' produces exactly that URL, which routes to zinc's self-delete endpoint
    // (the literal `Me` segment wins over `{id}`). The Logto bearer is attached by the client.
    const result = await api.alcohol.zinc.api.vUserDelete({ version: '1.0', id: 'Me' });

    result.match({
      ok: () => {
        // Account + Logto identity are gone server-side. Clear the local Logto session and lock out.
        setConfirmOpen(false);
        setState({ kind: 'deleted' });
        window.location.assign(SIGN_OUT_HREF);
      },
      err: (problem: Problem) => {
        setConfirmOpen(false);
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
        <Card className="border-destructive/30">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <ShieldX className="w-6 h-6 text-destructive" />
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
              <Alert>
                <CheckCircle2 className="text-green-600 dark:text-green-400" />
                <AlertTitle>Your account has been deleted</AlertTitle>
                <AlertDescription>Signing you out…</AlertDescription>
              </Alert>
            ) : !authed ? (
              <>
                <p className="text-sm text-muted-foreground">
                  To delete your account you first need to sign in, so we can confirm it&apos;s really you. You&apos;ll
                  come right back here afterwards.
                </p>
                <SignInCTA href={SIGN_IN_HREF} icon="arrow" className="w-full">
                  Sign in to continue
                </SignInCTA>
              </>
            ) : (
              <>
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertTitle>What gets deleted</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your profile, habits, history, vacations and freeze balances</li>
                      <li>Your payment details and settings</li>
                      <li>Your sign-in — you will be permanently logged out</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      Past charity-donation records are kept for accounting, with your personal details removed.
                    </p>
                  </AlertDescription>
                </Alert>

                {state.kind === 'debt' && (
                  <Alert>
                    <AlertTriangle className="text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Settle your outstanding debt first</AlertTitle>
                    <AlertDescription>
                      <p>
                        You can&apos;t delete your account while you have an outstanding debt
                        {state.amount ? ` of ${state.amount}` : ''}. It&apos;s collected automatically at the end of the
                        month — once it&apos;s cleared, you can delete your account here.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {state.kind === 'error' && (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>Account deletion failed</AlertTitle>
                    <AlertDescription>{state.detail}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm text-muted-foreground">
                    Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> to confirm
                  </label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_PHRASE}
                    autoComplete="off"
                    disabled={deleting}
                  />
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!phraseOk || deleting}
                  onClick={() => setConfirmOpen(true)}
                >
                  Permanently delete my account
                </Button>

                <ConfirmDialog
                  open={confirmOpen}
                  onOpenChange={setConfirmOpen}
                  onCancel={() => setConfirmOpen(false)}
                  onConfirm={handleDelete}
                  loading={deleting}
                  confirmLabel={deleting ? 'Deleting…' : 'Yes, delete forever'}
                  cancelLabel="Keep my account"
                  confirmVariant="destructive"
                  title="Delete your account permanently?"
                  description={
                    <span>
                      This removes your profile, habits, payment details and sign-in. It happens immediately and
                      <strong> cannot be undone.</strong>
                    </span>
                  }
                />
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
