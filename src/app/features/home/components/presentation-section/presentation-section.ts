import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'presentation-section',
  imports: [TerminalSection, AppButton, TranslateModule],
  templateUrl: './presentation-section.html',
  styleUrl: './presentation-section.scss',
})
export class PresentationSection { }
