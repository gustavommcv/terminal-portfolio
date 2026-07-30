import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../../services/projects-data.service';
import { Project } from '../../../../data/projects.data';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'featured-projects-section',
  imports: [TranslatePipe, TerminalSection, ProjectCard, AppTitle],
  templateUrl: './featured-projects-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  projectsData: Project[];

  constructor(private projectsService: ProjectsDataService) {
    this.projectsData = this.projectsService.getFeaturedProjects();
  }
}
