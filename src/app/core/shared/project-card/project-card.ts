import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Project } from '../../../data/projects.data';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';


@Component({
  selector: 'project-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './project-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  @Input() project!: Project;

  constructor(public language: LanguageService) {}

  navigateToDetail() {
    this.language.navigateWithLocale('/portfolio/' + this.project.id);
  }
}
