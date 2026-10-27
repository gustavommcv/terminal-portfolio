import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { catalogEntry } from '../../../../testing/english-catalog';

import { projectsData } from '../../../data/projects.data';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  let component: PortfolioPage;
  let fixture: ComponentFixture<PortfolioPage>;
  const root = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses the first gallery image of a project for its card image', () => {
    const srcOf = (id: string) =>
      fixture.nativeElement
        .querySelector(`.project-card[href="/portfolio/${id}"] img`)
        .getAttribute('src');

    expect(srcOf('manga2ink')).toBe(
      'images/projects/manga2ink/images/manga2ink-cover-refined.webp',
    );
    expect(srcOf('maquetaria')).toBe(
      'images/projects/maquetaria/images/maquetaria-home.webp',
    );
  });

  it('has the page heading as its h1, with the project titles directly below it', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(Array.from(element.querySelectorAll('h1')).map((h) => h.textContent))
      .toEqual(['Portfolio']);
    expect(element.querySelectorAll('h3')).toHaveLength(0);
    expect(element.querySelectorAll('h2')).toHaveLength(projectsData.length);
  });

  it('loads the first row of card images at once and leaves the rest lazy', () => {
    const images = Array.from(
      fixture.nativeElement.querySelectorAll('.project-card img'),
    ) as HTMLImageElement[];

    expect(images.slice(0, 3).map((img) => img.getAttribute('loading'))).toEqual([
      'eager',
      'eager',
      'eager',
    ]);
    expect(images.slice(3).every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
    expect(images[0].getAttribute('fetchpriority')).toBe('high');
    expect(images[3].getAttribute('fetchpriority')).not.toBe('high');
  });

  it('renders one card per project, each linking to its own detail route', () => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.project-card'),
    ) as HTMLAnchorElement[];

    expect(links).toHaveLength(projectsData.length);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      projectsData.map((project) => `/portfolio/${project.id}`),
    );
  });

  const visibleIds = (): string[] =>
    Array.from(root().querySelectorAll<HTMLAnchorElement>('.project-card'))
      .map((link) => (link.getAttribute('href') ?? '').split('/').at(-1)!.split('?')[0]);

  function selectFilter(id: string): void {
    const label = catalogEntry(`projects-page.filters.${id}`);
    const button = Array.from(
      root().querySelectorAll<HTMLButtonElement>('.project-filters__button'),
    ).find((element) => element.textContent?.trim().startsWith(label));
    expect(button).toBeDefined();
    button!.click();
    fixture.detectChanges();
  }

  it.each([
    ['web', 'maquetaria', 'manga2ink'],
    ['desktop', 'manga2ink', 'gomodoro'],
    ['terminal', 'imperial-to-si-converter', 'maquetaria'],
    ['embedded', 'cisc-smart-home', 'imperial-to-si-converter'],
  ])('filters %s and restores the full catalog with All', (filter, included, excluded) => {
    selectFilter(filter);
    expect(visibleIds()).toContain(included);
    expect(visibleIds()).not.toContain(excluded);
    expect(fixture.nativeElement.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
    selectFilter('all');
    expect(visibleIds()).toEqual(projectsData.map((project) => project.id));
  });

  it('finds academic work across embedded, terminal, and web projects', () => {
    selectFilter('academic');
    expect(visibleIds()).toEqual([
      'cisc-smart-home', 'imperial-to-si-converter', 'xp-bootcamp',
      'academic-real-estate', 'academic-swing-login',
    ]);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain(`Showing 5 of ${projectsData.length} projects`);
  });

  it('keeps the active filter and localized project links when switching language', async () => {
    selectFilter('academic');
    TestBed.inject(TranslateService).setTranslation(
      'pt', JSON.parse(readFileSync('public/i18n/pt.json', 'utf8')),
    );
    await TestBed.inject(LanguageService).toggleLanguage();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-pressed="true"]').textContent)
      .toContain('Acadêmicos');
    expect(visibleIds()).toEqual([
      'cisc-smart-home', 'imperial-to-si-converter', 'xp-bootcamp',
      'academic-real-estate', 'academic-swing-login',
    ]);
    const links = Array.from(
      root().querySelectorAll<HTMLAnchorElement>('.project-card'),
    );
    expect(links.every((link) => link.getAttribute('href')?.endsWith('?locale=pt'))).toBe(true);
  });

  it('reports the result count and gives the filtered first row eager images', () => {
    selectFilter('embedded');
    expect(visibleIds()).toEqual(['cisc-smart-home']);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain(`Showing 1 of ${projectsData.length} projects`);
    const image = fixture.nativeElement.querySelector('.project-card img');
    expect(image.getAttribute('loading')).toBe('eager');
    expect(image.getAttribute('src')).toContain('cisc-smart-home-model.webp');
  });
});
