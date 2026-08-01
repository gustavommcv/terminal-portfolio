import { computed, inject, Injectable } from '@angular/core';
import type { InterpolatableTranslationObject } from '@ngx-translate/core';

import {
  LanguageService,
  SupportedLanguage,
} from '../../../services/language.service';

export type HomeIntroCommandState =
  | { readonly status: 'waiting' }
  | {
      readonly status: 'ready';
      readonly language: SupportedLanguage;
      readonly command: string;
    }
  | {
      readonly status: 'unavailable';
      readonly language: SupportedLanguage;
      readonly reason: 'catalog-load-failed' | 'missing-command';
    };

@Injectable({ providedIn: 'root' })
export class HomeIntroCommandService {
  private readonly language = inject(LanguageService);

  readonly state = computed<HomeIntroCommandState>(() => {
    const catalog = this.language.catalogState();
    if (catalog.status === 'loading') {
      return { status: 'waiting' };
    }

    if (catalog.status === 'failed') {
      return {
        status: 'unavailable',
        language: catalog.language,
        reason: 'catalog-load-failed',
      };
    }

    const command = this.readCommand(catalog.translations);
    return command === null
      ? {
          status: 'unavailable',
          language: catalog.language,
          reason: 'missing-command',
        }
      : { status: 'ready', language: catalog.language, command };
  });

  private readCommand(
    translations: InterpolatableTranslationObject,
  ): string | null {
    const homePage = translations['home-page'];
    if (!this.isTranslationObject(homePage)) {
      return null;
    }

    const presentation = homePage['presentation-section'];
    if (!this.isTranslationObject(presentation)) {
      return null;
    }

    const command = presentation['command'];
    return typeof command === 'string' && command.length > 0 ? command : null;
  }

  private isTranslationObject(
    value: unknown,
  ): value is InterpolatableTranslationObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
