import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Project } from '../../../data/projects.data';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  const project: Project = {
    id: 'test-project',
    image: 'images/test-project.webp',
    links: {},
  };

  let component: ProjectCard;
  let fixture: ComponentFixture<ProjectCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectCard);
    component = fixture.componentInstance;
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
