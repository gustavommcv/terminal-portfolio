import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/language.service';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'download-section',
  imports: [TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './download-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './download-section.scss',
})
export class DownloadSection {
  constructor(private languageService: LanguageService) {}

  downloadCV(format: 'docx' | 'odt' | 'pdf') {
    const lang = this.languageService.currentLocale;
    const fileName = `cv-${lang}.${format}`;
    const filePath = `cv/${fileName}`;

    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
