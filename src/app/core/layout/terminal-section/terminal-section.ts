import { Component, input } from '@angular/core';
import { TerminalLine } from './components/terminal-line/terminal-line';

@Component({
  selector: 'app-terminal-section',
  imports: [TerminalLine],
  templateUrl: './terminal-section.html',
  styleUrl: './terminal-section.scss',
})
export class TerminalSection {
  readonly customTitle = input.required<string>();
  readonly isFirstTitle = input(false);

  readonly shortTerminalLine = input(false);
  readonly customCommand = input('whoami');
  readonly accessibleCommand = input<string | undefined>(undefined);
  readonly showCursor = input(false);
  readonly cursorBlinkIntervalMs = input(500);
  readonly errorCommand = input(false);
}
