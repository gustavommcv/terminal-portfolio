import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'contact-section',
  imports: [TerminalSection, TranslateModule],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  formatEmail = (email: any) => {
    if (email.includes('@')) {
      return email
        .replace(/@/g, '@<wbr>')
        .replace(/_/g, '_<wbr>')
        .replace(/\./g, '<wbr>.')
        .replace(/monnerat/g, 'monnerat<wbr>')
        .replace(/gustavo/g, 'gustavo<wbr>');
    }

    return email;
  };
}
