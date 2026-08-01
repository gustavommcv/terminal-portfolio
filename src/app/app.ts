import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './core/layout/header/header';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App {
  // The root owns language initialization; every component consumes the same
  // URL-derived state through LanguageService.
  private readonly language = inject(LanguageService);
}
