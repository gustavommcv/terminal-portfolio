import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../../services/projects-data.service';
import { Project } from '../../../../data/projects.data';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'featured-projects-section',
  imports: [TranslateModule, TerminalSection, ProjectCard, AppTitle],
  templateUrl: './featured-projects-section.html',
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  projectsData: Project[];

  constructor(private projectsService: ProjectsDataService) {
    this.projectsData = this.projectsService.getFeaturedProjects();
  }
}
