import { describe, expect, it, mock } from 'bun:test';
import type { GetServerSidePropsContext } from 'next';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeadManagerContext } from 'next/dist/shared/lib/head-manager-context.shared-runtime';

const APP_URL = 'https://lazytax.club';

mock.module('@/adapters/external/Provider', () => ({
  useConfig: () => ({
    common: {
      app: { name: 'LazyTax', url: APP_URL, description: 'Default description' },
      seo: { twitter: { site: '@lazytax' } },
    },
  }),
}));
// Built from a config webpack inlines at build time; this page doesn't use it.
mock.module('@/lib/seo/generated-config', () => ({ generatedSeoConfig: {} }));

// Imported after the mock so the page and usePageSEO read the stub config.
const { default: FriendInvitePage, getServerSideProps } = await import('@/pages/f/[code]');

const ssr = (code: string | undefined) =>
  getServerSideProps({ params: code === undefined ? {} : { code } } as GetServerSidePropsContext);

// Renders the page the way Next's server does: next/head hands its tags to the head manager.
function render(code: string): { head: string; body: string } {
  let headTags: ReactNode[] = [];
  const headManager = {
    mountedInstances: new Set(),
    updateHead: (tags: ReactNode[]) => {
      headTags = tags;
    },
  };
  const body = renderToStaticMarkup(
    <HeadManagerContext.Provider value={headManager}>
      <FriendInvitePage code={code} />
    </HeadManagerContext.Provider>,
  );
  return { head: headTags.map(tag => renderToStaticMarkup(tag)).join(''), body };
}

describe('/f/[code] getServerSideProps', () => {
  it('lower-cases a valid code and passes it to the page', async () => {
    expect(await ssr('K7m2QD')).toEqual({ props: { code: 'k7m2qd' } });
  });

  it('accepts codes of 4 and 32 characters', async () => {
    expect(await ssr('abcd')).toEqual({ props: { code: 'abcd' } });
    expect(await ssr('a'.repeat(32))).toEqual({ props: { code: 'a'.repeat(32) } });
  });

  it.each([
    ['a code that is too short', 'abc'],
    ['a code that is too long', 'a'.repeat(33)],
    ['a code with punctuation', 'abc-def'],
    ['a path', '../etc'],
    ['an empty code', ''],
    ['a missing code', undefined],
  ])('returns notFound for %s', async (_, code) => {
    expect(await ssr(code)).toEqual({ notFound: true });
  });
});

describe('/f/[code] page', () => {
  it('shows the code', () => {
    expect(render('k7m2qd').body).toContain('>k7m2qd<');
  });

  it('says the invite sends a friend request the inviter accepts, and never expires', () => {
    const { body } = render('k7m2qd');
    expect(body).toContain('This sends them a friend request. You become friends once they accept it.');
    expect(body).not.toMatch(/\bdays?\b|expire/i);
  });

  it('serves the invite link-preview tags with an absolute image URL', () => {
    const { head } = render('k7m2qd');
    expect(head).toContain(`<meta property="og:image" content="${APP_URL}/og-invite.png"/>`);
    expect(head).toContain('<meta property="og:title" content="Be my friend on LazyTax"/>');
    expect(head).toContain(
      '<meta property="og:description" content="Keep each other honest on your habits. Open the invite to send me a friend request."/>',
    );
    expect(head).toContain(`<meta property="og:url" content="${APP_URL}/f/k7m2qd/"/>`);
  });
});
