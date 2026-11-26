import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

const origin = process.env.ARGON_SECURITY_ORIGIN;

test.skipIf(!origin)(
  'BrowserAssets_ContainNoPrivateCanaries',
  async () => {
    const base = new URL(origin!);
    expect(['localhost', '127.0.0.1']).toContain(base.hostname);
    const privateInputs = [
      'ATOMI_SERVER__AUTH__LOGTO__APP__SECRET',
      'ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET',
      'ATOMI_CLIENT__FARO__BUILD__KEY',
      'ATOMI_SERVER__UNREVIEWED',
      'ATOMI_CLIENT__UNREVIEWED',
      'ATOMI_COMMON__APP__UNREVIEWED',
      'ATOMI_SERVER__DB__URL',
    ];
    for (const name of privateInputs) expect(Boolean(process.env[name])).toBe(true);
    const pending = new Set([
      '/',
      '/onboarding/',
      '/account-deletion/',
      '/app/',
      '/billing/',
      '/profile/',
      '/settings/',
      '/about/',
      '/pricing/',
      '/api/manifest/',
      '/api/auth/claims/',
      '/api/auth/tokens/',
      '/sw.js',
      '/sw.js.map',
    ]);
    const visited = new Set<string>();
    const responses: { path: string; status: number; bytes: number; sha256: string; privateMatches: string[] }[] = [];
    let publicControlFound = false;
    let runtimePublicControlFound = false;
    const inspect = (bytes: Uint8Array) => {
      const text = new TextDecoder().decode(bytes);
      const decoded = text.replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
      const forms = [text, decoded];
      for (const match of text.matchAll(/data:application\/json[^,]*;base64,([A-Za-z0-9+/=]+)/g)) {
        forms.push(Buffer.from(match[1], 'base64').toString());
      }
      publicControlFound ||= forms.some(value => value.includes(process.env.ATOMI_COMMON__APP__NAME!));
      const matches = privateInputs.filter(name => {
        const sentinel = process.env[name]!;
        return forms.some(value =>
          [sentinel, encodeURIComponent(sentinel), Buffer.from(sentinel).toString('base64')].some(form =>
            value.includes(form),
          ),
        );
      });
      for (const marker of ['src/config/server/', 'config/server/settings.yaml', 'BUILD_TIME_VARIABLES']) {
        if (forms.some(value => value.includes(marker))) matches.push(`forbidden-module:${marker}`);
      }
      return matches;
    };
    const drain = async () => {
      for (const path of pending) {
        if (visited.has(path)) continue;
        visited.add(path);
        const response = await fetch(new URL(path, base), { redirect: 'manual' });
        const location = response.headers.get('location');
        if (response.status >= 300 && response.status < 400 && location) {
          const target = new URL(location, base);
          // Authentication navigation is exercised by the separate local OIDC
          // control, not by an anonymous asset crawler without a login fixture.
          if (target.origin === base.origin && !target.pathname.startsWith('/api/logto/'))
            pending.add(target.pathname + target.search);
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        const text = new TextDecoder().decode(bytes);
        responses.push({
          path,
          status: response.status,
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          privateMatches: inspect(bytes),
        });
        for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
          const url = new URL(match[1].replaceAll('&amp;', '&'), base);
          if (url.origin === base.origin && /\.(?:js|json|map)(?:\?|$)/.test(url.pathname + url.search))
            pending.add(url.pathname + url.search);
        }
        const nextData = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextData) {
          const data = JSON.parse(nextData[1]);
          runtimePublicControlFound ||=
            data.props?.pageProps?._publicConfig?.common?.app?.name ===
            `${process.env.ATOMI_COMMON__APP__NAME}-runtime`;
          if (data.buildId && !data.page.includes('[')) {
            pending.add(`/_next/data/${data.buildId}/${data.page === '/' ? 'index' : data.page.slice(1)}.json`);
          }
        }
      }
    };
    await drain();
    const root = resolve(process.env.ARGON_SECURITY_ASSET_ROOT!);
    const emitted: { path: string; sha256: string; privateMatches: string[] }[] = [];
    for (const file of await readdir(root, { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue;
      const path = resolve(file.parentPath, file.name);
      const name = relative(root, path);
      const bytes = new Uint8Array(await readFile(path));
      emitted.push({
        path: name,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        privateMatches: inspect(bytes),
      });
      const urlPath = name.split('/').map(encodeURIComponent).join('/');
      pending.add(root.endsWith('/.next/static') ? `/_next/static/${urlPath}` : `/${urlPath}`);
      if (name.endsWith('.js'))
        pending.add(root.endsWith('/.next/static') ? `/_next/static/${urlPath}.map` : `/${urlPath}.map`);
    }
    await drain();
    const report = process.env.ARGON_SECURITY_REPORT!;
    await mkdir(dirname(report), { recursive: true });
    await writeFile(
      report,
      JSON.stringify(
        {
          utc: new Date().toISOString(),
          origin: base.origin,
          responses,
          emitted,
          publicControlFound,
          runtimePublicControlFound,
        },
        null,
        2,
      ),
    );
    const failures = [...responses, ...emitted]
      .filter(row => row.privateMatches.length > 0)
      .map(row => ({ path: row.path, privateMatches: row.privateMatches }));
    expect(responses.find(row => row.path === '/')?.status).toBe(200);
    expect(responses.filter(row => row.status >= 500)).toEqual([]);
    for (const path of ['/api/manifest/', '/api/auth/claims/', '/api/auth/tokens/']) {
      expect(responses.find(row => row.path === path)?.status).toBe(200);
    }
    expect(emitted.length).toBeGreaterThan(0);
    expect(publicControlFound).toBe(true);
    if (process.env.ARGON_SECURITY_RUNTIME_OVERRIDES === '1') {
      expect(runtimePublicControlFound).toBe(true);
      const manifest = await (await fetch(new URL('/api/manifest/', base))).json();
      expect(manifest.name).toBe(`${process.env.ATOMI_COMMON__APP__NAME}-runtime`);
    }
    expect(failures).toEqual([]);
  },
  180_000,
);
