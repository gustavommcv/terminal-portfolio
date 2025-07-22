import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'languages-section',
  imports: [TerminalSection, AppTitle, TranslateModule],
  templateUrl: './languages-section.html',
  styleUrl: './languages-section.scss',
})
export class LanguagesSection {}
