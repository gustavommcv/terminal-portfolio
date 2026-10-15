import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../testing/english-catalog';
import { projectsData } from '../../../data/projects.data';
import { ProjectDetailPage } from './project-detail-page';

function createFixtureForProject(
  id: string,
): ComponentFixture<ProjectDetailPage> {
  TestBed.configureTestingModule({ imports: [ProjectDetailPage] });

  const fixture = TestBed.createComponent(ProjectDetailPage);
  // The router binds the route's :id to this input (withComponentInputBinding).
  fixture.componentRef.setInput('id', id);
  fixture.detectChanges();
  return fixture;
}

function badgeAlts(fixture: ComponentFixture<ProjectDetailPage>): string[] {
  return Array.from(
    fixture.nativeElement.querySelectorAll('.project-badges__image'),
  ).map((img) => (img as HTMLImageElement).alt);
}

const galleryOf = (id: string): readonly string[] =>
  projectsData.find((project) => project.id === id)!.gallery;

describe('ProjectDetailPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('follows the id input: another project replaces the content and starts at its first image', () => {
    const fixture = createFixtureForProject('maquetaria');
    const root: HTMLElement = fixture.nativeElement;
    const heading = () => root.querySelector('h1')?.textContent?.trim();
    const mainImage = () =>
      root.querySelector('.project-gallery__thumbnail')?.getAttribute('src');

    expect(heading()).toBe('maquetaria');
    (root.querySelectorAll('.project-gallery__thumb')[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(mainImage()).toBe(galleryOf('maquetaria')[1]);

    fixture.componentRef.setInput('id', 'mangabound');
    fixture.detectChanges();

    expect(heading()).toBe('mangabound');
    expect(mainImage()).toBe(galleryOf('mangabound')[0]);
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Mangabound');
  });

  it('renders nothing for an id with no project, instead of failing', () => {
    const fixture = createFixtureForProject('no-such-project');

    expect(fixture.nativeElement.querySelector('.project-detail-page')).toBeNull();
  });

  it('creates for a known project id', () => {
    const fixture = createFixtureForProject('maquetaria');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('gives the gallery the images of the project and its name', () => {
    const fixture = createFixtureForProject('maquetaria');
    const root: HTMLElement = fixture.nativeElement;
    const main = root.querySelector('.project-gallery__thumbnail') as HTMLImageElement;

    expect(root.querySelectorAll('.project-gallery__thumb')).toHaveLength(galleryOf('maquetaria').length);
    expect(main.getAttribute('src')).toBe(galleryOf('maquetaria')[0]);
    expect(main.alt).toBe(catalogEntry('projects-page.projects.maquetaria.title'));
  });

  it('keeps the semantic content order: gallery, then title, description, badges, actions - no separate plain-text stack list', () => {
    const fixture = createFixtureForProject('maquetaria');
    const root = fixture.nativeElement;
    const layout = root.querySelector('.project-detail-page__layout');
    const gallery = layout.querySelector('app-project-gallery');
    const info = layout.querySelector('.project-detail-page__info');

    expect(layout.children[0]).toBe(gallery);
    expect(layout.children[1]).toBe(info);

    const infoChildren = Array.from(info.children) as HTMLElement[];
    expect(infoChildren).toHaveLength(4);
    expect(infoChildren[0].tagName).toBe('H2');
    expect(infoChildren[0].classList.contains('project-detail-page__title')).toBe(
      true,
    );
    expect(infoChildren[1].tagName).toBe('P');
    expect(
      infoChildren[1].classList.contains('project-detail-page__description'),
    ).toBe(true);
    expect(infoChildren[2].tagName.toLowerCase()).toBe('app-project-badges');
    expect(infoChildren[3].classList.contains('project-detail-page__links')).toBe(
      true,
    );
    expect(root.querySelector('.project-detail-page__stack')).toBeNull();
  });

  it('renders a Cloudflare badge for maquetaria, in addition to its stack badges', () => {
    const fixture = createFixtureForProject('maquetaria');

    expect(badgeAlts(fixture)).toEqual(['Angular', 'Go', 'AWS Lambda', 'Cloudflare']);
    const cloudflareImg = Array.from(
      fixture.nativeElement.querySelectorAll('.project-badges__image'),
    ).find((img) => (img as HTMLImageElement).alt === 'Cloudflare') as
      | HTMLImageElement
      | undefined;
    expect(cloudflareImg?.getAttribute('src')).toBe('images/badges/cloudflare.svg');
  });

  it('renders a Vercel badge for terminal-portfolio, in addition to its stack badges', () => {
    const fixture = createFixtureForProject('terminal-portfolio');

    expect(badgeAlts(fixture)).toEqual([
      'Angular',
      'TypeScript',
      'SCSS',
      'Vercel',
    ]);
  });

  it('renders the Lua badge for the minimal-neovim project, replacing its old plain-text stack tags', () => {
    const fixture = createFixtureForProject('minimal-neovim');

    // lazy.nvim has no real Simple Icons entry, so it's dropped entirely
    // rather than shown as a bare, logo-less label.
    expect(badgeAlts(fixture)).toEqual(['Lua', 'Neovim']);
    expect(
      fixture.nativeElement.querySelector('.project-detail-page__stack'),
    ).toBeNull();
  });

  it('renders every project stack entry as a badge, purely from data (no per-project template branching)', () => {
    const fixture = createFixtureForProject('todo-list');
    expect(badgeAlts(fixture)).toEqual(['React', 'Node.js', 'JWT']);
  });

  it('renders both actions when a project has both a repository and a demo link', () => {
    const fixture = createFixtureForProject('chmod-calculator');
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.project-detail-page__link'),
    ) as HTMLAnchorElement[];

    expect(links).toHaveLength(2);
    expect(links.every((a) => a.getAttribute('rel') === 'noopener noreferrer')).toBe(
      true,
    );
    expect(links.every((a) => a.getAttribute('target') === '_blank')).toBe(true);
  });

  it('renders only the repository action when a project has no demo link, with no empty actions row', () => {
    const fixture = createFixtureForProject('terminal-portfolio');
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.project-detail-page__link'),
    ) as HTMLAnchorElement[];

    expect(links).toHaveLength(1);
    expect(links[0].textContent?.trim()).toBe('Repository');
    expect(
      fixture.nativeElement.querySelector('.project-detail-page__links'),
    ).not.toBeNull();
  });

  it('renders a Documentation action, labelled as such rather than as a demo, when a project has a docs link', () => {
    const fixture = createFixtureForProject('mangabound');
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.project-detail-page__link'),
    ) as HTMLAnchorElement[];

    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Repository',
      'Documentation',
    ]);
    expect(links[1].getAttribute('href')).toBe(
      'https://gustavommcv.github.io/mangabound/',
    );
    expect(links[1].getAttribute('rel')).toBe('noopener noreferrer');
    expect(links[1].getAttribute('target')).toBe('_blank');
  });

  it('shows no thumbnail strip for a project with a single image', () => {
    const fixture = createFixtureForProject('gomodoro');

    expect(
      fixture.nativeElement.querySelector('.project-gallery__thumbs'),
    ).toBeNull();
  });

  it('shows a still image, not an animation, for gomodoro', () => {
    const fixture = createFixtureForProject('gomodoro');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-gallery__thumbnail',
    );

    expect(img.getAttribute('src')).toBe(
      'images/projects/gomodoro/images/gomodoro-terminal.webp',
    );
  });

  it('opens the detail page on the first gallery image, which for Mangabound is its cover', () => {
    const fixture = createFixtureForProject('mangabound');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-gallery__thumbnail',
    );

    expect(img.getAttribute('src')).toBe(
      'images/projects/mangabound/images/mangabound-cover.webp',
    );
  });
});
