import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectBadges } from '../../../core/shared/project-badges/project-badges';
import { ProjectsDataService } from '../../../data/projects-data.service';
import { ProjectGallery } from '../components/project-gallery/project-gallery';

@Component({
  selector: 'app-project-detail-page',
  imports: [TranslatePipe, TerminalSection, ProjectBadges, ProjectGallery],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage {
  private readonly projectsService = inject(ProjectsDataService);

  /** The `:id` of the route, bound to this input by the router (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly project = computed(() =>
    this.projectsService.getProjectById(this.id()),
  );
}
