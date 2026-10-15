import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { projectCardImage } from '../../../data/project-media';
import { Project } from '../../../data/projects.data';
import { LocalizedLink } from '../../i18n/localized-link';

@Component({
  selector: 'app-project-card',
  imports: [NgOptimizedImage, TranslatePipe, LocalizedLink],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project = input.required<Project>();

  /** Level of the card's title: 3 under a section's h2, 2 directly under the page's h1. */
  readonly headingLevel = input<2 | 3>(3);

  /**
   * Loads the image right away, at high priority, instead of lazily: for the cards
   * that are in view when the page opens, where waiting would delay the largest paint.
   */
  readonly priority = input(false);

  protected readonly image = computed(() => projectCardImage(this.project()));
}
