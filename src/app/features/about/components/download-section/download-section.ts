import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/language.service';

@Component({
  selector: 'download-section',
  imports: [TerminalSection, TranslateModule],
  templateUrl: './download-section.html',
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
