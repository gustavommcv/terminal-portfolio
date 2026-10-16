import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Footer } from './core/layout/footer/footer';
import { Header } from './core/layout/header/header';
import { HomeIntroService } from './features/home/services/home-intro.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /**
   * The home page types a command before it shows anything else, and the footer
   * waits for it like the rest. Every page a visit starts on has no intro, so
   * there the footer is there from the start.
   */
  protected readonly intro = inject(HomeIntroService);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  /**
   * Moves keyboard focus past the header. A plain `#main` link would resolve
   * against `<base href="/">` and navigate to the home page, so the jump is
   * done by hand.
   */
  skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
