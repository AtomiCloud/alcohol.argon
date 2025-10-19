import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/lib/blog/posts';

const sortedPosts = [...blogPosts].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

export default function BlogIndexPage() {
  return (
    <>
      <Head>
        <title>LazyTax Blog — Habit Science, Accountability, and Commitment Devices</title>
        <meta
          name="description"
          content="Actionable guides on building habits that last, using accountability, commitment devices, and the LazyTax playbook."
        />
        <meta
          name="keywords"
          content="habits, accountability, commitment devices, habit tracker, streaks, behavior change, LazyTax blog"
        />
      </Head>
      <article className="bg-gradient-to-br from-orange-50/70 via-white to-violet-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6 sm:px-8 py-16 max-w-5xl">
          <header className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wide">
              LazyTax Blog
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Build habits that win in real life
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Evidence-based strategies for designing streaks, adding smart accountability, and using commitment devices
              without burning out. New essays every few weeks from the LazyTax team.
            </p>
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg">
                <a href="#articles" className="font-semibold">
                  Start reading
                </a>
              </Button>
            </div>
          </header>

          <section id="articles" aria-label="Blog articles" className="grid gap-8 md:grid-cols-2">
            {sortedPosts.map(post => {
              const publishedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <article key={post.slug} className="h-full">
                  <Card className="h-full border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map(category => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-2xl text-slate-900 dark:text-white">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                      <p>{post.description}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col">
                        <time dateTime={post.publishedAt}>{publishedDate}</time>
                        <span>{post.readTime}</span>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/blog/${post.slug}`} className="font-medium">
                          Read article →
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </article>
              );
            })}
          </section>
        </div>
      </article>
    </>
  );
}
