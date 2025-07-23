import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { featuredProjectsData } from '../../../../data/projects.data';
import { ProjectCard } from '../../../../core/shared/project-card/project-card';

@Component({
  selector: 'featured-projects-section',
  imports: [TranslateModule, TerminalSection, ProjectCard],
  templateUrl: './featured-projects-section.html',
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection {
  projectsData = featuredProjectsData;
}
