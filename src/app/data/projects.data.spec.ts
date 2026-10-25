import { existsSync, readFileSync } from 'node:fs';

import { projectCardImage } from './project-media';
import { Project, projectsData } from './projects.data';
import { ProjectsDataService } from './projects-data.service';

function findProject(id: string) {
  const project = projectsData.find((p) => p.id === id);
  if (!project) {
    throw new Error(`Expected a project with id "${id}" in projectsData`);
  }
  return project;
}

describe('projectsData badges', () => {
  it('gives Maquetaria a Vercel badge', () => {
    const badges = findProject('maquetaria').badges ?? [];
    const vercel = badges.find((b) => b.slug === 'vercel');

    expect(vercel).toBeDefined();
    expect(vercel?.label).toBe('Vercel');
    expect(vercel?.color).toMatch(/^[0-9a-fA-F]{6}$/);
  });

  it('gives Terminal Portfolio a Vercel badge', () => {
    const badges = findProject('terminal-portfolio').badges ?? [];
    const vercel = badges.find((b) => b.slug === 'vercel');

    expect(vercel).toBeDefined();
    expect(vercel?.label).toBe('Vercel');
    expect(vercel?.color).toMatch(/^[0-9a-fA-F]{6}$/);
  });

  it('gives the existing Minimal Neovim project a Lua badge, without a duplicate dotfiles entry', () => {
    const badges = findProject('minimal-neovim').badges ?? [];
    const lua = badges.find((b) => b.slug === 'lua');

    expect(lua).toBeDefined();
    expect(lua?.label).toBe('Lua');

    const dotfilesEntries = projectsData.filter((p) => p.id === 'dotfiles');
    expect(dotfilesEntries).toHaveLength(1);
    // dotfiles is its own real project with its own stack (Hyprland), not
    // a stand-in for minimal-neovim's Lua badge.
    expect(
      dotfilesEntries[0].badges?.some((b) => b.slug === 'lua'),
    ).toBe(false);
  });

  it('gives every project a badge for each of its stack entries, so no plain-text tag list is needed', () => {
    projectsData.forEach((project) => {
      expect(project.badges?.length ?? 0).toBeGreaterThan(0);
      const badgeLabels = new Set(project.badges?.map((b) => b.label));
      project.stack.forEach((tech) => {
        expect(badgeLabels.has(tech)).toBe(true);
      });
    });
  });

  it('adds Vercel as extra hosting badges beyond their stack entries', () => {
    const maquetariaLabels = findProject('maquetaria').badges?.map(
      (b) => b.label,
    );
    const terminalPortfolioLabels = findProject(
      'terminal-portfolio',
    ).badges?.map((b) => b.label);

    expect(maquetariaLabels).toContain('Vercel');
    expect(terminalPortfolioLabels).toContain('Vercel');
  });

  it('gives every badge a label and a valid 6-digit hex color', () => {
    projectsData.forEach((project) => {
      project.badges?.forEach((badge) => {
        expect(badge.label.length).toBeGreaterThan(0);
        expect(badge.color).toMatch(/^[0-9a-fA-F]{6}$/);
      });
    });
  });

  it('gives every project at least one gallery image, with none repeated', () => {
    projectsData.forEach((project) => {
      expect(project.gallery.length).toBeGreaterThan(0);
      expect(new Set(project.gallery).size).toBe(project.gallery.length);
    });
  });

  it('only declares a cover when it differs from the first gallery image', () => {
    projectsData.forEach((project) => {
      if (project.cover !== undefined) {
        expect(project.cover).not.toBe(project.gallery[0]);
      }
    });
  });

  it('gives Maquetaria a multi-image gallery that opens on the home page capture', () => {
    const gallery = findProject('maquetaria').gallery;

    expect(gallery.length).toBeGreaterThan(1);
    expect(gallery[0]).toContain('maquetaria-home');
  });

  it('keeps the cover of a project among its gallery images', () => {
    projectsData.forEach((project) => {
      if (project.cover !== undefined) {
        expect(project.gallery, project.id).toContain(project.cover);
      }
    });
  });

  it('opens the gallery of Manga2Ink on its cover, which is also what its card shows', () => {
    const manga2ink = findProject('manga2ink');

    expect(manga2ink.gallery[0]).toContain('manga2ink-cover');
    expect(projectCardImage(manga2ink)).toBe(manga2ink.gallery[0]);
  });

  it('shows Manga2Ink through its cover and then the steps of its workflow', () => {
    const gallery = findProject('manga2ink').gallery.map((image) =>
      image.replace(/^.*manga2ink-|\.webp$/g, ''),
    );

    expect(gallery).toEqual([
      'cover-refined',
      'thumbnail',
      'chapter-mapping',
      'book-details',
      'conversion-options',
      'book-warnings',
      'sharing',
    ]);
  });

  it('keeps every project id unique', () => {
    const ids = projectsData.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps stack tags on every project alongside the new badges field', () => {
    projectsData.forEach((project) => {
      expect(Array.isArray(project.stack)).toBe(true);
    });
  });
});

// The portfolio is data. A typo in an image path, a project with no Portuguese
// text, a link that is not a link: none of them fails to compile, they only show
// up on the live site. These checks catch them before that.
describe('the project catalog', () => {
  const catalogs = {
    en: JSON.parse(readFileSync('public/i18n/en.json', 'utf8')),
    pt: JSON.parse(readFileSync('public/i18n/pt.json', 'utf8')),
  } as Record<'en' | 'pt', { 'projects-page': { projects: Record<string, Record<string, string>> } }>;

  const images = (project: Project): string[] => [
    ...(project.cover ? [project.cover] : []),
    ...project.gallery,
  ];

  it('is not empty', () => {
    expect(projectsData.length).toBeGreaterThan(0);
  });

  it('gives every project its own id, written to be used in an address', () => {
    const ids = projectsData.map((project) => project.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('only names image files that exist', () => {
    const missing = projectsData
      .flatMap((project) => images(project).map((image) => [project.id, image]))
      .filter(([, image]) => !existsSync(`public/${image}`))
      .map(([id, image]) => `${id}: ${image}`);

    expect(missing).toEqual([]);
  });

  it('only links to real web addresses', () => {
    for (const project of projectsData) {
      for (const [kind, url] of Object.entries(project.links)) {
        expect(() => new URL(url as string), `${project.id} ${kind}`).not.toThrow();
        expect(new URL(url as string).protocol, `${project.id} ${kind}`).toBe('https:');
      }
    }
  });

  it('has a title, a card summary and a description, in English and in Portuguese', () => {
    for (const language of ['en', 'pt'] as const) {
      const texts = catalogs[language]['projects-page'].projects;

      for (const project of projectsData) {
        for (const field of ['title', 'shortDescription', 'description']) {
          const text = texts[project.id]?.[field];
          expect(typeof text === 'string' && text.trim().length > 0, `${language}: ${project.id}.${field}`).toBe(true);
        }
      }
    }
  });

  it('has no text in either catalog for a project that does not exist', () => {
    const known = new Set(projectsData.map((project) => project.id));

    for (const language of ['en', 'pt'] as const) {
      const ids = Object.keys(catalogs[language]['projects-page'].projects);

      expect(ids.filter((id) => !known.has(id)), language).toEqual([]);
    }
  });

  it('features some projects, but not all of them', () => {
    const featured = projectsData.filter((project) => project.featured);

    expect(featured.length).toBeGreaterThan(0);
    expect(featured.length).toBeLessThan(projectsData.length);
  });

  it('does not feature the portfolio itself', () => {
    expect(findProject('terminal-portfolio').featured).toBeFalsy();
  });
});

describe('ProjectsDataService', () => {
  const service = new ProjectsDataService();

  it('finds a project by its id, and nothing for an id that is not one', () => {
    expect(service.getProjectById('maquetaria')?.id).toBe('maquetaria');
    expect(service.getProjectById('no-such-project')).toBeUndefined();
    expect(service.getProjectById('')).toBeUndefined();
  });

  it('returns every project, in the order of the catalog', () => {
    expect(service.getAllProjects().map((project) => project.id)).toEqual(
      projectsData.map((project) => project.id),
    );
  });

  it('returns only the featured ones, in the same order', () => {
    const featured = service.getFeaturedProjects();

    expect(featured.every((project) => project.featured === true)).toBe(true);
    expect(featured.map((project) => project.id)).toEqual(
      projectsData.filter((project) => project.featured).map((project) => project.id),
    );
  });
});
