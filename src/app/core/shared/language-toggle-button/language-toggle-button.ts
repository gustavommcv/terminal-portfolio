import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'language-toggle-button',
  imports: [CommonModule],
  templateUrl: './language-toggle-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './language-toggle-button.scss',
})
export class LanguageToggleButton {
  constructor(public language: LanguageService) {}

  toggleLanguage() {
    this.language.toggleLanguage();
  }
}
