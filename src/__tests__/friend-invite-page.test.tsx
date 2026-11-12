import { describe, expect, it } from 'bun:test';
import type { GetServerSidePropsContext } from 'next';
import { serverRender } from './server-render';

const APP_URL = 'https://lazytax.club';

const { default: FriendInvitePage, getServerSideProps } = await import('@/pages/f/[code]');

const ssr = (code: string | undefined) =>
  getServerSideProps({ params: code === undefined ? {} : { code } } as GetServerSidePropsContext);

// What a link previewer gets for /f/{code}: the page rendered through _app on the server.
const render = (code: string) => serverRender('/f/[code]', FriendInvitePage, { code });

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
  it('shows the code in the server HTML', () => {
    const { body } = render('k7m2qd');
    expect(body).toContain('>k7m2qd<');
    expect(body).not.toContain('>Loading...<');
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
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image"/>');
  });
});
