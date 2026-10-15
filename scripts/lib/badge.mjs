// Draws the technology badges of the project pages as local SVG files.
//
// They used to be requested from img.shields.io on every page view, which told a
// third party who was looking at the site. `badge-maker` is the library
// shields.io itself draws with, and the logos are Simple Icons, so the output is
// pixel-for-pixel what that service returned (checked when this was written);
// the difference is that the files are made once, committed, and served from the
// site.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { makeBadge } from 'badge-maker';

import { badgeFileName } from '../../src/app/features/project-detail/components/project-badges/badge-file.ts';

/** Where the Simple Icons SVGs are (installed by `npm ci`). */
export const iconsDirectory = join('node_modules', 'simple-icons', 'icons');

/** The logo as the data URI badge-maker embeds, or null when Simple Icons has no such logo any more. */
function logoFor(badge, icons) {
  if (!badge.slug) {
    return null;
  }

  const file = join(icons, `${badge.slug}.svg`);
  if (!existsSync(file)) {
    return null;
  }

  const logoColor = badge.logoColor ?? 'white';
  const fill = /^[0-9a-f]{3,8}$/i.test(logoColor) ? `#${logoColor}` : logoColor;
  const svg = readFileSync(file, 'utf8').replace('<svg', `<svg fill="${fill}"`);

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/** One flat-square badge: the label on a block of the badge's colour, with its logo when there is one. */
export function renderBadge(badge, icons = iconsDirectory) {
  const logoBase64 = logoFor(badge, icons);

  return makeBadge({
    message: badge.label,
    color: `#${badge.color}`,
    style: 'flat-square',
    ...(logoBase64 ? { logoBase64 } : {}),
  });
}

/**
 * Every badge the projects use, by file name. Two different badges that would
 * share a file name are an error, since one would silently replace the other.
 */
export function planBadges(projects, icons = iconsDirectory) {
  const planned = new Map();

  for (const project of projects) {
    for (const badge of project.badges ?? []) {
      const name = `${badgeFileName(badge)}.svg`;
      const definition = JSON.stringify([badge.label, badge.color, badge.slug ?? null, badge.logoColor ?? 'white']);
      const previous = planned.get(name);

      if (previous && previous.definition !== definition) {
        throw new Error(
          `${name} is wanted by two different badges: ${previous.definition} and ${definition}. Give one of them its own slug.`,
        );
      }

      planned.set(name, {
        definition,
        svg: previous?.svg ?? renderBadge(badge, icons),
        missingLogo: Boolean(badge.slug) && !logoFor(badge, icons),
        label: badge.label,
      });
    }
  }

  return planned;
}
