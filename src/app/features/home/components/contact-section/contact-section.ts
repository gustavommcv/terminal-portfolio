import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslatePipe } from '@ngx-translate/core';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { HomeRevealDirective } from '../../directives/home-reveal.directive';

@Component({
  selector: 'contact-section',
  imports: [TerminalSection, TranslatePipe, AppTitle, HomeRevealDirective],
  templateUrl: './contact-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
