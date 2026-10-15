import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../data/projects-data.service';
import { AppTitle } from '../../../core/shared/app-title/app-title';

@Component({
  selector: 'app-portfolio-page',
  imports: [TranslatePipe, TerminalSection, ProjectCard, AppTitle],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  /** The cards in the first row are in view when the page opens, so their images load at once. */
  protected readonly aboveTheFold = 3;

  protected readonly projectsData = inject(ProjectsDataService).getAllProjects();
}
