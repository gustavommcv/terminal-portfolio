import { Component, input } from '@angular/core';

@Component({
  selector: 'app-terminal-section',
  imports: [],
  templateUrl: './terminal-section.html',
  styleUrl: './terminal-section.scss',
})
export class TerminalSection {
  title = input('Who am I');
}
