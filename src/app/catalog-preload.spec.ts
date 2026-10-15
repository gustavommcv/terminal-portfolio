import { existsSync, readFileSync } from 'node:fs';

import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LanguagePreference } from './core/i18n/language-preference.service';

// src/index.html asks for the Portuguese catalog while the scripts download. It
// has to pick the language the way the app does, or it would fetch a catalog
// nobody uses (or miss the one that is needed), so these cases pin the two together.
const script = /<script data-catalog-preload>([\s\S]*?)<\/script>/.exec(
  readFileSync('src/index.html', 'utf8'),
)?.[1];

interface Visit {
  search?: string;
  stored?: string | 'throws';
  languages?: string[];
  language?: string;
}

interface AddedLink {
  rel?: string;
  as?: string;
  href?: string;
  crossOrigin?: string;
}

/** Runs the snippet against a fake page and returns the links it added to the head. */
function preloadsFor(visit: Visit): AddedLink[] {
  const added: AddedLink[] = [];
  const storage = {
    // Only the key the app stores the choice under holds anything.
    getItem: (key: string) => {
      if (visit.stored === 'throws') {
        throw new Error('storage is blocked');
      }
      return key === 'locale' ? (visit.stored ?? null) : null;
    },
  };

  new Function('location', 'localStorage', 'navigator', 'document', script ?? '')(
    { search: visit.search ?? '' },
    storage,
    { languages: visit.languages ?? [], language: visit.language },
    {
      createElement: () => ({}),
      head: { appendChild: (link: AddedLink) => added.push(link) },
    },
  );

  return added;
}

const loadsPortuguese = (visit: Visit) => preloadsFor(visit).length === 1;

describe('catalog preload in index.html', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('is there, and preloads a catalog that exists, the way the loader will ask for it', () => {
    expect(script).toBeTruthy();
    expect(existsSync('public/i18n/pt.json')).toBe(true);

    const [link] = preloadsFor({ search: '?locale=pt' });

    expect(link).toEqual({
      rel: 'preload',
      as: 'fetch',
      href: 'i18n/pt.json',
      crossOrigin: 'anonymous',
    });
  });

  describe('when the address names a language', () => {
    it.each([
      ['?locale=pt', true],
      ['?locale=pt_BR', true],
      ['?locale=PT-br', true],
      ['?locale=en', false],
      ['?locale=fr', false],
      ['?locale=', false],
    ])('%s -> Portuguese catalog: %s', (search, expected) => {
      expect(loadsPortuguese({ search })).toBe(expected);
    });

    it('ignores what is remembered and what the browser prefers', () => {
      expect(loadsPortuguese({ search: '?locale=en', stored: 'pt', languages: ['pt-BR'] })).toBe(false);
      expect(loadsPortuguese({ search: '?locale=pt', stored: 'en', languages: ['en-US'] })).toBe(true);
    });
  });

  describe('when it does not, it picks the language the app picks', () => {
    const visits: [string, Visit][] = [
      ['a remembered Portuguese choice', { stored: 'pt', languages: ['en-US'] }],
      ['a remembered English choice over a Portuguese browser', { stored: 'en', languages: ['pt-BR'] }],
      ['a Brazilian Portuguese browser', { languages: ['pt-BR', 'en'] }],
      ['a Portuguese browser after an unsupported language', { languages: ['fr-FR', 'pt'] }],
      ['an English browser that also lists Portuguese', { languages: ['en-US', 'pt'] }],
      ['a French browser', { languages: ['fr-FR'] }],
      ['a browser that lists no languages', { languages: [] }],
      ['a browser with only the single language property', { languages: [], language: 'pt-PT' }],
      ['an unreadable stored value', { stored: 'klingon', languages: ['pt-BR'] }],
    ];

    it.each(visits)('%s', (_name, visit) => {
      const { stored, languages = [], language } = visit;
      if (stored !== undefined) {
        localStorage.setItem('locale', stored);
      }
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages);
      vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language ?? languages[0] ?? '');

      const app = TestBed.inject(LanguagePreference).preferred();

      expect(loadsPortuguese(visit), `the app would pick ${app}`).toBe(app === 'pt');
    });

    it('does the same when storage is blocked', () => {
      const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage is blocked');
      });
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['pt-BR']);

      const app = TestBed.inject(LanguagePreference).preferred();

      expect(storage).toHaveBeenCalled();
      expect(loadsPortuguese({ stored: 'throws', languages: ['pt-BR'] })).toBe(app === 'pt');
      expect(app).toBe('pt');
    });
  });
});
