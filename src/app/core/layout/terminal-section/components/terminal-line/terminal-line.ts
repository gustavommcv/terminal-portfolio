import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-terminal-line',
  imports: [],
  templateUrl: './terminal-line.html',
  styleUrl: './terminal-line.scss',
})
export class TerminalLine {
  readonly short = input(false);
  readonly command = input('whoami');
  readonly accessibleCommand = input<string | undefined>(undefined);
  readonly showCursor = input(false);
  readonly animateCursor = input(true);
  readonly cursorBlinkIntervalMs = input(500);
  readonly error = input(false);

  username = 'guga@';
  hostname = 'arch';
  path = '~';
  prompt = '$';

  readonly accessibleLabel = computed(() => {
    const command = this.accessibleCommand();
    if (command === undefined) {
      return null;
    }

    return this.short()
      ? `${this.path} ${this.prompt} ${command}`
      : `[${this.username}${this.hostname} ${this.path}] ${this.prompt} ${command}`;
  });
}
