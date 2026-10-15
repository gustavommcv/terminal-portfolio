import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { appConfig } from './app.config';
import { LanguageService } from './core/i18n/language.service';
import { HomeIntroService } from './features/home/services/home-intro.service';

// The language and the home intro follow the router from the very first
// navigation, so they have to exist before the root component and before that
// navigation, without anything asking for them. The configuration of the
// application is what makes that so.
describe('the application configuration', () => {
  it('creates the language and the home intro while the application starts, ahead of any component', async () => {
    const created: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        // Any address matches, and nothing is fetched: the router and the
        // services below are stand-ins that only note that they were created.
        provideRouter([{ path: '**', children: [] }]),
        {
          provide: LanguageService,
          useFactory: () => {
            created.push('language');
            return { currentLocale: () => 'en' } as unknown as LanguageService;
          },
        },
        {
          provide: HomeIntroService,
          useFactory: () => {
            created.push('home intro');
            return {} as HomeIntroService;
          },
        },
      ],
    });

    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(created.sort()).toEqual(['home intro', 'language']);
  });
});
