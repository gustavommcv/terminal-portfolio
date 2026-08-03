import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TerminalLine } from './components/terminal-line/terminal-line';

@Component({
  selector: 'app-terminal-section',
  imports: [TerminalLine],
  templateUrl: './terminal-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './terminal-section.scss',
})
export class TerminalSection {
  customTitle = input('Who am I');
  isFirstTitle = input(false);

  shortTerminalLine = input(false);
  customCommand = input('whoami');
  accessibleCommand = input<string | undefined>(undefined);
  showCursor = input(false);
  cursorBlinkIntervalMs = input(500);
  errorCommand = input(false);
}
