import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { HomeRevealDirective } from '../../directives/home-reveal.directive';

@Component({
  selector: 'tech-stack-section',
  imports: [TerminalSection, AppTitle, HomeRevealDirective],
  templateUrl: './tech-stack-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tech-stack-section.scss',
})
export class TechStackSection {}
