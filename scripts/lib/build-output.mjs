// What create-build-output.mjs does, as functions that take the directories they work on,
// so a test can run them on a small fixture instead of a real build.
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, posix } from 'node:path';

import { escapeRegExp, headerRoutes as toHeaderRoutes } from './header-routes.mjs';

/** Thrown when the build output cannot be made safely; the message says why. */
export class BuildOutputError extends Error {}

/** `<dir>/index.html` pages, as `dir` or `dir/nested`, found anywhere under `directory`. */
export function pageDirectories(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) {
      return [];
    }

    const path = posix.join(prefix, entry.name);
    const own = existsSync(join(directory, entry.name, 'index.html')) ? [path] : [];
    return [...own, ...pageDirectories(join(directory, entry.name), path)];
  });
}

const isImmutable = (route) => /immutable/.test(route.headers['Cache-Control'] ?? '');
const hasHash = (name) => /-[A-Za-z0-9_-]{8}\.[a-z]+$/.test(name);

/**
 * A long-cache rule is only safe on a file whose name changes when its content
 * does. The bundles Angular emits carry a content hash (main-T3ZX3BYX.js), so an
 * `immutable` file without one is an error (visitors would keep it for a year),
 * and a script or stylesheet that no long-cache rule covers is worth a warning.
 */
export function checkCaching(distDirectory, headerRoutes) {
  const errors = [];
  const warnings = [];

  for (const entry of readdirSync(distDirectory, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const immutableRules = headerRoutes.filter(
      (route) => isImmutable(route) && new RegExp(route.src).test(`/${entry.name}`),
    );

    if (immutableRules.length > 0 && !hasHash(entry.name)) {
      errors.push(`${entry.name} would be cached as immutable, but its name has no content hash.`);
    }

    if (immutableRules.length === 0 && /\.(js|css)$/.test(entry.name)) {
      warnings.push(
        `${entry.name} is a script or stylesheet that no long-cache rule covers; add its name pattern to vercel.json to have it cached.`,
      );
    }
  }

  return { errors, warnings };
}

/** The routing table of the Build Output API config, in the order the host applies it. */
export function routingTable(headerRoutes, pages) {
  return [
    ...headerRoutes,
    // A page's clean address (with or without a trailing slash) serves its index.html.
    ...pages.map((page) => ({
      src: `^/${escapeRegExp(page)}/?$`,
      dest: `/${page}/index.html`,
    })),
    // A request that matches a file (an asset, or a page by its full path) is served as is.
    { handle: 'filesystem' },
    // Everything else is a miss: answer with the not-found page and a 404 status.
    { handle: 'error' },
    { status: 404, src: '^(?!/api).*$', dest: '/404.html' },
  ];
}

/**
 * Prepares the deployment: copies the prerendered /404 route to 404.html, then
 * writes `<buildOutput>/static` (the site) and `<buildOutput>/config.json` (the
 * routing). `headers` is the `headers` array of vercel.json.
 */
export function createBuildOutput({ distDirectory, buildOutput, headers, warn = () => {} }) {
  const prerendered404 = join(distDirectory, '404', 'index.html');
  if (!existsSync(prerendered404)) {
    throw new BuildOutputError(
      `${prerendered404} was not generated. Is the "404" route still prerendered (app.routes.server.ts)?`,
    );
  }
  copyFileSync(prerendered404, join(distDirectory, '404.html'));

  let headerRoutes;
  try {
    headerRoutes = toHeaderRoutes(headers);
  } catch (error) {
    throw new BuildOutputError(error.message);
  }
  if (headerRoutes.length === 0) {
    throw new BuildOutputError('vercel.json defines no headers; refusing to deploy without security headers.');
  }

  const { errors, warnings } = checkCaching(distDirectory, headerRoutes);
  if (errors.length > 0) {
    throw new BuildOutputError(errors[0]);
  }
  warnings.forEach((message) => warn(`create-build-output: ${message}`));

  // Without a rewrite, a request for the directory /about is redirected (307) to
  // /about/ before the page is served. An internal rewrite avoids the extra round
  // trip and keeps the address the one the sitemap and canonical URLs declare.
  const pages = pageDirectories(distDirectory);

  rmSync(buildOutput, { recursive: true, force: true });
  mkdirSync(buildOutput, { recursive: true });
  cpSync(distDirectory, join(buildOutput, 'static'), { recursive: true });
  writeFileSync(
    join(buildOutput, 'config.json'),
    `${JSON.stringify({ version: 3, routes: routingTable(headerRoutes, pages) }, null, 2)}\n`,
  );

  return { headerRules: headerRoutes.length, pages: pages.length };
}
