import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { LanguageService } from '../../../services/language.service';
import { LanguageToggleButton } from '../../shared/language-toggle-button/language-toggle-button';
import { routeLabel } from './header.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LanguageToggleButton],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.scss',
})
export class Header implements OnDestroy {
  readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly menuTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');

  readonly isMenuOpen = signal(false);
  protected readonly routeLabel = routeLabel;

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

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  private setMenuOpen(isOpen: boolean): void {
    const wasOpen = this.isMenuOpen();
    this.isMenuOpen.set(isOpen);
    this.document.body.style.overflow = isOpen ? 'hidden' : '';

    if (wasOpen && !isOpen) {
      this.menuTrigger()?.nativeElement.focus();
    }
  }
}
