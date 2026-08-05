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
  currentPath = '';

  constructor(private router: Router) {
    this.currentPath = this.router.url;
  }
}
