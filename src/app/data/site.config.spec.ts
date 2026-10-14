import { readFileSync } from 'node:fs';

import { projectsData } from './projects.data';
import { SITE_URL } from './site.config';

const read = (path: string) => readFileSync(path, 'utf8');

// www redirects to the bare domain, so any address that still points at it
// costs a redirect and tells crawlers two different hosts are the canonical one.
const WWW = 'https://www.gusmonnerat.dev';

describe('canonical host', () => {
  it('is the bare domain', () => {
    expect(SITE_URL).toBe('https://gusmonnerat.dev');
  });

  it.each(['src/index.html', 'public/sitemap.xml', 'public/robots.txt', 'README.md'])(
    '%s never points at the www host',
    (file) => {
      expect(read(file)).not.toContain(WWW);
    },
  );

  it('uses SITE_URL for every canonical and social address in index.html', () => {
    const html = read('src/index.html');
    const addresses = [
      /rel="canonical" href="([^"]+)"/,
      /property="og:url" content="([^"]+)"/,
      /property="og:image" content="([^"]+)"/,
      /name="twitter:image" content="([^"]+)"/,
      /"url": "([^"]+)"/,
      /"image": "([^"]+)"/,
    ].map((pattern) => html.match(pattern)?.[1]);

    for (const address of addresses) {
      expect(address?.startsWith(SITE_URL)).toBe(true);
    }
  });

  it('points robots.txt at the sitemap on the canonical host', () => {
    expect(read('public/robots.txt')).toContain(
      `Sitemap: ${SITE_URL}/sitemap.xml`,
    );
  });
});

describe('sitemap.xml', () => {
  const sitemap = read('public/sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );

  it('lists the pages and every project, so a new project cannot be forgotten', () => {
    const expected = [
      `${SITE_URL}/`,
      `${SITE_URL}/about`,
      `${SITE_URL}/portfolio`,
      ...projectsData.map((project) => `${SITE_URL}/portfolio/${project.id}`),
    ];

    expect(locations).toEqual(expected);
  });

  it('gives each page an English, a Portuguese, and a default alternate', () => {
    const blocks = sitemap.split('<url>').slice(1);

    expect(blocks).toHaveLength(locations.length);
    blocks.forEach((block, index) => {
      const english = locations[index];
      const portuguese = `${english}?locale=pt`;

      expect(block).toContain(`hreflang="en" href="${english}"`);
      expect(block).toContain(`hreflang="pt-BR" href="${portuguese}"`);
      expect(block).toContain(`hreflang="x-default" href="${english}"`);
    });
  });
});
