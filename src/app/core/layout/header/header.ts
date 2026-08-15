import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Injector,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { NeoTreeIcon } from '../../shared/neo-tree-icon/neo-tree-icon';
import { LanguageService } from '../../../services/language.service';
import { LanguageToggleButton } from '../../shared/language-toggle-button/language-toggle-button';
import { routeIcon, routeLabel } from './header.utils';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LanguageToggleButton, NeoTreeIcon],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.scss',
})
export class Header implements OnDestroy {
  readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly menuTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly navList = viewChild<ElementRef<HTMLElement>>('navList');

  readonly isMenuOpen = signal(false);
  protected readonly routeLabel = routeLabel;
  protected readonly routeIcon = routeIcon;

  constructor() {
    // isActive() reads LanguageService.currentPath, a plain (non-signal)
    // property. Under OnPush, Angular only re-checks this view on its own
    // template events/inputs/signals, so a route change resolved outside a
    // click on this component (e.g. a direct reload settling its initial
    // navigation) never re-renders the active nav item without this.
    const changeDetectorRef = inject(ChangeDetectorRef);
    inject(Router)
      .events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => changeDetectorRef.markForCheck());
  }

  isActive(route: string): boolean {
    return this.language.isActive(route);
  }

  navigateWithLocale(
    route: string,
    event: MouseEvent,
    closeMenu = false,
  ): void {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    void this.language.navigateWithLocale(route);
    if (closeMenu) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.setMenuOpen(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.setMenuOpen(false);
  }

  @HostListener('document:keydown.escape')
  closeMenuFromKeyboard(): void {
    this.closeMenu();
  }

  /**
   * Local, dependency-free focus trap: Tab from the panel's last focusable
   * element wraps to its first, and Shift+Tab from the first wraps to the
   * last, so keyboard focus never lands on content hidden behind the
   * fixed-position backdrop.
   */
  onPanelKeydown(event: KeyboardEvent): void {
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
