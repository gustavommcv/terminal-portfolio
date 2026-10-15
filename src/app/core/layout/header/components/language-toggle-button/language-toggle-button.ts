import { Component, inject } from '@angular/core';

import { LanguageService } from '../../../../i18n/language.service';

@Component({
  selector: 'app-language-toggle-button',
  imports: [],
  templateUrl: './language-toggle-button.html',
  styleUrl: './language-toggle-button.scss',
})
export class LanguageToggleButton {
  protected readonly language = inject(LanguageService);

  protected toggleLanguage(): void {
    void this.language.toggleLanguage();
  }
}
