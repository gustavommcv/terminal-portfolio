import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';
import { SeoService } from './services/seo.service';
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

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),

    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),

    // Starts keeping title, canonical URL and social tags in step with the
    // route and language, in the browser and while prerendering.
    provideAppInitializer(() => {
      inject(SeoService);
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
