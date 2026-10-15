import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { LanguageService } from '../../i18n/language.service';
import { isPlainLeftClick } from '../plain-left-click';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './app-button.html',
  styleUrl: './app-button.scss',
})
export class AppButton {
  readonly route = input('');
  readonly scrollTo = input('');

  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);

  protected readonly href = computed(() => {
    if (this.scrollTo()) {
      return `#${this.scrollTo()}`;
    }

    return this.route() ? this.language.localizedUrl(this.route()) : '#';
  });

  protected follow(event: MouseEvent): void {
    if (!isPlainLeftClick(event)) {
      return;
    }

    if (this.scrollTo()) {
      event.preventDefault();
      const element = this.document.getElementById(this.scrollTo());
      element?.scrollIntoView({
        behavior: this.prefersReducedMotion() ? 'instant' : 'smooth',
      });
    } else if (this.route()) {
      event.preventDefault();
      void this.language.navigateWithLocale(this.route());
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
