import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { Project } from '../../../data/projects.data';
import { LanguageService } from '../../../services/language.service';

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

  constructor(readonly language: LanguageService) {}

  navigateToDetail(event: MouseEvent): void {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    void this.language.navigateWithLocale(`/portfolio/${this.project.id}`);
  }
}
