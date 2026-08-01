import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'contact-section',
  imports: [TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './contact-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  formatEmail(email: string): string {
    return email
      .replace(/@/g, '@<wbr>')
      .replace(/_/g, '_<wbr>')
      .replace(/\./g, '<wbr>.')
      .replace(/monnerat/g, 'monnerat<wbr>')
      .replace(/gustavo/g, 'gustavo<wbr>');
  }
}
