import { computed, Directive, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { isPlainLeftClick } from '../shared/plain-left-click';
import { LanguageService } from './language.service';

/**
 * A link to another page of the site that stays in the language of the current
 * one: its address carries `?locale=pt` while the page is in Portuguese, and a
 * plain click goes there within the application, without reloading it.
 *
 * Any other click (Ctrl, Cmd, Shift, Alt, the middle button) is left to the
 * browser, which opens a new tab or window, or downloads, as it does for any link.
 *
 * ```html
 * <a [appLocalizedLink]="'/about'">About</a>
 * ```
 */
@Directive({
  selector: 'a[appLocalizedLink]',
  host: {
    '[attr.href]': 'href()',
    '(click)': 'follow($event)',
  },
})
export class LocalizedLink {
  /** The path of the page the link goes to, e.g. `/about`. */
  readonly route = input.required<string>({ alias: 'appLocalizedLink' });

  /** A plain click took the visitor to the page; not emitted when the browser handles the click. */
  readonly navigated = output<void>();

  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  protected readonly href = computed(() =>
    this.router.serializeUrl(
      this.router.createUrlTree([this.route()], {
        queryParams: this.language.localeQueryParams(),
      }),
    ),
  );

  protected follow(event: MouseEvent): void {
    if (!isPlainLeftClick(event)) {
      return;
    }

    event.preventDefault();
    void this.router.navigate([this.route()], {
      queryParams: this.language.localeQueryParams(),
    });
    this.navigated.emit();
  }
}
