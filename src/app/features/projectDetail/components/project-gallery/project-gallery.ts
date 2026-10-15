import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The images of a project: the one on show, a strip of thumbnails to choose
 * another when there are several, and a full-screen viewer that steps through
 * them. It knows nothing about the project beyond its images and what to call them.
 */
@Component({
  selector: 'app-project-gallery',
  imports: [NgOptimizedImage, TranslatePipe],
  templateUrl: './project-gallery.html',
  styleUrl: './project-gallery.scss',
})
export class ProjectGallery {
  /** The images, in the order they are shown; never empty. */
  readonly images = input.required<readonly string[]>();

  /** What the image shows, for a screen reader: the name of the project. */
  readonly alt = input.required<string>();

  /** The image shown; goes back to the first one when the images change. */
  readonly selectedIndex = linkedSignal<readonly string[], number>({
    source: this.images,
    computation: () => 0,
  });
  protected readonly image = computed(() => this.images()[this.selectedIndex()]);

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
    if (this.images().length < 2) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      this.previous();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  private step(direction: 1 | -1): void {
    const count = this.images().length;
    this.selectedIndex.update((i) => (i + direction + count) % count);
  }
}
