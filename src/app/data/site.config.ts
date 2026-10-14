/**
 * Canonical origin of the site. The bare domain is the primary one:
 * `www.gusmonnerat.dev` redirects to it, so every canonical URL, sitemap
 * entry, and social-card link must use this host.
 */
export const SITE_URL = 'https://gusmonnerat.dev';

/** Image used for social cards on pages that have no image of their own. */
export const DEFAULT_SOCIAL_IMAGE = {
  path: 'images/me.webp',
  width: 584,
  height: 855,
} as const;
