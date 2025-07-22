import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('portfolio');

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
  ) {
    translate.addLangs(['en', 'pt']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const locale = params['locale'];

      if (locale) {
        const lang = locale.split('_')[0];
        if (this.translate.getLangs().includes(lang)) {
          this.translate.use(lang);
        }
      } else {
        this.translate.use('en');
      }
    });
  }
}
