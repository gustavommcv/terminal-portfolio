import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ProjectBadge } from '../../../data/projects.data';

/** Escapes a label for use inside a Shields.io static-badge URL segment. */
function encodeShieldsSegment(value: string): string {
  return value.replace(/-/g, '--').replace(/_/g, '__').replace(/ /g, '_');
}

@Component({
  selector: 'project-badges',
  imports: [],
  templateUrl: './project-badges.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './project-badges.scss',
})
export class ProjectBadges {
  readonly badges = input<ProjectBadge[]>([]);

  badgeSrc(badge: ProjectBadge): string {
    const label = encodeShieldsSegment(badge.label);
    const color = badge.color.replace(/^#/, '');
    const base = `https://img.shields.io/badge/${label}-${color}?style=flat-square`;

    if (!badge.slug) {
      return base;
    }

    const logoColor = badge.logoColor ?? 'white';
    return `${base}&logo=${badge.slug}&logoColor=${logoColor}`;
  }

  badgeAlt(badge: ProjectBadge): string {
    return badge.description ?? badge.label;
  }
}
