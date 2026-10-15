import { readFileSync } from 'node:fs';

import type { TranslationObject } from '@ngx-translate/core';

/**
 * The English catalog the specs run with (see src/test-setup.ts), so a spec can
 * compare what a component puts on the screen with what the catalog says.
 */
export const englishCatalog: TranslationObject = JSON.parse(
  readFileSync('public/i18n/en.json', 'utf8'),
);

/** One entry of the English catalog by its dotted key, e.g. `home-page.services-section.services`. */
export function catalogEntry<T = string>(key: string): T {
  let node: unknown = englishCatalog;

  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null || !(part in node)) {
      throw new Error(`"${key}" is not in the English catalog`);
    }
    node = (node as Record<string, unknown>)[part];
  }

  return node as T;
}
