import { Component } from '@angular/core';

@Component({
  selector: 'app-terminal-line',
  imports: [],
  templateUrl: './terminal-line.html',
  styleUrl: './terminal-line.scss',
})
export class TerminalLine {
  username = '[guga@';
  hostname = 'arch';
  path = '~]';
  prompt = '$';
  command = "whoami"
}
