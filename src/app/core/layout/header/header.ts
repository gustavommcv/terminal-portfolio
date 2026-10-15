import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { isPlainLeftClick } from '../../shared/plain-left-click';
import { NeoTreeIcon } from '../../shared/neo-tree-icon/neo-tree-icon';
import { LanguageService } from '../../i18n/language.service';
import { LanguageToggleButton } from '../../shared/language-toggle-button/language-toggle-button';
import { NAV_ROUTES, routeIcon, routeLabel } from './nav-routes';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

@Component({
  selector: 'app-header',
  imports: [LanguageToggleButton, NeoTreeIcon, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class Header implements OnDestroy {
  protected readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly menuTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly navList = viewChild<ElementRef<HTMLElement>>('navList');

  readonly isMenuOpen = signal(false);
  protected readonly navRoutes = NAV_ROUTES;
  protected readonly routeLabel = routeLabel;
  protected readonly routeIcon = routeIcon;

  protected isActive(route: string): boolean {
    return this.language.isActive(route);
  }

  protected navigateWithLocale(
    route: string,
    event: MouseEvent,
    closeMenu = false,
  ): void {
    if (!isPlainLeftClick(event)) {
      return;
    }

    event.preventDefault();
    void this.language.navigateWithLocale(route);
    if (closeMenu) {
      this.closeMenu();
    }
  }

  protected toggleMenu(): void {
    this.setMenuOpen(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.setMenuOpen(false);
  }

  /**
   * Local, dependency-free focus trap: Tab from the panel's last focusable
   * element wraps to its first, and Shift+Tab from the first wraps to the
   * last, so keyboard focus never lands on content hidden behind the
   * fixed-position backdrop.
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

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  private setMenuOpen(isOpen: boolean): void {
    const wasOpen = this.isMenuOpen();
    this.isMenuOpen.set(isOpen);
    this.document.body.style.overflow = isOpen ? 'hidden' : '';

    if (wasOpen && !isOpen) {
      this.menuTrigger()?.nativeElement.focus();
      return;
    }

    if (!wasOpen && isOpen) {
      // The nav links only exist in the DOM once this render commits;
      // afterNextRender defers the focus call to right after that, without
      // delaying the (already synchronous) mount itself.
      afterNextRender(() => this.focusInitialMenuItem(), {
        injector: this.injector,
      });
    }
  }

  private focusInitialMenuItem(): void {
    const nav = this.navList()?.nativeElement;
    if (!nav) {
      return;
    }

    const active = nav.querySelector<HTMLAnchorElement>(
      '.neo-sidebar__link--active',
    );
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
