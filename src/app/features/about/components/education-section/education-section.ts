import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'education-section',
  imports: [TerminalSection, TranslateModule],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss',
})
export class EducationSection {}
