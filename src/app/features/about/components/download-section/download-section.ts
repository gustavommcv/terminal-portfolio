import { Component, computed, inject, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { OverflowWatch } from './overflow-watch/overflow-watch';
import { LanguageService } from '../../../../core/i18n/language.service';

/** The formats the CV is offered in, as the extensions of the files in `public/cv`. */
const CV_FORMATS = ['docx', 'odt', 'pdf'] as const;

@Component({
  selector: 'app-download-section',
  imports: [TerminalSection, TranslatePipe, AppTitle, OverflowWatch],
  templateUrl: './download-section.html',
  styleUrl: './download-section.scss',
})
export class DownloadSection {
  private readonly language = inject(LanguageService);
  private readonly overflow = viewChild(OverflowWatch);

  /** Whether the formats row scrolls sideways, which is when the hint is shown. */
  readonly hasOverflow = computed(() => this.overflow()?.overflowing() ?? false);

  /** The CV in each format, in the language of the page: what each download link points to. */
  protected readonly files = computed(() =>
    CV_FORMATS.map((format) => {
      const fileName = `cv-${this.language.currentLocale()}.${format}`;

      return { label: format.toUpperCase(), fileName, href: `cv/${fileName}` };
    }),
  );
}
