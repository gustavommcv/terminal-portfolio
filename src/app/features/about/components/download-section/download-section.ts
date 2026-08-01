import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { LanguageService } from '../../../../services/language.service';

@Component({
  selector: 'download-section',
  imports: [TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './download-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './download-section.scss',
})
export class DownloadSection {
  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);

  downloadCV(format: 'docx' | 'odt' | 'pdf'): void {
    const language = this.language.currentLocale();
    const fileName = `cv-${language}.${format}`;
    const link = this.document.createElement('a');

    link.href = `cv/${fileName}`;
    link.download = fileName;
    this.document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
