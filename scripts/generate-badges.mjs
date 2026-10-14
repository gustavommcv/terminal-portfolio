// Writes the project badges to public/images/badges (see scripts/lib/badge.mjs).
//
//   npm run badges            write the files, removing any that no project uses
//
// Run it after adding or changing a badge in src/app/data/projects.data.ts and
// commit the result. `npm run test:scripts` fails while the files are out of date.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { projectsData } from '../src/app/data/projects.data.ts';
import { planBadges } from './lib/badge.mjs';

const directory = join('public', 'images', 'badges');
mkdirSync(directory, { recursive: true });

const planned = planBadges(projectsData);
let written = 0;

for (const [name, { svg, missingLogo, label }] of planned) {
  const path = join(directory, name);
  let current = null;
  try {
    current = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    // not there yet
  }

  if (current !== svg) {
    writeFileSync(path, svg);
    written += 1;
  }

  if (missingLogo) {
    console.warn(
      `badges: Simple Icons has no logo for "${label}" any more, so its badge has none (shields.io showed it without one too).`,
    );
  }
}

const removed = readdirSync(directory).filter((name) => name.endsWith('.svg') && !planned.has(name));
for (const name of removed) {
  rmSync(join(directory, name));
}

console.log(`badges: ${planned.size} badge(s) in ${directory}: ${written} written, ${removed.length} removed.`);
