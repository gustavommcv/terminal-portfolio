import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ProjectDetailPage } from './project-detail-page';

function createFixtureForProject(
  id: string,
): ComponentFixture<ProjectDetailPage> {
  TestBed.configureTestingModule({
    imports: [ProjectDetailPage],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: (key: string) => (key === 'id' ? id : null),
            },
          },
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(ProjectDetailPage);
  fixture.detectChanges();
  return fixture;
}

describe('ProjectDetailPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates for a known project id', () => {
    const fixture = createFixtureForProject('maquetaria');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps the semantic content order: media, then title, description, badges, stack, actions', () => {
    const fixture = createFixtureForProject('maquetaria');
    const root = fixture.nativeElement;
    const layout = root.querySelector('.project-detail-page__layout');
    const media = layout.querySelector('.project-detail-page__media');
    const info = layout.querySelector('.project-detail-page__info');

    expect(layout.children[0]).toBe(media);
    expect(layout.children[1]).toBe(info);

    const infoChildren = Array.from(info.children) as HTMLElement[];
    expect(infoChildren[0].tagName).toBe('H2');
    expect(infoChildren[0].classList.contains('project-detail-page__title')).toBe(
      true,
    );
    expect(infoChildren[1].tagName).toBe('P');
    expect(
      infoChildren[1].classList.contains('project-detail-page__description'),
    ).toBe(true);
    expect(infoChildren[2].tagName.toLowerCase()).toBe('project-badges');
    expect(infoChildren[3].tagName).toBe('UL');
    expect(infoChildren[3].classList.contains('project-detail-page__stack')).toBe(
      true,
    );
    expect(
      infoChildren[infoChildren.length - 1].classList.contains(
        'project-detail-page__links',
      ),
    ).toBe(true);
  });

  it('renders the Cloudflare badge for maquetaria from structured project data', () => {
    const fixture = createFixtureForProject('maquetaria');
    const badgeImg: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-badges__image',
    );

    expect(badgeImg).not.toBeNull();
    expect(badgeImg.getAttribute('src')).toContain('Cloudflare-F38020');
    expect(badgeImg.getAttribute('alt')).toBe('Cloudflare');
  });

  it('renders the Vercel badge for terminal-portfolio', () => {
    const fixture = createFixtureForProject('terminal-portfolio');
    const badgeImg: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-badges__image',
    );

    expect(badgeImg.getAttribute('src')).toContain('Vercel-000000');
  });

  it('renders the Lua badge for the minimal-neovim project', () => {
    const fixture = createFixtureForProject('minimal-neovim');
    const badgeImg: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-badges__image',
    );

    expect(badgeImg.getAttribute('src')).toContain('Lua-0051B3');
  });

  it('leaves no empty badge container for a project with no badges', () => {
    const fixture = createFixtureForProject('todo-list');

    expect(fixture.nativeElement.querySelector('.project-badges')).toBeNull();
    expect(fixture.nativeElement.querySelector('project-badges')).not.toBeNull();
  });

  it('renders maquetaria badges purely from its own project data', () => {
    const fixture = createFixtureForProject('maquetaria');
    const alts = Array.from(
      fixture.nativeElement.querySelectorAll('.project-badges__image'),
    ).map((img) => (img as HTMLImageElement).alt);

    expect(alts).toEqual(['Cloudflare']);
  });

  it('renders minimal-neovim badges purely from its own project data (same code path, different data)', () => {
    const fixture = createFixtureForProject('minimal-neovim');
    const alts = Array.from(
      fixture.nativeElement.querySelectorAll('.project-badges__image'),
    ).map((img) => (img as HTMLImageElement).alt);

    expect(alts).toEqual(['Lua']);
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

  it('gives the project media its correct source and alt text for a static image', () => {
    const fixture = createFixtureForProject('maquetaria');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-detail-page__thumbnail',
    );

    expect(img.getAttribute('src')).toBe(
      'images/projects/maquetaria/images/maquetaria2-thumbnail.webp',
    );
    expect(img.getAttribute('width')).toBe('640');
    expect(img.getAttribute('height')).toBe('360');
  });

  it('gives a GIF-based project its GIF source and matching intrinsic dimensions', () => {
    const fixture = createFixtureForProject('gomodoro');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-detail-page__thumbnail',
    );

    expect(img.getAttribute('src')).toContain('gomodoro.gif');
    expect(img.getAttribute('width')).toBe('700');
    expect(img.getAttribute('height')).toBe('394');
  });
});
