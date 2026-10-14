import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach } from 'vitest';

beforeEach(() => {
  // The remembered language lives in localStorage; keep tests independent.
  localStorage.clear();

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideTranslateService({
        fallbackLang: 'en',
        lang: 'en',
      }),
    ],
  });
});
