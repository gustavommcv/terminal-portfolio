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
    // dotfiles is its own real project with its own stack (Hyprland/Waybar/
    // Zsh), not a stand-in for minimal-neovim's Lua badge.
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

  it('adds Cloudflare/Vercel as extra hosting badges beyond their stack entries', () => {
    const maquetariaLabels = findProject('maquetaria').badges?.map(
      (b) => b.label,
    );
    const terminalPortfolioLabels = findProject(
      'terminal-portfolio',
    ).badges?.map((b) => b.label);

    expect(maquetariaLabels).toContain('Cloudflare');
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
