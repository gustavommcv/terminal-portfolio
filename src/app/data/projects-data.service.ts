import { Service } from '@angular/core';
import { projectsData } from './projects.data';

@Service()
export class ProjectsDataService {
  getProjectById(id: string) {
    return projectsData.find((project) => project.id === id);
  }

  getAllProjects() {
    return projectsData;
  }

  getFeaturedProjects() {
    return projectsData.filter((project) => project.featured);
  }
}
