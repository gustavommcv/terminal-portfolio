import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Project } from '../../../data/projects.data';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  const project: Project = {
    id: 'test-project',
    image: 'images/test-project.webp',
    links: {},
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

  it('reserves image space and defers below-the-fold work', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('width')).toBe('640');
    expect(image.getAttribute('height')).toBe('360');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('decoding')).toBe('async');
  });
});
