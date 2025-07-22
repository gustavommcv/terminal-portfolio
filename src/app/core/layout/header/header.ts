import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../services/language.service';
import { LanguageToggleButton } from '../../shared/language-toggle-button/language-toggle-button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LanguageToggleButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(public language: LanguageService) {}

  toggleLanguage() {
    this.language.toggleLanguage();
  }

  isActive(route: string) {
    return this.language.isActive(route);
  }

  navigateWithLocale(route: string) {
    this.language.navigateWithLocale(route);
  }
}
