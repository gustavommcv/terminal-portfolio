import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { LocalizedLink } from '../../../../core/i18n/localized-link';

@Component({
  selector: 'app-experience-section',
  imports: [TerminalSection, AppTitle, TranslatePipe, LocalizedLink],
  templateUrl: './experience-section.html',
  styleUrl: './experience-section.scss',
})
export class ExperienceSection {}
