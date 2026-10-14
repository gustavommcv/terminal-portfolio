import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports: [TerminalSection, TranslatePipe],
  templateUrl: './error-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  /** The path that was not found; the query string and fragment are not part of a "command". */
  currentPath = '';

  constructor(private router: Router) {
    this.currentPath = this.router.url.split(/[?#]/)[0];
  }
}
