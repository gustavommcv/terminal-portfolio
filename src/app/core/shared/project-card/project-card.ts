import { Component, Input } from '@angular/core';
import { Project } from '../../../data/projects.data';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'project-card',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  @Input() project!: Project;

  constructor(public language: LanguageService) {}

  navigateToDetail() {
    this.language.navigateWithLocale('/projects/' + this.project.id);
  }
}
