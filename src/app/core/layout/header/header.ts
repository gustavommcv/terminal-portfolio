import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';

import { LanguageService } from '../../../services/language.service';
import { LanguageToggleButton } from '../../shared/language-toggle-button/language-toggle-button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LanguageToggleButton],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.scss',
})
export class Header implements OnDestroy {
  readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly menuTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');

  readonly isMenuOpen = signal(false);

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
