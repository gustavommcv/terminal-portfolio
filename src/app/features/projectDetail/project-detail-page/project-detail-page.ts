import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectBadges } from '../../../core/shared/project-badges/project-badges';
import { ProjectsDataService } from '../../../data/projects-data.service';

@Component({
  selector: 'app-project-detail-page',
  imports: [NgOptimizedImage, TranslatePipe, TerminalSection, ProjectBadges],
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
  protected readonly gallery = computed<readonly string[]>(
    () => this.project()?.gallery ?? [],
  );

  /** The image shown; goes back to the first one when the project changes. */
  readonly selectedIndex = linkedSignal<string, number>({
    source: this.id,
    computation: () => 0,
  });
  protected readonly image = computed(() => this.gallery()[this.selectedIndex()]);

  private readonly lightbox =
    viewChild<ElementRef<HTMLDialogElement>>('lightbox');

  protected select(index: number): void {
    this.selectedIndex.set(index);
  }

  protected previous(): void {
    this.step(-1);
  }

  protected next(): void {
    this.step(1);
  }

  protected openLightbox(): void {
    this.lightbox()?.nativeElement.showModal();
  }

  protected closeLightbox(): void {
    this.lightbox()?.nativeElement.close();
  }

  protected onLightboxClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('img, button')) {
      this.closeLightbox();
    }
  }

  protected onLightboxKeydown(event: KeyboardEvent): void {
    if (this.gallery().length < 2) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      this.previous();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  private step(direction: 1 | -1): void {
    const count = this.gallery().length;
    this.selectedIndex.update((i) => (i + direction + count) % count);
  }
}
