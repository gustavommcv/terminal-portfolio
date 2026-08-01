import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './core/layout/header/header';
import { HomeIntroService } from './features/home/services/home-intro.service';
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
  // Initial-route eligibility is application state, so it must begin observing
  // the router before the first routed component is activated.
  private readonly homeIntro = inject(HomeIntroService);

  // The root owns language initialization; every component consumes the same
  // URL-derived state through LanguageService.
  private readonly language = inject(LanguageService);
}
