import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { routes } from './app.routes';

// A mistyped key does not fail anywhere: ngx-translate shows the key itself on the
// page. So every key written in a template has to exist, in both languages.
function filesUnder(directory: string, extension: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return filesUnder(path, extension);
    }
    return path.endsWith(extension) && !path.endsWith('.spec.ts') ? [path] : [];
  });
}

function lookup(catalog: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    return typeof node === 'object' && node !== null ? (node as Record<string, unknown>)[part] : undefined;
  }, catalog);
}

const isText = (value: unknown): boolean =>
  (typeof value === 'string' && value.trim().length > 0) ||
  (Array.isArray(value) && value.length > 0);

describe('translation keys', () => {
  const catalogs = {
    en: JSON.parse(readFileSync('public/i18n/en.json', 'utf8')),
    pt: JSON.parse(readFileSync('public/i18n/pt.json', 'utf8')),
  };

  // 'some.key' | translate   (a key written out in full, not built from pieces)
  const used = new Map<string, string>();
  for (const file of filesUnder('src/app', '.html')) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/['"]([a-z0-9-]+(?:\.[a-z0-9-]+)+)['"]\s*\|\s*translate/g)) {
      used.set(match[1], file.replace(/\\/g, '/'));
    }
  }

  it('finds the keys the templates use, so the checks below are not vacuous', () => {
    expect(used.size).toBeGreaterThan(40);
    expect(used.has('header.menu')).toBe(true);
  });

  for (const language of ['en', 'pt'] as const) {
    it(`has a text in ${language} for every key a template uses`, () => {
      const missing = [...used]
        .filter(([key]) => !isText(lookup(catalogs[language], key)))
        .map(([key, file]) => `${key}  (used in ${file})`);

      expect(missing).toEqual([]);
    });
  }

  it('has a title and a description in both languages for each kind of page the SEO service describes', () => {
    const kinds = new Set(
      routes
        .map((route) => (route.data as { seo?: string } | undefined)?.seo)
        .filter((kind): kind is string => kind !== undefined && kind !== 'project'),
    );
    const missing: string[] = [];

    for (const language of ['en', 'pt'] as const) {
      for (const kind of kinds) {
        for (const field of ['title', 'description']) {
          if (!isText(lookup(catalogs[language], `seo.${kind}.${field}`))) {
            missing.push(`${language}: seo.${kind}.${field}`);
          }
        }
      }
      // a project page's title is a pattern that takes the project's own title
      if (!isText(lookup(catalogs[language], 'seo.project.title'))) {
        missing.push(`${language}: seo.project.title`);
      }
    }

    expect(kinds.size).toBeGreaterThan(2);
    expect(missing).toEqual([]);
  });
});
