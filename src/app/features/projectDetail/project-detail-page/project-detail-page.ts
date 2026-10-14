
import {
  Component,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectBadges } from '../../../core/shared/project-badges/project-badges';

@Component({
  selector: 'project-detail-page',
  standalone: true,
  imports: [TranslatePipe, TerminalSection, ProjectBadges],
  templateUrl: './project-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsDataService);

  project = this.projectsService.getProjectById(
    this.route.snapshot.paramMap.get('id') || '',
  );

  readonly gallery: readonly string[] = this.project?.gallery ?? [];
  readonly selectedIndex = signal(0);
  readonly image = computed(() => this.gallery[this.selectedIndex()]);

  readonly lightbox =
    viewChild<ElementRef<HTMLDialogElement>>('lightbox');

  select(index: number): void {
    this.selectedIndex.set(index);
  }

  previous(): void {
    this.step(-1);
  }

  next(): void {
    this.step(1);
  }

  openLightbox(): void {
    this.lightbox()?.nativeElement.showModal();
  }

  closeLightbox(): void {
    this.lightbox()?.nativeElement.close();
  }

  onLightboxClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('img, button')) {
      this.closeLightbox();
    }
  }

  onLightboxKeydown(event: KeyboardEvent): void {
    if (this.gallery.length < 2) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      this.previous();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  private step(direction: 1 | -1): void {
    const count = this.gallery.length;
    this.selectedIndex.update((i) => (i + direction + count) % count);
  }
}
