import { plugin } from 'bun';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// Resolve imports the way Next's webpack build does, so tests can load real modules.
plugin({
  name: 'next-like-imports',
  setup(build) {
    const root = path.resolve(import.meta.dir, '../..');
    // `import x from '/public/...'` is relative to the project root.
    build.onResolve({ filter: /^\/public\// }, args => ({ path: path.join(root, args.path) }));
    // Config files, loaded by yaml-loader in the Next build.
    build.onLoad({ filter: /\.ya?ml$/ }, args => ({
      exports: { default: yaml.load(readFileSync(args.path, 'utf8')) },
      loader: 'object',
    }));
    // Stylesheets only matter to the browser.
    build.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }));
  },
});
