import type { GetServerSideProps } from 'next';

// Magic-link landing for the neon→web handoff. zinc's web-handoff endpoint
// (alcohol.zinc WebHandoffService.BuildUrl) mints links of the shape
//   /auth/handoff?one_time_token=...&login_hint=...&redirect=/billing
// with param names deliberately matching Logto's signIn extraParams keys.
// This page just forwards them to the Logto OTT sign-in API route, which
// applies the same-origin guard on the redirect path.
const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export const getServerSideProps: GetServerSideProps = async context => {
  const ott = first(context.query.one_time_token);
  const email = first(context.query.login_hint);
  const redirect = first(context.query.redirect) ?? '/billing';

  const params = new URLSearchParams();
  if (ott) params.set('ott', ott);
  if (email) params.set('email', email);
  params.set('redirectBackUrl', redirect);

  return {
    redirect: {
      destination: `/api/logto/ott-sign-in?${params.toString()}`,
      permanent: false,
    },
  };
};

// Never rendered — gssp always redirects.
export default function AuthHandoffPage() {
  return null;
}
