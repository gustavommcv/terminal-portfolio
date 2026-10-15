import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { LocalizedLink } from '../../i18n/localized-link';
import { isPlainLeftClick } from '../plain-left-click';
import { prefersReducedMotion } from '../reduced-motion';

/**
 * A button-like link: to another page of the site (`route`), which stays in the
 * language of the page, or to a place on the same page (`scrollTo`, the id of an
 * element), which it scrolls to. With neither it points at `#` and does nothing.
 */
@Component({
  selector: 'app-button',
  imports: [NgTemplateOutlet, LocalizedLink],
  templateUrl: './app-button.html',
  styleUrl: './app-button.scss',
})
export class AppButton {
  readonly route = input('');
  readonly scrollTo = input('');

  private readonly document = inject(DOCUMENT);

  protected scroll(event: MouseEvent): void {
    const target = this.scrollTo();

    if (!target || !isPlainLeftClick(event)) {
      return;
    }

    event.preventDefault();
    this.document.getElementById(target)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
  }
}
