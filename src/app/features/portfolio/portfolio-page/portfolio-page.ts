import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { projectsData } from '../../../data/projects.data';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'portfolio-page',
  imports: [TranslateModule, TerminalSection],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  projectsData = projectsData;
}
