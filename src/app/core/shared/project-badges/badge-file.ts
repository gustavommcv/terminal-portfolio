import type { ProjectBadge } from '../../../data/projects.data';

/**
 * Name, without extension, of a badge's SVG in `public/images/badges`.
 *
 * `npm run badges` writes those files, and imports this module from Node, so it
 * must stay free of Angular imports and of TypeScript that needs compiling
 * (types only, no enums).
 */
export function badgeFileName(badge: ProjectBadge): string {
  return (
    badge.slug ??
    badge.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );
}
