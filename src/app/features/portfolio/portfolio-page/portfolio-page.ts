import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../data/projects-data.service';
import { AppTitle } from '../../../core/shared/app-title/app-title';
import type { Project, ProjectCategory } from '../../../data/projects.data';

type ProjectFilter = 'all' | ProjectCategory | 'academic';

function matchesFilter(project: Project, filter: ProjectFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'academic') return project.academic === true;
  return project.category === filter;
}

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
  protected readonly selectedFilter = signal<ProjectFilter>('all');
  protected readonly filters = (
    ['all', 'web', 'desktop', 'terminal', 'embedded', 'academic'] as const
  ).map((id) => ({
    id,
    count: this.projectsData.filter((project) => matchesFilter(project, id)).length,
  }));
  protected readonly visibleProjects = computed(() => {
    const filter = this.selectedFilter();
    return this.projectsData
      .filter((project) => matchesFilter(project, filter))
      .map((project) => ({ key: `${filter}:${project.id}`, project }));
  });
}
