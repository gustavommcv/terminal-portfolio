import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'app-error-page',
  imports: [TerminalSection, TranslatePipe],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  private readonly router = inject(Router);

  /** The path that was not found; the query string and fragment are not part of a "command". */
  readonly currentPath = this.router.url.split(/[?#]/)[0];
}
