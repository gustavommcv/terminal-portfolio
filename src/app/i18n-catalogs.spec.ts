import { readFileSync } from 'node:fs';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const load = (language: string): Json =>
  JSON.parse(readFileSync(`public/i18n/${language}.json`, 'utf8'));

/** Every string in the catalog, keyed by its dotted path (array items by index). */
function flatten(node: Json, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>();

  if (typeof node === 'string') {
    entries.set(prefix, node);
  } else if (Array.isArray(node)) {
    node.forEach((item, index) => {
      flatten(item, `${prefix}[${index}]`).forEach((v, k) => entries.set(k, v));
    });
  } else if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      flatten(value, prefix ? `${prefix}.${key}` : key).forEach((v, k) =>
        entries.set(k, v),
      );
    }
  }

  return entries;
}

const placeholders = (text: string) =>
  [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort();

describe('translation catalogs', () => {
  const en = flatten(load('en'));
  const pt = flatten(load('pt'));

  it('define exactly the same keys in English and Portuguese', () => {
    expect([...pt.keys()].sort()).toEqual([...en.keys()].sort());
  });

  it('never leave a text empty, which would render as a missing key', () => {
    for (const [language, catalog] of [['en', en], ['pt', pt]] as const) {
      for (const [key, value] of catalog) {
        expect(value.trim().length, `${language}: ${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('use the same {{placeholders}} in both languages', () => {
    for (const [key, value] of en) {
      expect(placeholders(pt.get(key) ?? ''), key).toEqual(placeholders(value));
    }
  });
});
