import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { LanguageService } from '../../../../services/language.service';

@Component({
  selector: 'download-section',
  imports: [TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './download-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './download-section.scss',
})
export class DownloadSection {
  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly scrollContainer =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly hasOverflow = signal(false);

  private resizeObserver?: ResizeObserver;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // ResizeObserver on the container catches viewport/orientation changes;
    // observing each child too catches content-driven width changes (e.g. a
    // language switch producing longer/shorter translated text).
    afterNextRender(() => {
      const container = this.scrollContainer()?.nativeElement;
      if (!container) {
        return;
      }

      const checkOverflow = () =>
        this.hasOverflow.set(container.scrollWidth > container.clientWidth);

      this.resizeObserver = new ResizeObserver(checkOverflow);
      this.resizeObserver.observe(container);
      Array.from(container.children).forEach((child) =>
        this.resizeObserver?.observe(child),
      );

      destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    });
  }

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
