import { Component } from '@angular/core';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'app-error-page',
  imports: [TerminalSection],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {}
