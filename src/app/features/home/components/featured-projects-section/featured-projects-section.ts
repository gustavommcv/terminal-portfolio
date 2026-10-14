import {
  ChangeDetectionStrategy,
  Component,
  computed,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { OverflowWatch } from '../../../../core/shared/overflow-watch/overflow-watch';
import { ProjectCard } from '../../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../../services/projects-data.service';
import { Project } from '../../../../data/projects.data';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'featured-projects-section',
  imports: [TranslatePipe, TerminalSection, ProjectCard, AppTitle, OverflowWatch],
  templateUrl: './featured-projects-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  projectsData: Project[];

  private readonly overflow = viewChild(OverflowWatch);

  /** Whether the project row scrolls sideways, which is when the hint is shown. */
  readonly hasOverflow = computed(() => this.overflow()?.overflowing() ?? false);

  constructor(private projectsService: ProjectsDataService) {
    this.projectsData = this.projectsService.getFeaturedProjects();
  }
}
