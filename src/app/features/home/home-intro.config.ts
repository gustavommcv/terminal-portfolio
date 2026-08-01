import { InjectionToken } from '@angular/core';

export interface HomeIntroConfig {
  readonly initialDelayMs: number;
  readonly typingIntervalMs: number;
  readonly completionDelayMs: number;
  readonly cursorBlinkIntervalMs: number;
}

/**
 * All terminal timing for the first-home-visit sequence lives here.
 * Visitor-facing terminal text remains in the translation catalogs.
 */
export const HOME_INTRO_CONFIG = new InjectionToken<HomeIntroConfig>(
  'HOME_INTRO_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({
      initialDelayMs: 250,
      typingIntervalMs: 120,
      completionDelayMs: 300,
      cursorBlinkIntervalMs: 500,
    }),
  },
);
