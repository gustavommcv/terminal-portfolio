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
        provideRouter([]),
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

  it('exposes catalog failure without reverting to a raw translation key', () => {
    const { language, translate } = setup();

    translate.fail('en');

    expect(language.catalogState()).toEqual({
      status: 'failed',
      language: 'en',
    });
  });
});
