import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '../../i18n/language.service';
import { LocalizedLink } from '../../i18n/localized-link';
import { LanguageToggleButton } from './components/language-toggle-button/language-toggle-button';
import { MobileMenu } from './components/mobile-menu/mobile-menu';
import { NAV_ROUTES, routeLabel } from './nav-routes';

/**
 * The bar at the top of every page: the logo, the links of the site and the
 * language toggle. On narrow screens the links move into the mobile menu, which
 * the hamburger button opens; this component only decides whether it is open.
 */
@Component({
  selector: 'app-header',
  imports: [LanguageToggleButton, LocalizedLink, MobileMenu, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly language = inject(LanguageService);
  private readonly menuTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');

  readonly isMenuOpen = signal(false);
  protected readonly navRoutes = NAV_ROUTES;
  protected readonly routeLabel = routeLabel;

  protected isActive(route: string): boolean {
    return this.language.isActive(route);
  }

  protected toggleMenu(): void {
    this.setMenuOpen(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.setMenuOpen(false);
  }

  private setMenuOpen(isOpen: boolean): void {
    const wasOpen = this.isMenuOpen();
    this.isMenuOpen.set(isOpen);

    // Closing hands keyboard focus back to the button that opened the menu.
    if (wasOpen && !isOpen) {
      this.menuTrigger()?.nativeElement.focus();
    }
  }
}
