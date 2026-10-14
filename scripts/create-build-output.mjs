// Prepares the deployment for Vercel's Build Output API (v3). Runs after `ng build`.
//
// Why: Vercel's builder looks at package.json, sees `@angular/cli`, and applies
// its Angular preset's default routes even when the project is set to "Other":
// a catch-all rewrite of every unknown address to `index.html`, so a missing
// page answers 200 with the home page. When the build leaves a
// `.vercel/output/config.json`, the builder uses that output as-is and skips the
// framework's routes, so the routing table below is the only one.
//
//   1. 404.html          the prerendered /404 route, copied to the top level
//   2. .vercel/output/static       the site itself
//   3. .vercel/output/config.json  the headers of vercel.json (security headers on
//                                  every response, long caching for hashed files),
//                                  each page served at its clean address, then real
//                                  files, and a 404 status + 404.html for the rest
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, posix } from 'node:path';

import { escapeRegExp, headerRoutes as toHeaderRoutes } from './lib/header-routes.mjs';

// Keep in sync with `outputDirectory` in vercel.json.
const distDirectory = join('dist', 'portfolio', 'browser');
const buildOutput = join('.vercel', 'output');

function fail(message) {
  console.error(`create-build-output: ${message}`);
  process.exit(1);
}

// --- 1. 404.html --------------------------------------------------------------
const prerendered404 = join(distDirectory, '404', 'index.html');
if (!existsSync(prerendered404)) {
  fail(
    `${prerendered404} was not generated. Is the "404" route still prerendered (app.routes.server.ts)?`,
  );
}
copyFileSync(prerendered404, join(distDirectory, '404.html'));

// --- 2. headers: vercel.json stays the single place that defines them ----------
const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
let headerRoutes;
try {
  headerRoutes = toHeaderRoutes(vercelConfig.headers);
} catch (error) {
  fail(error.message);
}

if (headerRoutes.length === 0) {
  fail('vercel.json defines no headers; refusing to deploy without security headers.');
}

// A long-cache rule is only safe on a file whose name changes when its content
// does. The bundles Angular emits carry a content hash (main-T3ZX3BYX.js); refuse
// to publish an `immutable` file without one, since visitors would keep it for a year.
const isImmutable = (route) => /immutable/.test(route.headers['Cache-Control'] ?? '');
const hasHash = (name) => /-[A-Za-z0-9_-]{8}\.[a-z]+$/.test(name);

for (const entry of readdirSync(distDirectory, { withFileTypes: true })) {
  if (!entry.isFile()) {
    continue;
  }

  const immutableRules = headerRoutes.filter(
    (route) => isImmutable(route) && new RegExp(route.src).test(`/${entry.name}`),
  );

  if (immutableRules.length > 0 && !hasHash(entry.name)) {
    fail(`${entry.name} would be cached as immutable, but its name has no content hash.`);
  }

  if (immutableRules.length === 0 && /\.(js|css)$/.test(entry.name)) {
    console.warn(
      `create-build-output: ${entry.name} is a script or stylesheet that no long-cache rule covers; add its name pattern to vercel.json to have it cached.`,
    );
  }
}

// --- 3. pages: serve <dir>/index.html at /<dir>, without a redirect -------------
// Without this, a request for the directory /about is redirected (307) to
// /about/ before the page is served. An internal rewrite avoids the extra round
// trip and keeps the address the one the sitemap and canonical URLs declare.
function pageDirectories(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) {
      return [];
    }

    const path = posix.join(prefix, entry.name);
    const own = existsSync(join(directory, entry.name, 'index.html')) ? [path] : [];
    return [...own, ...pageDirectories(join(directory, entry.name), path)];
  });
}

const pageRoutes = pageDirectories(distDirectory).map((page) => ({
  src: `^/${escapeRegExp(page)}/?$`,
  dest: `/${page}/index.html`,
}));

// --- 4. the output --------------------------------------------------------------
rmSync(buildOutput, { recursive: true, force: true });
mkdirSync(buildOutput, { recursive: true });
cpSync(distDirectory, join(buildOutput, 'static'), { recursive: true });

const config = {
  version: 3,
  routes: [
    ...headerRoutes,
    // A page's clean address (with or without a trailing slash) serves its index.html.
    ...pageRoutes,
    // A request that matches a file (an asset, or a page by its full path) is served as is.
    { handle: 'filesystem' },
    // Everything else is a miss: answer with the not-found page and a 404 status.
    { handle: 'error' },
    { status: 404, src: '^(?!/api).*$', dest: '/404.html' },
  ],
};
writeFileSync(join(buildOutput, 'config.json'), `${JSON.stringify(config, null, 2)}\n`);

console.log(
  `create-build-output: ${join(distDirectory, '404.html')} and ${buildOutput} written (${headerRoutes.length} header rule(s), ${pageRoutes.length} page(s))`,
);
