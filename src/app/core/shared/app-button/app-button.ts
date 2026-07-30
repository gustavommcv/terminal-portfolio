import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './app-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-button.scss',
})
export class AppButton {
  @Input() route: string = '';
  @Input() scrollTo: string = '';

  constructor(
    private languageService: LanguageService,
    private sanitizer: DomSanitizer,
  ) { }

  get safeHref(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(this.route || '#');
  }

  handleClick(event: Event) {
    if (this.scrollTo) {
      event.preventDefault();
      this.scrollToElement(this.scrollTo);
    } else if (this.route) {
      event.preventDefault();
      this.languageService.navigateWithLocale(this.route);
    }
  }

  private scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
