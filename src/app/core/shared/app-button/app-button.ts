import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';

import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './app-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-button.scss',
})
export class AppButton {
  @Input() route = '';
  @Input() scrollTo = '';

  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);

  get href(): string {
    if (this.scrollTo) {
      return `#${this.scrollTo}`;
    }

    return this.route ? this.language.localizedUrl(this.route) : '#';
  }

  handleClick(event: MouseEvent): void {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (this.scrollTo) {
      event.preventDefault();
      const element = this.document.getElementById(this.scrollTo);
      element?.scrollIntoView({
        behavior: this.prefersReducedMotion() ? 'instant' : 'smooth',
      });
    } else if (this.route) {
      event.preventDefault();
      void this.language.navigateWithLocale(this.route);
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
