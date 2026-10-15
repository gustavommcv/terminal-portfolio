import { Component, computed, inject, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { OverflowWatch } from '../../../../core/shared/overflow-watch/overflow-watch';
import { ProjectCard } from '../../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../../data/projects-data.service';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'app-featured-projects-section',
  imports: [TranslatePipe, TerminalSection, ProjectCard, AppTitle, OverflowWatch],
  templateUrl: './featured-projects-section.html',
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  private readonly overflow = viewChild(OverflowWatch);

  protected readonly projectsData = inject(ProjectsDataService).getFeaturedProjects();

  /** Whether the project row scrolls sideways, which is when the hint is shown. */
  readonly hasOverflow = computed(() => this.overflow()?.overflowing() ?? false);
}
