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
