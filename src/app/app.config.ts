import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';
import { LanguageService } from './core/i18n/language.service';
import { SeoService } from './core/seo/seo.service';
import { HomeIntroService } from './features/home/services/home-intro.service';
import {
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      // The :id of /portfolio/:id reaches ProjectDetailPage as an input.
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),

    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),

    // Starts keeping title, canonical URL and social tags in step with the
    // route and language, in the browser and while prerendering.
    provideAppInitializer(() => {
      inject(SeoService);
    }),

    // State that follows the router has to be watching before the first
    // navigation, so these are created here, ahead of the root component and of
    // that navigation, instead of waiting for something to ask for them:
    // - the language follows the address (and, on the first navigation, the
    //   visitor's remembered language decides it), and every component reads it
    //   through LanguageService;
    // - whether the visit began on the home page, which is the only one that
    //   gets the typed intro, is known from that first navigation alone.
    provideAppInitializer(() => {
      inject(LanguageService);
      inject(HomeIntroService);
    }),

    provideHttpClient(withFetch()),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
        failOnError: true,
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
