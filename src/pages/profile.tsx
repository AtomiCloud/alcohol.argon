import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTokens } from '@/lib/auth/providers';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';
import type { UserInfoResponse } from '@logto/next';
import { type ResultSerial, Res } from '@/lib/monads/result';
import type { Problem } from '@/lib/problem/core';
import type { AuthState } from '@/lib/auth/core/types';
import { useContent } from '@/lib/content/providers';
import { useDebug } from '@/lib/debug';

interface ClaimItemProps {
  label: string;
  value: unknown;
}

function ClaimItem({ label, value }: ClaimItemProps) {
  const displayValue = value === null ? 'null' : value === undefined ? 'undefined' : String(value);

  return (
    <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-shrink-0">{label}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400 break-all overflow-wrap-anywhere min-w-0">
          {displayValue}
        </span>
      </div>
    </div>
  );
}

function TokensSection() {
  const [tokenResult, tokenContent] = useTokens();

  if (tokenResult === 'err') {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Access Tokens & ID Token</CardTitle>
          <CardDescription>Authentication tokens for API access and identity verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Error loading tokens</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [hasTokenData, tokenState] = tokenContent;

  if (!hasTokenData) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Access Tokens & ID Token</CardTitle>
          <CardDescription>Authentication tokens for API access and identity verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">Loading tokens...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Access Tokens & ID Token (Client-Side)</span>
        </CardTitle>
        <CardDescription>
          Authentication tokens for API access and identity verification (loaded client-side)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tokenState.__kind === 'authed' ? (
          (() => {
            const tokenSet = tokenState.value.data;
            return (
              <div className="space-y-6">
                {/* Access Tokens Section */}
                {tokenSet.accessTokens && Object.keys(tokenSet.accessTokens).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Access Tokens
                    </h3>
                    <div className="space-y-0 border border-slate-200 dark:border-slate-700 rounded-lg">
                      {Object.entries(tokenSet.accessTokens).map(([resource, token]) => (
                        <div
                          key={resource}
                          className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{resource}</span>
                            <Badge variant="secondary" className="text-xs">
                              Access Token
                            </Badge>
                          </div>
                          <ClaimItem label="Token" value={token} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ID Token Section */}
                {tokenSet.idToken && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                      ID Token
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Identity Token</span>
                        <Badge variant="secondary" className="text-xs">
                          ID Token
                        </Badge>
                      </div>
                      <ClaimItem label="Token" value={tokenSet.idToken} />
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No tokens available</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No authentication tokens were found. Please ensure you're logged in.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Unauthenticated() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Authentication Required</span>
            </CardTitle>
            <CardDescription>You need to be signed in to view your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/api/logto/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ProfilePageProps {
  result: ResultSerial<AuthState<UserInfoResponse>, Problem>;
}

export default function ProfilePage({ result }: ProfilePageProps) {
  const contentResult = Res.fromSerial<AuthState<UserInfoResponse>, Problem>(result);

  const userInfo = useContent(contentResult, { notFound: 'User not authenticated' });

  if (!userInfo) return <></>;

  // Handle unauthed state - show sign-in page
  if (!userInfo.value.isAuthed) return <Unauthenticated />;

  const typedUserInfo = userInfo.value.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">
                {(typedUserInfo.name ?? 'Unknown').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {typedUserInfo.name ?? 'User Profile'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">{typedUserInfo.email ?? 'Authenticated User'}</p>
            </div>
          </div>

          <Link href={'/profile'}>Profile</Link>

          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className="text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/20"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Authenticated
            </Badge>
            <Badge variant="secondary">Fields: {Object.keys(typedUserInfo || {}).length}</Badge>
          </div>
        </div>

        {/* Claims Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-slate-600 dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>User Information (Server-Side)</span>
            </CardTitle>
            <CardDescription>User profile information from your identity provider (loaded server-side)</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(typedUserInfo).length > 0 ? (
              <div className="space-y-0">
                {Object.entries(typedUserInfo).map(([key, value]) => (
                  <ClaimItem key={key} label={key} value={value} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No claims available</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  No user claims were found in your authentication data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client-Side Tokens Section */}
        <TokensSection />

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            className="text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
            onClick={() => window.location.assign('/api/logto/sign-out')}
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = withServerSideAtomi(buildTime, async (_, { auth }) => {
  const result = await auth.retriever.getUserInfo().serial();
  return { props: { result } };
});
