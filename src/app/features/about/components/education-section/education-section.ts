import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslatePipe } from '@ngx-translate/core';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'app-education-section',
  imports: [TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss',
})
export class EducationSection {}
