import { Component, Input } from '@angular/core';
import { Project } from '../../../data/projects.data';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';


@Component({
  selector: 'project-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  @Input() project!: Project;

  constructor(public language: LanguageService) {}

  navigateToDetail() {
    this.language.navigateWithLocale('/portfolio/' + this.project.id);
  }
}
