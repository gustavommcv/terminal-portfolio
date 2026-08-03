import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'language-toggle-button',
  imports: [],
  templateUrl: './language-toggle-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './language-toggle-button.scss',
})
export class LanguageToggleButton {
  constructor(readonly language: LanguageService) {}

  toggleLanguage(): void {
    void this.language.toggleLanguage();
  }
}
