import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'featured-projects-section',
  imports: [TranslateModule, TerminalSection],
  templateUrl: './featured-projects-section.html',
  styleUrl: './featured-projects-section.scss',
})
export class FeaturedProjectsSection { }
