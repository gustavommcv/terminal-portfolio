import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { AppButton } from '../../../../core/shared/app-button/app-button';

@Component({
  selector: 'app-experience-section',
  imports: [TerminalSection, AppTitle, TranslatePipe, AppButton],
  templateUrl: './experience-section.html',
  styleUrl: './experience-section.scss',
})
export class ExperienceSection {}
