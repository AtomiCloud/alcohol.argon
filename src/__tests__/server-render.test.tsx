import { describe, expect, it, mock } from 'bun:test';
import type { AppProps } from 'next/app';
import type { NextRouter } from 'next/router';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { HeadManagerContext } from 'next/dist/shared/lib/head-manager-context.shared-runtime';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

// Render as production (raichu); every deployed build sets a landscape.
process.env.LANDSCAPE = 'raichu';
// Built from a config webpack inlines at build time.
mock.module('@/lib/seo/generated-config', () => ({ generatedSeoConfig: {} }));

const { default: App } = await import('@/pages/_app');
const { default: FriendInvitePage } = await import('@/pages/f/[code]');

// Server-renders a page through the real _app and providers, the way Next's
// pages renderer does: next/head hands its tags to the head manager.
function serverRender(path: string, Component: AppProps['Component'], pageProps: object) {
  let headTags: ReactNode[] = [];
  const headManager = {
    mountedInstances: new Set(),
    updateHead: (tags: ReactNode[]) => {
      headTags = tags;
    },
  };
  const router = {
    pathname: path,
    asPath: path,
    route: path,
    query: pageProps,
    basePath: '',
    isReady: true,
    isFallback: false,
    isPreview: false,
    isLocaleDomain: false,
    events: { on() {}, off() {}, emit() {} },
    push: async () => true,
    replace: async () => true,
    prefetch: async () => {},
    back() {},
    forward() {},
    reload() {},
    beforePopState() {},
  } as unknown as NextRouter;
  const body = renderToString(
    <RouterContext.Provider value={router}>
      <HeadManagerContext.Provider value={headManager}>
        <App Component={Component} pageProps={pageProps} router={router as AppProps['router']} />
      </HeadManagerContext.Provider>
    </RouterContext.Provider>,
  );
  return { head: headTags.map(tag => renderToString(tag)).join(''), body };
}

describe('server render through _app', () => {
  it("puts the invite page's link-preview tags and content in the server HTML", () => {
    const { head, body } = serverRender('/f/[code]', FriendInvitePage, { code: 'smoketest' });
    expect(head).toContain('<meta property="og:image" content="https://lazytax.club/og-invite.png"/>');
    expect(head).toContain('<meta property="og:title" content="Be my friend on LazyTax"/>');
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image"/>');
    expect(body).toContain('>smoketest<');
    expect(body).not.toContain('>Loading...<');
  });
});
