import { InjectionToken } from '@angular/core';

export interface HomeIntroConfig {
  readonly initialDelayMs: number;
  readonly typingIntervalMs: number;
  readonly completionDelayMs: number;
  readonly cursorBlinkIntervalMs: number;
  readonly revealContent: boolean;
  readonly revealDurationMs: number;
}

/**
 * All timing and visual switches for the first-home-visit sequence live here.
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
      revealContent: true,
      revealDurationMs: 650,
    }),
  },
);
