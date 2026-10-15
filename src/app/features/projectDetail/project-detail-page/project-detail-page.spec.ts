import { ComponentFixture, TestBed } from '@angular/core/testing';

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

describe('ProjectDetailPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('follows the id input: another project replaces the content and starts at its first image', () => {
    const fixture = createFixtureForProject('maquetaria');
    const page = fixture.componentInstance;
    const root: HTMLElement = fixture.nativeElement;
    const heading = () => root.querySelector('h1')?.textContent?.trim();

    expect(heading()).toBe('maquetaria');
    page.selectedIndex.set(1);
    expect(page.selectedIndex()).toBe(1);

    fixture.componentRef.setInput('id', 'mangabound');
    fixture.detectChanges();

    expect(heading()).toBe('mangabound');
    expect(page.selectedIndex()).toBe(0);
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Mangabound');
  });

  it('renders nothing for an id with no project, instead of failing', () => {
    const fixture = createFixtureForProject('no-such-project');

    expect(fixture.nativeElement.querySelector('.project-detail-page')).toBeNull();
  });

  it('loads the main image at high priority and keeps the thumbnails lazy', () => {
    const root: HTMLElement = createFixtureForProject('maquetaria').nativeElement;
    const main = root.querySelector('.project-detail-page__thumbnail') as HTMLImageElement;
    const thumbs = Array.from(
      root.querySelectorAll('.project-detail-page__thumb img'),
    ) as HTMLImageElement[];

    expect(main.getAttribute('fetchpriority')).toBe('high');
    expect(main.getAttribute('loading')).toBe('eager');
    expect(thumbs.length).toBeGreaterThan(1);
    expect(thumbs.every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
  });

  it('creates for a known project id', () => {
    const fixture = createFixtureForProject('maquetaria');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps the semantic content order: media, then title, description, badges, actions - no separate plain-text stack list', () => {
    const fixture = createFixtureForProject('maquetaria');
    const root = fixture.nativeElement;
    const layout = root.querySelector('.project-detail-page__layout');
    const media = layout.querySelector('.project-detail-page__media');
    const info = layout.querySelector('.project-detail-page__info');

    expect(layout.children[0]).toBe(media);
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

  it('gives the project media its correct source and alt text for a static image', () => {
    const fixture = createFixtureForProject('maquetaria');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-detail-page__thumbnail',
    );

    expect(img.getAttribute('src')).toBe(
      'images/projects/maquetaria/images/maquetaria-home.webp',
    );
    expect(img.getAttribute('width')).toBe('640');
    expect(img.getAttribute('height')).toBe('360');
  });

  it('shows a thumbnail strip for a project with several gallery images, starting on the first', () => {
    const fixture = createFixtureForProject('maquetaria');
    const thumbs = Array.from(
      fixture.nativeElement.querySelectorAll('.project-detail-page__thumb'),
    ) as HTMLButtonElement[];

    expect(thumbs).toHaveLength(projectsData.find((p) => p.id === 'maquetaria')!.gallery.length);
    expect(thumbs[0].getAttribute('aria-pressed')).toBe('true');
    expect(
      thumbs.slice(1).every((t) => t.getAttribute('aria-pressed') === 'false'),
    ).toBe(true);
    expect(thumbs.every((t) => t.getAttribute('type') === 'button')).toBe(true);
    expect(thumbs.every((t) => t.querySelector('img')?.alt === '')).toBe(true);
  });

  it('swaps the main image when another thumbnail is chosen', () => {
    const fixture = createFixtureForProject('maquetaria');
    const root: HTMLElement = fixture.nativeElement;
    const main = () =>
      root.querySelector('.project-detail-page__thumbnail') as HTMLImageElement;
    const thumbs = () =>
      Array.from(
        root.querySelectorAll('.project-detail-page__thumb'),
      ) as HTMLButtonElement[];

    expect(main().getAttribute('src')).toContain('maquetaria-home');

    thumbs()[1].click();
    fixture.detectChanges();

    expect(main().getAttribute('src')).toBe(
      'images/projects/maquetaria/images/maquetaria-services.webp',
    );
    expect(thumbs()[0].getAttribute('aria-pressed')).toBe('false');
    expect(thumbs()[1].getAttribute('aria-pressed')).toBe('true');
  });

  describe('full screen lightbox', () => {
    // jsdom does not implement the modal <dialog> API, so give it the
    // minimal behaviour the component relies on.
    beforeAll(() => {
      const proto = HTMLDialogElement.prototype;
      proto.showModal = function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      };
      proto.close = function (this: HTMLDialogElement) {
        if (this.hasAttribute('open')) {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        }
      };
    });

    const dialog = (f: ComponentFixture<ProjectDetailPage>) =>
      f.nativeElement.querySelector(
        '.project-detail-page__lightbox',
      ) as HTMLDialogElement;
    const lightboxImage = (f: ComponentFixture<ProjectDetailPage>) =>
      f.nativeElement.querySelector(
        '.project-detail-page__lightbox-image',
      ) as HTMLImageElement | null;
    const click = (
      f: ComponentFixture<ProjectDetailPage>,
      selector: string,
    ) => {
      (f.nativeElement.querySelector(selector) as HTMLElement).click();
      f.detectChanges();
    };

    it('makes the main image a button that opens the current image in a modal dialog', () => {
      const fixture = createFixtureForProject('maquetaria');

      expect(dialog(fixture).hasAttribute('open')).toBe(false);

      click(fixture, '.project-detail-page__expand');

      expect(dialog(fixture).hasAttribute('open')).toBe(true);
      expect(lightboxImage(fixture)?.getAttribute('src')).toBe(
        'images/projects/maquetaria/images/maquetaria-home.webp',
      );
    });

    it('closes from the close button', () => {
      const fixture = createFixtureForProject('maquetaria');
      click(fixture, '.project-detail-page__expand');

      click(fixture, '.project-detail-page__lightbox-close');

      expect(dialog(fixture).hasAttribute('open')).toBe(false);
    });

    it('closes when the empty area around the image is clicked, but not when the image is', () => {
      const fixture = createFixtureForProject('maquetaria');
      click(fixture, '.project-detail-page__expand');

      click(fixture, '.project-detail-page__lightbox-image');
      expect(dialog(fixture).hasAttribute('open')).toBe(true);

      click(fixture, '.project-detail-page__lightbox-stage');
      expect(dialog(fixture).hasAttribute('open')).toBe(false);
    });

    it('steps through the gallery with the buttons, wrapping around, in sync with the page', () => {
      const fixture = createFixtureForProject('maquetaria');
      const count = projectsData.find((p) => p.id === 'maquetaria')!.gallery
        .length;
      click(fixture, '.project-detail-page__expand');

      click(fixture, '.project-detail-page__lightbox-next');
      expect(lightboxImage(fixture)?.getAttribute('src')).toContain(
        'maquetaria-services',
      );

      click(fixture, '.project-detail-page__lightbox-prev');
      click(fixture, '.project-detail-page__lightbox-prev');
      expect(lightboxImage(fixture)?.getAttribute('src')).toBe(
        projectsData.find((p) => p.id === 'maquetaria')!.gallery[count - 1],
      );
      const thumbs = fixture.nativeElement.querySelectorAll('.project-detail-page__thumb');
      expect(thumbs[count - 1].getAttribute('aria-pressed')).toBe('true');
    });

    it('steps through the gallery with the arrow keys', () => {
      const fixture = createFixtureForProject('maquetaria');
      click(fixture, '.project-detail-page__expand');

      dialog(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      fixture.detectChanges();

      expect(lightboxImage(fixture)?.getAttribute('src')).toContain(
        'maquetaria-services',
      );
    });

    it('offers no previous/next controls for a single-image project', () => {
      const fixture = createFixtureForProject('gomodoro');
      click(fixture, '.project-detail-page__expand');

      expect(
        fixture.nativeElement.querySelector(
          '.project-detail-page__lightbox-next',
        ),
      ).toBeNull();
      expect(
        fixture.nativeElement.querySelector(
          '.project-detail-page__lightbox-prev',
        ),
      ).toBeNull();
      expect(lightboxImage(fixture)).not.toBeNull();
    });
  });

  it('shows no thumbnail strip for a project with a single image', () => {
    const fixture = createFixtureForProject('gomodoro');

    expect(
      fixture.nativeElement.querySelector('.project-detail-page__thumbs'),
    ).toBeNull();
  });

  it('shows a still image, not an animation, for gomodoro', () => {
    const fixture = createFixtureForProject('gomodoro');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-detail-page__thumbnail',
    );

    expect(img.getAttribute('src')).toBe(
      'images/projects/gomodoro/images/gomodoro-thumbnail.webp',
    );
  });

  it('shows the first gallery image on the detail page even when the project has a separate card cover', () => {
    const fixture = createFixtureForProject('mangabound');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-detail-page__thumbnail',
    );

    expect(img.getAttribute('src')).toBe(
      'images/projects/mangabound/images/mangabound-thumbnail.webp',
    );
    expect(img.getAttribute('src')).not.toContain('cover');
  });
});
