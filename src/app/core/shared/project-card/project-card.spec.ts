import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Project } from '../../../data/projects.data';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  const project: Project = {
    id: 'test-project',
    gallery: ['images/test-project.webp', 'images/test-project-2.webp'],
    links: {},
    stack: [],
  };

  let fixture: ComponentFixture<ProjectCard>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProjectCard] });
    fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', project);
    fixture.detectChanges();
  });

  it('uses a real link instead of a click-only button surrogate', () => {
    const link: HTMLAnchorElement =
      fixture.nativeElement.querySelector('.project-card');

    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/portfolio/test-project');
    expect(link.hasAttribute('role')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
  });

  it('shows the first gallery image when the project has no cover', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('src')).toBe('images/test-project.webp');
  });

  it('shows the cover instead of the gallery when the project has one', () => {
    const withCover = TestBed.createComponent(ProjectCard);
    withCover.componentRef.setInput('project', {
      ...project,
      cover: 'images/test-project-cover.webp',
    });
    withCover.detectChanges();

    const image: HTMLImageElement =
      withCover.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('images/test-project-cover.webp');
  });

  it('titles the card one level below the section it sits in', () => {
    const levelOf = (card: ComponentFixture<ProjectCard>) =>
      card.nativeElement.querySelector('.project-card__title').tagName;

    expect(levelOf(fixture)).toBe('H3');

    const underPageHeading = TestBed.createComponent(ProjectCard);
    underPageHeading.componentRef.setInput('project', project);
    underPageHeading.componentRef.setInput('headingLevel', 2);
    underPageHeading.detectChanges();

    expect(levelOf(underPageHeading)).toBe('H2');
  });

  it('reserves image space and defers below-the-fold work', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('width')).toBe('640');
    expect(image.getAttribute('height')).toBe('360');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('decoding')).toBe('async');
  });
});
