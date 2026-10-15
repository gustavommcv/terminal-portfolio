import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ProjectBadge } from '../../../../data/projects.data';
import { badgeFileName } from './badge-file';

@Component({
  selector: 'app-project-badges',
  imports: [TranslatePipe],
  templateUrl: './project-badges.html',
  styleUrl: './project-badges.scss',
})
export class ProjectBadges {
  readonly badges = input<ProjectBadge[]>([]);

  /** The badge's SVG, served from the site itself (made by `npm run badges`). */
  badgeSrc(badge: ProjectBadge): string {
    return `images/badges/${badgeFileName(badge)}.svg`;
  }

  badgeAlt(badge: ProjectBadge): string {
    return badge.description ?? badge.label;
  }
}
