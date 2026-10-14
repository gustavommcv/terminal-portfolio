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
//   3. .vercel/output/config.json  security headers on every response, then real
//                                  files, and a 404 status + 404.html for the rest
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

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
const headerRoutes = (vercelConfig.headers ?? []).map((rule) => {
  if (rule.source !== '/(.*)') {
    fail(
      `vercel.json header source "${rule.source}" is not supported here; only "/(.*)" is. Extend this script before adding path-specific header rules.`,
    );
  }
  return {
    src: rule.source,
    headers: Object.fromEntries(rule.headers.map(({ key, value }) => [key, value])),
    continue: true,
  };
});

if (headerRoutes.length === 0) {
  fail('vercel.json defines no headers; refusing to deploy without security headers.');
}

// --- 3. the output --------------------------------------------------------------
rmSync(buildOutput, { recursive: true, force: true });
mkdirSync(buildOutput, { recursive: true });
cpSync(distDirectory, join(buildOutput, 'static'), { recursive: true });

const config = {
  version: 3,
  routes: [
    ...headerRoutes,
    // A request that matches a file (a prerendered page, an asset) is served as is.
    { handle: 'filesystem' },
    // Everything else is a miss: answer with the not-found page and a 404 status.
    { handle: 'error' },
    { status: 404, src: '^(?!/api).*$', dest: '/404.html' },
  ],
};
writeFileSync(join(buildOutput, 'config.json'), `${JSON.stringify(config, null, 2)}\n`);

console.log(
  `create-build-output: ${join(distDirectory, '404.html')} and ${buildOutput} written (${headerRoutes.length} header rule(s))`,
);
