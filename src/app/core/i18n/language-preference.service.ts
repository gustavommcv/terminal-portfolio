import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Service, PLATFORM_ID } from '@angular/core';

import type { SupportedLanguage } from './language.service';

const STORAGE_KEY = 'locale';

/**
 * Which language a visitor should get when the URL does not say. Everything
 * here is browser-only: on the server there is no navigator or storage, so
 * prerendered pages are always English.
 */
@Service()
export class LanguagePreference {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** The language the visitor picked, or opened the site in, on an earlier visit. */
  stored(): SupportedLanguage | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return value === 'pt' || value === 'en' ? value : null;
    } catch {
      return null;
    }
  }

  remember(language: SupportedLanguage): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage can be blocked (private mode, site settings); the choice then
      // simply does not outlive the visit.
    }
  }

  /** First supported language in the browser's preference list, else English. */
  detect(): SupportedLanguage {
    if (!this.isBrowser) {
      return 'en';
    }

    const navigator = this.document.defaultView?.navigator;
    const tags = navigator?.languages?.length
      ? navigator.languages
      : navigator?.language
        ? [navigator.language]
        : [];

    for (const tag of tags) {
      const primary = tag.toLowerCase().split('-')[0];
      if (primary === 'pt' || primary === 'en') {
        return primary;
      }
    }

    return 'en';
  }

  /** An earlier choice wins over what the browser merely suggests. */
  preferred(): SupportedLanguage {
    return this.stored() ?? this.detect();
  }
}
