import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { Carousel } from '../../../../core/shared/carousel/carousel';
import { ProjectCard } from '../../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../../data/projects-data.service';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'app-featured-projects-section',
  imports: [TranslatePipe, TerminalSection, ProjectCard, AppTitle, Carousel],
  templateUrl: './featured-projects-section.html',
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  protected readonly projectsData = inject(ProjectsDataService).getFeaturedProjects();
}
