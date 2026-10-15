import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { projectsData } from '../../../../data/projects.data';
import { FeaturedProjectsSection } from './featured-projects-section';

describe('FeaturedProjectsSection', () => {
  let fixture: ComponentFixture<FeaturedProjectsSection>;

  const root = (): HTMLElement => fixture.nativeElement;
  const featuredIds = projectsData.filter((project) => project.featured).map((project) => project.id);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProjectsSection],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedProjectsSection);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows its title', () => {
    expect(root().querySelector('h2')?.textContent).toContain(
      catalogEntry('home-page.featured-projects-section.title'),
    );
  });

  it('puts the featured projects, and only them, in a carousel named after the section', () => {
    const carousel = root().querySelector('app-carousel .carousel');

    expect(carousel?.getAttribute('aria-label')).toBe(
      catalogEntry('home-page.featured-projects-section.title'),
    );

    const slides = Array.from(root().querySelectorAll('.carousel__slide'));
    expect(slides).toHaveLength(featuredIds.length);
    expect(
      slides.map((slide) =>
        slide.querySelector('a.project-card')?.getAttribute('href'),
      ),
    ).toEqual(featuredIds.map((id) => `/portfolio/${id}`));
  });

  it('no longer tells the visitor to scroll sideways: the carousel has its own buttons', () => {
    expect(root().textContent).not.toMatch(/scroll sideways/i);
    expect(root().querySelector('.featured-projects-section__warning')).toBeNull();
  });
});
