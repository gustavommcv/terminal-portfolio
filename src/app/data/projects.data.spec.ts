import { projectsData } from './projects.data';

function findProject(id: string) {
  const project = projectsData.find((p) => p.id === id);
  if (!project) {
    throw new Error(`Expected a project with id "${id}" in projectsData`);
  }
  return project;
}

describe('projectsData badges', () => {
  it('gives Maquetaria a Cloudflare badge', () => {
    const badges = findProject('maquetaria').badges ?? [];
    const cloudflare = badges.find((b) => b.slug === 'cloudflare');

    expect(cloudflare).toBeDefined();
    expect(cloudflare?.label).toBe('Cloudflare');
    expect(cloudflare?.color).toMatch(/^[0-9a-fA-F]{6}$/);
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
    expect(dotfilesEntries[0].badges ?? []).toHaveLength(0);
  });

  it('does not leave a badges array on projects that were not given any', () => {
    const project = findProject('todo-list');
    expect(project.badges === undefined || project.badges.length === 0).toBe(
      true,
    );
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
