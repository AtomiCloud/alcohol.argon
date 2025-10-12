import type { GetServerSideProps } from 'next';
import { blogPosts } from '@/lib/blog/posts';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://lazytax.club';

const staticPaths = [
  '/',
  '/why-lazytax',
  '/pricing',
  '/about',
  '/blog',
  '/legal',
  '/legal/2025-09-26/privacy',
  '/legal/2025-09-26/terms',
  '/legal/2025-09-26/refund',
];

function buildSitemapXml(): string {
  const blogUrls = blogPosts.map(post => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    lastmod: new Date(post.publishedAt).toISOString(),
    changefreq: 'monthly',
  }));

  const staticUrls = staticPaths.map(loc => ({
    loc: `${baseUrl}${loc === '/' ? '' : loc}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
  }));

  const urls = [...staticUrls, ...blogUrls]
    .map(
      url => `    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <changefreq>${url.changefreq}</changefreq>
    </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = buildSitemapXml();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function SiteMap() {
  return null;
}
