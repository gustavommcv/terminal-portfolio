import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { projectCardImage } from '../../../data/project-media';
import { Project } from '../../../data/projects.data';
import { LanguageService } from '../../../services/language.service';
import { isPlainLeftClick } from '../click.utils';

@Component({
  selector: 'project-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './project-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  @Input({ required: true }) project!: Project;

  /** Level of the card's title: 3 under a section's h2, 2 directly under the page's h1. */
  @Input() headingLevel: 2 | 3 = 3;

  constructor(readonly language: LanguageService) {}

  get image(): string {
    return projectCardImage(this.project);
  }

  navigateToDetail(event: MouseEvent): void {
    if (!isPlainLeftClick(event)) {
      return;
    }

    event.preventDefault();
    void this.language.navigateWithLocale(`/portfolio/${this.project.id}`);
  }
}
