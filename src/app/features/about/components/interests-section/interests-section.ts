import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslateModule } from '@ngx-translate/core';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'interests-section',
  imports: [TerminalSection, TranslateModule, AppTitle],
  templateUrl: './interests-section.html',
  styleUrl: './interests-section.scss',
})
export class InterestsSection {}
