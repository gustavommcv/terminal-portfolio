import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import type { InterpolatableTranslationObject } from '@ngx-translate/core';
import { ReplaySubject, Subject } from 'rxjs';
import { vi } from 'vitest';

import { LanguageService } from './language.service';

class ControlledTranslateService {
  readonly onTranslationRefresh = new Subject<void>();
  readonly addLangs = vi.fn();
  readonly calls: string[] = [];

  private readonly activeLanguage = signal<string | undefined>(undefined);
  private readonly requests = new Map<
    string,
    ReplaySubject<InterpolatableTranslationObject>
  >();
  private readonly catalogs = new Map<
    string,
    InterpolatableTranslationObject
  >();

  readonly currentLang = this.activeLanguage.asReadonly();

  use(language: string): ReplaySubject<InterpolatableTranslationObject> {
    this.calls.push(language);
    const request = new ReplaySubject<InterpolatableTranslationObject>(1);
    this.requests.set(language, request);
    return request;
  }

  resolve(
    language: string,
    translations: InterpolatableTranslationObject,
  ): void {
    this.catalogs.set(language, translations);
    this.activeLanguage.set(language);
    const request = this.requests.get(language);
    request?.next(translations);
    request?.complete();
  }

  fail(language: string): void {
    this.requests.get(language)?.error(new Error('catalog unavailable'));
  }

  getTranslations(language: string): InterpolatableTranslationObject {
    return this.catalogs.get(language) ?? {};
  }
}

describe('LanguageService', () => {
  function setup(): {
    language: LanguageService;
    translate: ControlledTranslateService;
    router: Router;
    document: Document;
  } {
    TestBed.configureTestingModule({
      providers: [
        // A component-less catch-all, so tests can navigate to any path.
        provideRouter([{ path: '**', children: [] }]),
        ControlledTranslateService,
        {
          provide: TranslateService,
          useExisting: ControlledTranslateService,
        },
      ],
    });

    return {
      language: TestBed.inject(LanguageService),
      translate: TestBed.inject(ControlledTranslateService),
      router: TestBed.inject(Router),
      document: TestBed.inject(DOCUMENT),
    };
  }

  it('keeps the active catalog explicitly loading until use resolves', () => {
    const { language, translate, document } = setup();

    expect(language.catalogState()).toEqual({
      status: 'loading',
      language: 'en',
    });
    expect(translate.calls).toEqual(['en']);

    const catalog = { home: { command: 'whoami' } };
    translate.resolve('en', catalog);

    expect(language.catalogState()).toEqual({
      status: 'ready',
      language: 'en',
      translations: catalog,
    });
    expect(document.documentElement.lang).toBe('en');
  });

  it('normalizes Brazilian Portuguese URLs and only publishes the loaded catalog', async () => {
    const { language, translate, router, document } = setup();
    translate.resolve('en', {});

    await router.navigateByUrl('/?locale=pt_BR');

    expect(language.catalogState()).toEqual({
      status: 'loading',
      language: 'pt',
    });
    expect(translate.calls).toEqual(['en', 'pt']);

    const catalog = { home: { command: 'quem-sou-eu' } };
    translate.resolve('pt', catalog);

    expect(language.catalogState()).toEqual({
      status: 'ready',
      language: 'pt',
      translations: catalog,
    });
    expect(language.isActive('/')).toBe(true);
    expect(language.localizedUrl('/portfolio')).toBe('/portfolio?locale=pt');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('ignores stale catalog completion after a newer URL language wins', async () => {
    const { language, translate, router } = setup();

    await router.navigateByUrl('/?locale=pt');
    translate.resolve('en', { command: 'stale' });

    expect(language.catalogState()).toEqual({
      status: 'loading',
      language: 'pt',
    });

    translate.resolve('pt', { command: 'current' });
    expect(language.catalogState()).toMatchObject({
      status: 'ready',
      language: 'pt',
    });
  });

  describe('initial language', () => {
    function browserLanguages(languages: readonly string[]): void {
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages);
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    // The language redirect is a second navigation started from the first
    // one's NavigationEnd, so it is still in flight when navigateByUrl resolves.
    const redirectsSettled = () =>
      new Promise((resolve) => setTimeout(resolve));

    it('sends a Portuguese browser to the Portuguese site on its first visit, keeping the path', async () => {
      browserLanguages(['pt-BR', 'en']);
      const { language, router, translate } = setup();

      await router.navigateByUrl('/portfolio');
      await redirectsSettled();

      expect(router.url).toBe('/portfolio?locale=pt');
      expect(translate.calls).toEqual(['en', 'pt']);
      expect(language.catalogState()).toEqual({
        status: 'loading',
        language: 'pt',
      });
    });

    it('leaves an English browser on the English site', async () => {
      browserLanguages(['en-US']);
      const { router, translate } = setup();

      await router.navigateByUrl('/portfolio');

      expect(router.url).toBe('/portfolio');
      expect(translate.calls).toEqual(['en']);
    });

    it('lets an explicit ?locale=en win over a Portuguese browser, and remembers it', async () => {
      browserLanguages(['pt-BR']);
      const { router, translate } = setup();

      await router.navigateByUrl('/portfolio?locale=en');

      expect(router.url).toBe('/portfolio?locale=en');
      expect(translate.calls).toEqual(['en']);
      expect(localStorage.getItem('locale')).toBe('en');
    });

    it('stays English on later visits and reloads once English was chosen, even without the parameter', async () => {
      browserLanguages(['pt-BR']);
      localStorage.setItem('locale', 'en');
      const { router, translate } = setup();

      await router.navigateByUrl('/about');

      expect(router.url).toBe('/about');
      expect(translate.calls).toEqual(['en']);
    });

    it('only decides on the first page load, not on later navigations', async () => {
      browserLanguages(['pt-BR']);
      const { router } = setup();

      await router.navigateByUrl('/about?locale=en');
      localStorage.clear();
      await router.navigateByUrl('/portfolio');

      expect(router.url).toBe('/portfolio');
    });

    it('remembers the language picked with the toggle', async () => {
      browserLanguages(['en-US']);
      const { language, router } = setup();
      await router.navigateByUrl('/');

      await language.toggleLanguage();

      expect(localStorage.getItem('locale')).toBe('pt');
    });
  });

  it('exposes catalog failure without reverting to a raw translation key', () => {
    const { language, translate } = setup();

    translate.fail('en');

    expect(language.catalogState()).toEqual({
      status: 'failed',
      language: 'en',
    });
  });

  describe('navigateWithLocale', () => {
    it('keeps the address clean while in English', async () => {
      const { language, router, translate } = setup();
      translate.resolve('en', {});

      await language.navigateWithLocale('/about');

      expect(router.url).toBe('/about');
    });

    it('carries ?locale=pt along while in Portuguese', async () => {
      const { language, router, translate } = setup();
      await router.navigateByUrl('/portfolio?locale=pt');
      translate.resolve('pt', {});

      await language.navigateWithLocale('/about');

      expect(router.url).toBe('/about?locale=pt');
    });
  });

  it('switches from Portuguese back to English on the same page, and remembers it', async () => {
    const { language, router, translate } = setup();
    await router.navigateByUrl('/about?locale=pt');
    translate.resolve('pt', {});

    await language.toggleLanguage();

    expect(router.url).toBe('/about');
    expect(language.currentLocale()).toBe('en');
    expect(localStorage.getItem('locale')).toBe('en');
  });

  describe('when the translation service refreshes a catalog', () => {
    it('shows the refreshed texts of the language in use', () => {
      const { language, translate } = setup();
      translate.resolve('en', { greeting: 'old' });
      translate.resolve('en', { greeting: 'new' });

      translate.onTranslationRefresh.next();

      expect(language.catalogState()).toEqual({
        status: 'ready',
        language: 'en',
        translations: { greeting: 'new' },
      });
    });

    it('ignores a refresh of a language other than the one on show', () => {
      const { language, translate } = setup();
      translate.resolve('en', { greeting: 'hello' });
      translate.resolve('pt', { greeting: 'olá' }); // the translation service moved on; the page has not

      translate.onTranslationRefresh.next();

      expect(language.catalogState()).toEqual({
        status: 'ready',
        language: 'en',
        translations: { greeting: 'hello' },
      });
    });

    it('does nothing while the catalog is still loading', () => {
      const { language, translate } = setup();

      translate.onTranslationRefresh.next();

      expect(language.catalogState()).toEqual({ status: 'loading', language: 'en' });
    });
  });

});
