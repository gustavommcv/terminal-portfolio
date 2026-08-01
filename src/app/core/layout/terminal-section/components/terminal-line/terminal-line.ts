import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-terminal-line',
  imports: [],
  templateUrl: './terminal-line.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './terminal-line.scss',
})
export class TerminalLine {
  short = input(false);
  command = input('whoami');
  accessibleCommand = input<string | undefined>(undefined);
  showCursor = input(false);
  cursorBlinkIntervalMs = input(500);
  error = input(false);

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
