import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslatePipe } from '@ngx-translate/core';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'app-interests-section',
  imports: [TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './interests-section.html',
  styleUrl: './interests-section.scss',
})
export class InterestsSection {}
