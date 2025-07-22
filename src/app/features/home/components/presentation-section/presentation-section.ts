import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'presentation-section',
  imports: [TerminalSection],
  templateUrl: './presentation-section.html',
  styleUrl: './presentation-section.scss',
})
export class PresentationSection { }
