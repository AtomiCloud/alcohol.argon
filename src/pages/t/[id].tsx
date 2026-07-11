import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Nfc } from 'lucide-react';
import { useCommonConfig } from '@/adapters/external/Provider';

// Fallback landing for NFC habit tags (lazytax.club/t/{tagId}). Owners with the
// app never see this page — the OS intercepts /t/* via Universal/App Links and
// opens neon directly. This renders only for visitors without the app (or
// strangers scanning someone else's tag), so it is a pure marketing pitch: it
// resolves nothing and shows no habit data (tag ids mean nothing without the
// owner's auth).
export default function NfcTagLandingPage() {
  const common = useCommonConfig();
  const appName = common.app.name;

  return (
    <>
      <Head>
        <title>{`You found a ${appName} habit tag`}</title>
        <meta
          name="description"
          content={`This NFC tag completes a habit in ${appName} — the app that puts real money on the line for your habits.`}
        />
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <Image src="/mascot.svg" alt={`${appName} mascot`} width={96} height={96} className="mx-auto mb-4" />
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Nfc className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <CardTitle>This is a {appName} habit tag</CardTitle>
            <CardDescription>
              Someone taps this tag every day to keep a habit — miss a day and their stake goes to charity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Got the app? Tap the tag again and it opens automatically. Curious how it works?
            </p>
            <Button asChild className="w-full">
              <Link href="/">Discover {appName}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

// Force SSR: dynamic routes need a data-fetching method under the Pages
// Router, and this page must render for any tag id without a build-time list.
export async function getServerSideProps() {
  return { props: {} };
}
