import { Component, input, ChangeDetectionStrategy } from '@angular/core';

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
  error = input(false);

  username = 'guga@';
  hostname = 'arch';
  path = '~';
  prompt = '$';
}
