import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { projectsData } from '../../../data/projects.data';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../core/shared/project-card/project-card';

@Component({
  selector: 'portfolio-page',
  imports: [TranslateModule, TerminalSection, ProjectCard],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  projectsData = projectsData;
}
