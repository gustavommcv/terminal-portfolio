// Prepares the deployment for Vercel's Build Output API (v3). Runs after `ng build`.
//
// Why: Vercel's builder looks at package.json, sees `@angular/cli`, and applies
// its Angular preset's default routes even when the project is set to "Other":
// a catch-all rewrite of every unknown address to `index.html`, so a missing
// page answers 200 with the home page. When the build leaves a
// `.vercel/output/config.json`, the builder uses that output as-is and skips the
// framework's routes, so the routing table is the only one.
//
//   1. 404.html          the prerendered /404 route, copied to the top level
//   2. .vercel/output/static       the site itself
//   3. .vercel/output/config.json  the headers of vercel.json (security headers on
//                                  every response, long caching for hashed files),
//                                  each page served at its clean address, then real
//                                  files, and a 404 status + 404.html for the rest
//
// The work is done by lib/build-output.mjs, which has tests; this only says where.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BuildOutputError, createBuildOutput } from './lib/build-output.mjs';

// Keep in sync with `outputDirectory` in vercel.json.
const distDirectory = join('dist', 'portfolio', 'browser');
const buildOutput = join('.vercel', 'output');

try {
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const { headerRules, pages } = createBuildOutput({
    distDirectory,
    buildOutput,
    headers: vercelConfig.headers,
    warn: console.warn,
  });

  console.log(
    `create-build-output: ${join(distDirectory, '404.html')} and ${buildOutput} written (${headerRules} header rule(s), ${pages} page(s))`,
  );
} catch (error) {
  if (!(error instanceof BuildOutputError)) {
    throw error;
  }
  console.error(`create-build-output: ${error.message}`);
  process.exit(1);
}
