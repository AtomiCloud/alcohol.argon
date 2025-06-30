import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HomeProps {
  serverTime: string;
  userAgent: string;
}

export default function Home({ serverTime, userAgent }: HomeProps) {
  return (
    <>
      <Head>
        <title>Alcohol Argon - SSR Frontend</title>
        <meta name="description" content="Next.js SSR frontend with OpenNext on Cloudflare Workers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              Alcohol Argon
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Next.js SSR Frontend with OpenNext on Cloudflare Workers :3
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Server-Side Rendering</CardTitle>
                <CardDescription>This page was rendered on the server</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Server time: <span className="font-mono font-semibold">{serverTime}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloudflare Workers</CardTitle>
                <CardDescription>Running on the edge</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Deployed with OpenNext adapter for optimal performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modern Stack</CardTitle>
                <CardDescription>Built with the latest technologies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Next.js 15 with Pages Router</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="mr-4" asChild>
              <Link href="/search">Try Search</Link>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>

          <Card className="mt-12 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>Server-side request details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">User Agent:</span>
                  <p className="font-mono text-xs mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">{userAgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ req }) => {
  // This runs on the server for each request
  const serverTime = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'Unknown';

  return {
    props: {
      serverTime,
      userAgent,
    },
  };
};
