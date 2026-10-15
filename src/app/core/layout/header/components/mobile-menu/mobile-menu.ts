import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '../../../../i18n/language.service';
import { LocalizedLink } from '../../../../i18n/localized-link';
import { LanguageToggleButton } from '../language-toggle-button/language-toggle-button';
import { NeoTreeIcon } from '../neo-tree-icon/neo-tree-icon';
import { NAV_ROUTES, routeIcon, routeLabel } from '../../nav-routes';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

/**
 * The navigation of narrow screens: a panel over a dimmed backdrop, styled as a
 * file tree. The header decides whether it is open (`open`) and hears when it
 * asks to be closed (`closed`): by its close button, a click on the backdrop,
 * Escape, or a click on a link that takes the visitor to another page.
 *
 * While it is open the page behind does not scroll, and keyboard focus stays in
 * the panel: it starts on the link of the current page, and Tab and Shift+Tab
 * wrap around its ends, so focus never lands on content hidden behind the backdrop.
 */
@Component({
  selector: 'app-mobile-menu',
  imports: [LanguageToggleButton, LocalizedLink, NeoTreeIcon, TranslatePipe],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class MobileMenu {
  readonly open = input.required<boolean>();
  readonly closed = output<void>();

  protected readonly navRoutes = NAV_ROUTES;
  protected readonly routeLabel = routeLabel;
  protected readonly routeIcon = routeIcon;

  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly navList = viewChild<ElementRef<HTMLElement>>('navList');

  constructor() {
    // The page behind stays put while the menu is open, and is given back when it
    // closes or the menu goes away.
    effect(() => {
      this.document.body.style.overflow = this.open() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      this.document.body.style.overflow = '';
    });

    // The links only exist in the DOM once the panel is rendered, so focus moves
    // in after that render, without delaying the (synchronous) mount itself.
    afterRenderEffect(() => {
      const nav = this.navList()?.nativeElement;

      if (this.open() && nav) {
        this.focusInitialItem(nav);
      }
    });
  }

  protected isActive(route: string): boolean {
    return this.language.isActive(route);
  }

  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  /**
   * Local, dependency-free focus trap: Tab from the panel's last focusable
   * element wraps to its first, and Shift+Tab from the first wraps to the last.
   */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = this.focusableElements();
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusInitialItem(nav: HTMLElement): void {
    const active = nav.querySelector<HTMLAnchorElement>('.neo-sidebar__link--active');
    const first = nav.querySelector<HTMLAnchorElement>('.neo-sidebar__link');
    (active ?? first)?.focus();
  }

  private focusableElements(): HTMLElement[] {
    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return [];
    }

    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }
}
