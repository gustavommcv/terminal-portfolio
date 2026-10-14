import { readFileSync } from 'node:fs';

import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateLoader,
  TranslationObject,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { beforeEach } from 'vitest';

// Specs see the real English texts, so they assert what users read instead of
// raw translation keys. Other languages stay empty unless a spec adds them.
const english: TranslationObject = JSON.parse(
  readFileSync('public/i18n/en.json', 'utf8'),
);

class EnglishCatalogLoader implements TranslateLoader {
  getTranslation(language: string): Observable<TranslationObject> {
    return of(language === 'en' ? english : {});
  }
}

beforeEach(() => {
  // The remembered language lives in localStorage; keep tests independent.
  localStorage.clear();

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideTranslateService({
        fallbackLang: 'en',
        lang: 'en',
        loader: provideTranslateLoader(EnglishCatalogLoader),
      }),
    ],
  });
});
