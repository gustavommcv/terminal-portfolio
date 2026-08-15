import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  projectsData: Project[];

  private readonly scrollContainer =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly hasOverflow = signal(false);

  private resizeObserver?: ResizeObserver;

  constructor(private projectsService: ProjectsDataService) {
    this.projectsData = this.projectsService.getFeaturedProjects();

    const destroyRef = inject(DestroyRef);

    // ResizeObserver on the container catches viewport/orientation changes;
    // observing each child too catches content-driven width changes (e.g. a
    // language switch producing longer/shorter translated text).
    afterNextRender(() => {
      const container = this.scrollContainer()?.nativeElement;
      if (!container) {
        return;
      }

      const checkOverflow = () =>
        this.hasOverflow.set(container.scrollWidth > container.clientWidth);

      this.resizeObserver = new ResizeObserver(checkOverflow);
      this.resizeObserver.observe(container);
      Array.from(container.children).forEach((child) =>
        this.resizeObserver?.observe(child),
      );

      destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    });
  }
}
