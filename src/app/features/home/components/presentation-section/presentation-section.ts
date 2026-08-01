import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { TranslatePipe } from '@ngx-translate/core';
import { HomeRevealDirective } from '../../directives/home-reveal.directive';

@Component({
  selector: 'presentation-section',
  imports: [TerminalSection, AppButton, TranslatePipe, HomeRevealDirective],
  templateUrl: './presentation-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './presentation-section.scss',
})
export class PresentationSection { }
