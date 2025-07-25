import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Project } from '../../../data/projects.data';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectCard } from '../../../core/shared/project-card/project-card';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'portfolio-page',
  imports: [TranslateModule, TerminalSection, ProjectCard],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  projectsData: Project[];

  constructor(
    private projectsService: ProjectsDataService,
    private title: Title,
    private meta: Meta,
  ) {
    this.projectsData = this.projectsService.getAllProjects();
  }

  ngOnInit(): void {
    this.title.setTitle('Portfolio - Gustavo Monnerat');
    this.meta.updateTag({
      name: 'description',
      content: 'Explore selected projects by Gustavo Monnerat.',
    });
  }
}
