// Copies the prerendered not-found page to `404.html`.
//
// Angular prerenders the `/404` route to `404/index.html`, but static hosts
// look for a top-level `404.html`: Vercel serves it, with a 404 status, for any
// address that is neither a page nor an asset. Runs after `ng build`.
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Keep in sync with `outputDirectory` in vercel.json.
const outputDirectory = join('dist', 'portfolio', 'browser');
const source = join(outputDirectory, '404', 'index.html');
const target = join(outputDirectory, '404.html');

if (!existsSync(source)) {
  console.error(
    `create-404: ${source} was not generated. Is the "404" route still prerendered (app.routes.server.ts)?`,
  );
  process.exit(1);
}

copyFileSync(source, target);
console.log(`create-404: wrote ${target}`);
