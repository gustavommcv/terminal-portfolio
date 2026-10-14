import { ComponentFixture, TestBed } from '@angular/core/testing';

import { projectsData } from '../../../data/projects.data';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  let component: PortfolioPage;
  let fixture: ComponentFixture<PortfolioPage>;

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

  it('uses a project cover for its card image, and the first gallery image otherwise', () => {
    const srcOf = (id: string) =>
      fixture.nativeElement
        .querySelector(`.project-card[href="/portfolio/${id}"] img`)
        .getAttribute('src');

    expect(srcOf('mangabound')).toBe(
      'images/projects/mangabound/images/mangabound-cover.webp',
    );
    expect(srcOf('maquetaria')).toBe(
      'images/projects/maquetaria/images/maquetaria-home.webp',
    );
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
});
