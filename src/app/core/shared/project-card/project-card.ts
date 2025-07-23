import { Component, Input } from '@angular/core';
import { Project } from '../../../data/projects.data';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'project-card',
  imports: [TranslateModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  @Input() project!: Project;
}
