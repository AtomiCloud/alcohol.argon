import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import type { GetServerSideProps } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/adapters/external/Provider';
import { usePageSEO } from '@/lib/seo';

// Friend invite links are shared as t.lazytax.club/f/{code}. With the neon app
// installed, the OS opens the app (Universal/App Links, served by
// alcohol.helium), which accepts the invite. Everyone else is redirected here.
// This page has two jobs: the Open Graph card that WhatsApp, Messages and
// others render when the link is shared, and showing the code for someone who
// installs the app later. It calls no API: the code is meaningless without the
// recipient's sign-in.
interface Props {
  code: string;
}

export default function FriendInvitePage({ code }: Props) {
  const { common } = useConfig();
  const appName = common.app.name;
  const seo = usePageSEO({
    title: `Be my friend on ${appName}`,
    description: 'Keep each other honest on your habits. Open the invite to add me as a friend.',
    canonical: `/f/${code}/`,
    image: '/og-invite.png',
    noIndex: true,
  });

  return (
    <>
      <NextSeo {...seo} />
      {/* Layout already renders the page-level <main>; keep this a plain section. */}
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <Image src="/mascot.svg" alt={`${appName} mascot`} width={96} height={96} className="mx-auto mb-4" />
            <CardTitle>You&apos;re invited to be friends on {appName}</CardTitle>
            <CardDescription>
              Friends on {appName} can be told when one of you misses a habit, so you keep each other honest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Got the app? Open this link on your phone and it accepts the invite. Otherwise, in the app go to Profile →
              Friends → Enter a code:
            </p>
            <p className="font-mono text-2xl font-semibold tracking-wider">{code}</p>
            <p className="text-xs text-muted-foreground">The invite works for 7 days.</p>
            <Button asChild className="w-full">
              <Link href="/">Discover {appName}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

// SSR so any code renders, and so link-preview crawlers (which don't run JS)
// get the Open Graph tags in the HTML.
export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const raw = typeof params?.code === 'string' ? params.code.toLowerCase() : '';
  if (!/^[a-z0-9]{4,32}$/.test(raw)) return { notFound: true };
  return { props: { code: raw } };
};
