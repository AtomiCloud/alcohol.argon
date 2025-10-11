import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { Badge } from '@/components/ui/badge';
import { blogPosts, getBlogPost, type BlogPost } from '@/lib/blog/posts';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const publishedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'LazyTax',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LazyTax',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lazytax.club/logo-source.svg',
      },
    },
    keywords: post.seoKeywords.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lazytax.club/blog/${post.slug}`,
    },
  };

  return (
    <>
      <Head>
        <title>{`${post.title} — LazyTax Blog`}</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.seoKeywords.join(', ')} />
      </Head>
      <Script id={`blog-structured-data-${post.slug}`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <article className="bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 sm:px-8 py-14 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <Link
              href="/blog"
              className="text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-300 transition-colors"
            >
              ← Back to blog
            </Link>
          </nav>

          <header className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {post.categories.map(category => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white leading-tight">
              {post.title}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <time dateTime={post.publishedAt}>{publishedDate}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          <div className="mt-10 space-y-12">
            {post.sections.map(section => (
              <section key={section.heading ?? section.paragraphs[0].slice(0, 32)} className="space-y-4">
                {section.heading && (
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{section.heading}</h2>
                )}
                {section.paragraphs.map(paragraph => (
                  <p key={paragraph.slice(0, 40)} className="text-base leading-7 text-slate-700 dark:text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <section className="space-y-4 border-l-4 border-orange-400/70 pl-4">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Key takeaway</h2>
              <p className="text-base leading-7 text-slate-700 dark:text-slate-300">{post.conclusion}</p>
            </section>

            <section className="rounded-xl bg-gradient-to-r from-orange-500/10 via-fuchsia-500/10 to-violet-500/10 dark:from-orange-500/20 dark:via-fuchsia-500/20 dark:to-violet-500/20 border border-orange-100/60 dark:border-orange-500/30 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Put it into practice</h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-4">
                LazyTax helps you design the accountability system you just read about. Set a stake, invite a partner,
                and get the reminders you need to keep your new habit alive.
              </p>
              <Link
                href="/api/logto/sign-in"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 px-4 py-2 rounded-lg transition-all"
              >
                Start your commitment
                <span aria-hidden>→</span>
              </Link>
            </section>
          </div>

          {relatedPosts.length > 0 && (
            <aside
              aria-label="Related articles"
              className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Keep learning</h2>
              <div className="space-y-4">
                {relatedPosts.map(related => (
                  <article key={related.slug}>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="text-base font-medium text-orange-600 dark:text-orange-300 hover:underline"
                    >
                      {related.title}
                    </Link>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{related.description}</p>
                  </article>
                ))}
              </div>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: blogPosts.map(post => ({ params: { slug: post.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async context => {
  const slug = context.params?.slug;

  if (typeof slug !== 'string') {
    return { notFound: true };
  }

  const post = getBlogPost(slug);

  if (!post) {
    return { notFound: true };
  }

  const relatedPosts = blogPosts.filter(other => other.slug !== post.slug).slice(0, 2);

  return {
    props: {
      post,
      relatedPosts,
    },
  };
};
