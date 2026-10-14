import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Project } from '../../../data/projects.data';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { AppTitle } from '../../../core/shared/app-title/app-title';

@Component({
  selector: 'portfolio-page',
  imports: [TranslatePipe, TerminalSection, ProjectCard, AppTitle],
  templateUrl: './portfolio-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  projectsData: Project[];

  constructor(
    private projectsService: ProjectsDataService,
  ) {
    this.projectsData = this.projectsService.getAllProjects();
  }
}
